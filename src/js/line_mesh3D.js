function LineMesh(points, thickness)
{
	var r = Entity();
	r.thickness = thickness || 0.02;
	r.color = Vec4(1.0,1.0,1.0,1.0);
	r.num_points;
	r.points = points || null;
	r.length = 0;
	//r.dash = 200;

	var attributes = 
    {
        position: VertexAttribute(3, false),
        previous: VertexAttribute(3, false),
        next: VertexAttribute(3, false),
        direction: VertexAttribute(1, false),
        //dist: VertexAttribute(1, false)
    };

    var vb = VertexBuffer(null, attributes);
	var ib = IndexBuffer(null);
	r.mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
	bind_mesh(r.mesh);
	update_line_mesh(r);
	return r;
}

function update_line_mesh(lm)
{
	ASSERT(lm.points.length > 1, "Line does not contain enought points");

	var VS = 3;
	var vb = lm.mesh.vertex_buffer;
	var ib = lm.mesh.index_buffer;
	var pts = lm.points;
	var num_points = pts.length / VS;
	var num_faces = num_points - 1;
	var num_node_verts = 2;
	var vertex_count = num_faces * 4;
	var index_count = num_faces * 6;

	if(vb.data === null)
	{
		alloc_vertex_buffer_memory(vb, vertex_count);
		alloc_index_buffer_memory(ib, index_count);
	}

	/*
	if(lm.num_points !== pts.length)
	{
		resize_vertex_buffer(vb, vertex_count, false);
		resize_index_buffer(ib, index_count, false);
		lm.num_points = pts.length;
	}*/

	var stack = vec3_stack.index;

	var current = _Vec3();
	var prev = _Vec3();
	var next = _Vec3();
	//var segment = _Vec3();
	//var distance = 0;
	var flip = 1;

	var index = 0;
	for(var i = 0; i < num_points; ++i)
	{
		var ii = i * VS;

		set_vec3(current, pts[ii], pts[ii+1], pts[ii+2])
		if(i === 0) //first
		{
			set_vec3(prev, pts[0], pts[1], pts[2]);
			set_vec3(next, pts[3], pts[4], pts[5]);
		}
		else if(i === num_points - 1) //last
		{
			set_vec3(prev, pts[ii-3], pts[ii-2], pts[ii-1]);
			set_vec3(next, pts[ii], pts[ii+1], pts[ii+2]);
		}
		else
		{
			set_vec3(prev, pts[ii-3], pts[ii-2], pts[ii-1]);
			set_vec3(next, pts[ii+3], pts[ii+4], pts[ii+5]);
		}

		//vec_sub(segment, current, prev);
		//distance += vec_length(segment);

		for(var j = 0; j < num_node_verts; ++j)
		{
			//current
			vb.data[index] = current[0];
			vb.data[index+1] = current[1];
			vb.data[index+2] = current[2];

			//previous
			vb.data[index+3] = prev[0];
			vb.data[index+4] = prev[1];
			vb.data[index+5] = prev[2];

			//next
			vb.data[index+6] = next[0];
			vb.data[index+7] = next[1];
			vb.data[index+8] = next[2];

			//direction
			vb.data[index+9] = flip;
			flip *= -1;

			//vb.data[index+10] = distance;
			index+=10;
		}
	}
	//lm.length = distance;

	index = 0;
	var offset = 0;
	for(var i = 0; i < num_faces; ++i)
	{
		ib.data[index  ] = offset + 0;
		ib.data[index+1] = offset + 1;
		ib.data[index+2] = offset + 3;
		ib.data[index+3] = offset + 0;
		ib.data[index+4] = offset + 3;
		ib.data[index+5] = offset + 2;
		offset += 2;
		index += 6;
	}
	vec3_stack.index = stack;
	update_mesh(lm.mesh);
}

/*
function draw_line_mesh(lm, shader, camera)
{
    use_shader(shader);

    var mvp = _Mat4();
    mat4_mul(mvp, lm.world_matrix, camera.view_projection);

    set_uniform('mvp', mvp);
    set_uniform('aspect', camera.aspect);
    //set_uniform('start', 0);
    //set_uniform('end', lm.length);
    set_uniform('line_width', lm.thickness);
    set_uniform('color', lm.color);
    //set_uniform('dash', lm.dash);
    draw_mesh(lm.mesh);

    mat4_stack.index--;
}
*/

/*
function line_mesh_ellipse(rx, ry, res)
{
	var points = [];
	var theta = TAU / res;
	for(var i = 0; i < res + 1; ++i)
	{
		var sin_theta = Math.sin(theta * i);
		var cos_theta = Math.cos(theta * i);
		points.push(sin_theta * rx);
		points.push(cos_theta * ry);
		points.push(0.0);
	}
	var r = LineMesh(points);
	return r;
}

function line_mesh_circle(r, res)
{
	return line_mesh_ellipse(r, r, res);
}

function line_mesh_arc(r, start_angle, end_angle, res)
{
	var points = [];
	var start = start_angle;
	var end = end_angle;
	var delta = end - start;
	var step = (delta / res) * DEG2RAD;
	var theta = start_angle * DEG2RAD;
	for(var i = 0; i < res + 1; ++i)
	{
		var sin_theta = Math.sin(theta);
		var cos_theta = Math.cos(theta);
		points.push((sin_theta * r)+r);
		points.push((cos_theta * r));
		points.push(0.0);
		theta += step;
	}
	return LineMesh(points);
}

function line_mesh_curve(curve, res)
{
	var stride = 9;
	var num_curve_nodes = curve.length / 9;
	var num_curve_segments = num_curve_nodes - 1;
	var points = new Float32Array(num_curve_segments * res * 3);

	var src_index = 3;
	var dest_index = 0;
	var step = 1 / res;
	for(var i = 0; i < num_curve_segments; ++i)
	{
		var t = 0;
		var ca = src_index + 0;
		var cb = src_index + 3;
		var cc = src_index + 6;
		var cd = src_index + 9;

		for(var j = 0; j < res+1; ++j)
		{
			var u = 1.0 - t;
			var tt = t * t;
			var uu = u * u;
			var uuu = uu * u;
			var ttt = tt * t;

			for(var k = 0; k < 3; ++k)
			{
				points[dest_index] = (uuu * curve[ca+k]) + 
									 (3 * uu * t * curve[cb+k]) + 
									 (3 * u * tt * curve[cc+k]) + 
					   				 (ttt * curve[cd+k]); 

				dest_index++;
			}
			t += step;
		}
		src_index += stride;
	}
	return LineMesh(points);
}
*/