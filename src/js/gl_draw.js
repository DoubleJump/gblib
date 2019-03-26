function GL_Draw(buffer_size)
{
	var r = {};
	r.color = Vec4(1,1,1,1);
	r.matrix = Mat4();

	var update_rate = BufferUpdateRate.DYNAMIC;

	// LINES

	var line_attributes =
	{
		position: PositionAttribute(),
		color: ColorAttribute()
	};

	var vb = VertexBuffer(null, line_attributes, update_rate);
	alloc_vertex_buffer_memory(vb, buffer_size);
    r.lines = Mesh(vb, null, MeshLayout.LINES);
    bind_mesh(r.lines);

    // TRIANGLES

 //    var tri_attributes =
 //    {
 //    	position: PositionAttribute(),
 //    	uv: UVAttribute(),
 //    	radius: VertexAttribute(1),
 //    	color: ColorAttribute()
 //    };

 //    vb = VertexBuffer(null, tri_attributes, update_rate);
	// alloc_vertex_buffer_memory(vb, buffer_size);

 //    var ib = IndexBuffer(new Uint32Array(buffer_size), update_rate);
 //    r.triangles = Mesh(vb, ib, MeshLayout.TRIANGLES);
 //    bind_mesh(r.triangles);

    // TEXT

    /*
    r.text_shader = app.assets.shaders.text;
    r.text_style = TextStyle(app.assets.fonts.space_mono);
    r.text = TextMesh(r.text_style, "", 2048);
    */

	return r;
}

function reset_gl_draw(ctx)
{
	mat4_identity(ctx.matrix);
	set_vec4(ctx.color, 1,1,1,1);
	clear_mesh_buffers(ctx.lines);
	//clear_mesh_buffers(ctx.triangles);
	//reset_text(ctx.text);
}

function render_gl_draw(ctx, camera)
{
	if(app.assets.loaded === false) return;

	update_mesh(ctx.lines);
	//update_mesh(ctx.triangles);

	set_shader(app.assets.shaders.basic);
	set_uniform('mvp', camera.view_projection);
	draw_mesh(ctx.lines);

	//use_shader(ctx.tri_shader);
	//set_uniform('mvp', camera.view_projection);
	//draw_mesh(ctx.triangles);

	//update_mesh(ctx.text.mesh);
	//draw_text(ctx.text, ctx.text_shader, camera);

	reset_gl_draw(ctx);
}

function gl_push_vertex(vertex, mesh, color, matrix)
{
	var index = vec3_stack.index;

	var o = mesh.vertex_buffer.offset;
	var d = mesh.vertex_buffer.data;
	var c = color;
	var v = _Vec3();

	mat4_mul_point(v, matrix, vertex);

	d[o]   = v[0];
	d[o+1] = v[1];
	d[o+2] = v[2];
	d[o+3] = c[0];
	d[o+4] = c[1];
	d[o+5] = c[2];
	d[o+6] = c[3];

	vec3_stack.index = index;

	mesh.vertex_buffer.offset += 7;
}

/*
function gl_push_line(start, end, mesh, color, matrix)
{
	var index = vec3_stack.index;

	var o = mesh.vertex_buffer.offset;
	var d = mesh.vertex_buffer.data;
	var c = color;
	var a = _Vec3();
	var b = _Vec3();

	mat4_mul_point(a, matrix, start);
	mat4_mul_point(b, matrix, end);

	d[o]   = a[0];
	d[o+1] = a[1];
	d[o+2] = a[2];

	d[o+3] = c[0];
	d[o+4] = c[1];
	d[o+5] = c[2];
	d[o+6] = c[3];

	d[o+7] = b[0];
	d[o+8] = b[1];
	d[o+9] = b[2];

	d[o+10] = c[0];
	d[o+11] = c[1];
	d[o+12] = c[2];
	d[o+13] = c[3];

	vec3_stack.index = index;

	mesh.vertex_buffer.offset += 14;
}
*/

function gl_push_line_segment(start,end,thickness,depth, mesh, color, matrix)
{
	var d = mesh.vertex_buffer.data;
	var o = mesh.vertex_buffer.offset;
	var c = color;
	var z = depth;

	var index = vec3_stack.index;
	var dir = _Vec3();
	vec_sub(dir, end, start);
	vec_normalized(dir, dir);
	var perp = _Vec3();
	vec_perp(perp, dir);
	vec_mul_f(perp, perp, thickness);

	 //bl
	d[o  ] = start[0] - perp[0];
	d[o+1] = start[1] - perp[1];
	d[o+2] = z;
	d[o+3] = c[0];
	d[o+4] = c[1];
	d[o+5] = c[2];
	d[o+6] = c[3];

	//br
	d[o+7] = end[0] - perp[0];
	d[o+8] = end[1] - perp[1];
	d[o+9] = z;
	d[o+10] = c[0];
	d[o+11] = c[1];
	d[o+12] = c[2];
	d[o+13] = c[3];

	//tl
	d[o+14] = start[0] + perp[0];
	d[o+15] = start[1] + perp[1];
	d[o+16] = z;
	d[o+17] = c[0];
	d[o+18] = c[1];
	d[o+19] = c[2];
	d[o+20] = c[3];

	//tr
	d[o+21] = end[0] + perp[0];
	d[o+22] = end[1] + perp[1];
	d[o+23] = z;
	d[o+24] = c[0];
	d[o+25] = c[1];
	d[o+26] = c[2];
	d[o+27] = c[3];

	mesh.vertex_buffer.offset += 28;

	//indices

	d = mesh.index_buffer.data;

	var i = mesh.index_buffer.offset;
	var ti = mesh.index_buffer.triangle_offset;

	d[i  ] = ti + 0;
	d[i+1] = ti + 1;
	d[i+2] = ti + 3;
	d[i+3] = ti + 0;
	d[i+4] = ti + 3;
	d[i+5] = ti + 2;

	mesh.index_buffer.triangle_offset += 4;
	mesh.index_buffer.offset += 6;

	vec3_stack.index = index;
}

function draw_quad(ctx, p,w,h,r)
{
	var hw = w / 2;
	var hh = h / 2;
	var rect = _Vec4(p[0]-hw,p[1]+hh,w,h);
	gl_push_rect(rect, p[2], r, ctx.triangles, ctx.color, ctx.matrix);
	vec4_stack.index--;
}

function draw_quad_f(ctx, x,y,w,h,r)
{
	var rect = _Vec4(x,y,w,h);
	gl_push_rect(rect, 0.0, r, ctx.triangles, ctx.color, ctx.matrix);
	vec4_stack.index--;
}

function draw_text_f(ctx, x,y, str)
{
	var t = ctx.text;
	t.width = 0;
	t.height = 0;
	t.bounds[0] = x;
    t.px = x;
    t.py = y;
    t.index_start = t.index;
    t.style.color = ctx.color;
    append_text(t, str);
}

function gl_push_rect(r, depth, radius, mesh, color, matrix)
{
	var d = mesh.vertex_buffer.data;
	var o = mesh.vertex_buffer.offset;
	var c = color;
	var z = depth;

	//TODO: mat4 mul

    //bl
	d[o  ] = r[0];
	d[o+1] = r[1] - r[3];
	d[o+2] = z;
	d[o+3] = 0;
	d[o+4] = 0;
	d[o+5] = radius;
	d[o+6] = c[0];
	d[o+7] = c[1];
	d[o+8] = c[2];
	d[o+9] = c[3];

	//br
	d[o+10] = r[0] + r[2];
	d[o+11] = r[1] - r[3];
	d[o+12] = z;
	d[o+13] = 1;
	d[o+14] = 0;
	d[o+15] = radius;
	d[o+16] = c[0];
	d[o+17] = c[1];
	d[o+18] = c[2];
	d[o+19] = c[3];

	//tl
	d[o+20] = r[0];
	d[o+21] = r[1];
	d[o+22] = z;
	d[o+23] = 0;
	d[o+24] = 1;
	d[o+25] = radius;
	d[o+26] = c[0];
	d[o+27] = c[1];
	d[o+28] = c[2];
	d[o+29] = c[3];

	//tr
	d[o+30] = r[0] + r[2];
	d[o+31] = r[1];
	d[o+32] = z;
	d[o+33] = 1;
	d[o+34] = 1;
	d[o+35] = radius;
	d[o+36] = c[0];
	d[o+37] = c[1];
	d[o+38] = c[2];
	d[o+39] = c[3];

	mesh.vertex_buffer.offset += 40;

	//indices

	d = mesh.index_buffer.data;

	var i = mesh.index_buffer.offset;
	var ti = mesh.index_buffer.triangle_offset;

	d[i  ] = ti + 0;
	d[i+1] = ti + 1;
	d[i+2] = ti + 3;
	d[i+3] = ti + 0;
	d[i+4] = ti + 3;
	d[i+5] = ti + 2;

	mesh.index_buffer.triangle_offset += 4;
	mesh.index_buffer.offset += 6;

}

function gl_push_line(ctx, a,b)
{
	gl_push_vertex(a, ctx.lines, ctx.color, ctx.matrix);
	gl_push_vertex(b, ctx.lines, ctx.color, ctx.matrix);
}

function draw_line(ctx, a,b)
{
	gl_push_line(ctx, a,b);
}

function draw_point(ctx, p, size)
{
	var index = vec3_stack.index;

	var a = _Vec3(p[0] - size, p[1], p[2]);
	var b = _Vec3(p[0] + size, p[1], p[2]);
	var c = _Vec3(p[0], p[1] - size, p[2]);
	var d = _Vec3(p[0], p[1] + size, p[2]);
	gl_push_line(ctx, a,b);
	gl_push_line(ctx, c,d);
	vec3_stack.index = index;
}

function draw_normal(ctx, origin, normal, length)
{
	var end = _Vec3();
	vec_mul_f(end, normal, length);
	vec_add(end, origin, end);
	draw_line(ctx, origin,end);
	vec3_stack.index--;
}
function draw_ray(ctx, r)
{
	var end = _Vec3();
	vec_mul_f(end, r.direction, r.length);
	vec_add(end, r.origin, end);
	draw_line(ctx, r.origin, end);
}

function draw_dir(ctx, origin, dir)
{
	var end = _Vec3();
	vec_add(end, origin, dir);
	draw_line(ctx, origin,end);
	vec3_stack.index--;
}

function draw_wire_rect(ctx, r)
{
	var index = vec3_stack.index;

	var bl = _Vec3(r[0], r[1]);
	var tl = _Vec3(r[0], r[1] + r[3]);
	var tr = _Vec3(r[0] + r[2], r[1] + r[3]);
	var br = _Vec3(r[0] + r[2], r[1]);

	gl_push_line(bl,tl, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(tl,tr, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(tr,br, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(br,bl, ctx.lines, ctx.color, ctx.matrix);

	vec3_stack.index = index;
}
function draw_wire_cube(ctx, width, height, depth)
{
	var x = width / 2.0;
	var y = height / 2.0;
	var z = depth / 2.0;
	var v = _Vec3;
	var l = gl_push_line;
	var o = ctx.lines;
	var c = ctx.color;
	var m = ctx.matrix;

	var index = vec3_stack.index;

	l(v(-x,-y,-z), v(-x, y,-z), o,c,m);
	l(v(-x, y,-z), v( x, y,-z), o,c,m);
	l(v( x, y,-z), v( x,-y,-z), o,c,m);
	l(v( x,-y,-z), v(-x,-y,-z), o,c,m);
	l(v(-x,-y, z), v(-x, y, z), o,c,m);
	l(v(-x, y, z), v( x, y, z), o,c,m);
	l(v( x, y, z), v( x,-y, z), o,c,m);
	l(v( x,-y, z), v(-x,-y, z), o,c,m);
	l(v(-x,-y,-z), v(-x,-y, z), o,c,m);
	l(v(-x, y,-z), v(-x, y, z), o,c,m);
	l(v( x, y,-z), v( x, y, z), o,c,m);
	l(v( x,-y,-z), v( x,-y, z), o,c,m);

	vec3_stack.index = index;
}
function draw_wire_circle(ctx, radius, segments)
{
	var theta = TAU / segments;
	var tanf = Math.tan(theta);
	var cosf = Math.cos(theta);

	var index = vec3_stack.index;

	var current = _Vec3(radius, 0, 0);
	var last = _Vec3(radius, 0, 0);

	for(var i = 0; i < segments + 1; ++i)
	{
		//gl_push_vertext(last,current, ctx.lines, ctx.color, ctx.matrix);
		gl_push_vertex(last, ctx.lines, ctx.color, ctx.matrix);
		gl_push_vertex(current, ctx.lines, ctx.color, ctx.matrix);

		vec_eq(last, current);
		var tx = -current[1];
		var ty = current[0];
		current[0] += tx * tanf;
		current[1] += ty * tanf;
		current[0] *= cosf;
		current[1] *= cosf;
	}

	vec3_stack.index = index;
}
function draw_wire_sphere(ctx, radius)
{
	var q = _Vec4();

	draw_wire_circle(radius, 32);
	quat_set_euler_f(q, 0,90,0);
	mat4_set_rotation(ctx.matrix, q);
	draw_wire_circle(ctx, radius, 32);

	quat_set_euler_f(q, 90,0,0);
	mat4_set_rotation(ctx.matrix, q);
	draw_wire_circle(ctx, radius, 32);
	mat4_identity(ctx.matrix);
}
function draw_transform(ctx, m)
{
	var index = vec3_stack.index;

	var o = _Vec3();
	var e = _Vec3();

	mat4_get_position(o, m);

	set_vec4(ctx.color, 1,0,0,1);
	mat4_mul_point(e, m, _Vec3(1,0,0));
	draw_line(ctx, o,e);

	set_vec4(ctx.color, 0,1,0,1);
	mat4_mul_point(e, m, _Vec3(0,1,0));
	draw_line(ctx, o,e);

	set_vec4(ctx.color, 0,0,1,1);
	mat4_mul_point(e, m, _Vec3(0,0,1));
	draw_line(ctx, o,e);

	vec3_stack.index = index;
}
function draw_bounds(ctx, b)
{
	mat4_identity(ctx.matrix);

	var center = _Vec3();
	aabb_center(center, b);

	mat4_set_position(ctx.matrix, center);

	var w = ab.width(b);
	var h = ab.height(b);
	var d = ab.depth(b);

	draw_wire_cube(ctx, w,h,d);
	mat4_identity(ctx.matrix);
}

function draw_wire_mesh(ctx, mesh, matrix)
{
//	mat4_eq(ctx.matrix, matrix);

	var vb = mesh.vertex_buffer.data;
	var stride = mesh.vertex_buffer.stride;

	var A = _Vec3();
	var B = _Vec3();
	var C = _Vec3();
	var n = 0;
	var c = 0;

	if(mesh.index_buffer)
	{
		var ib = mesh.index_buffer.data;
		n = mesh.index_buffer.count / 3;

		for(var i = 0; i < n; ++i)
		{
			var ta = ib[c  ] * stride;
			var tb = ib[c+1] * stride;
			var tc = ib[c+2] * stride;

			set_vec3(A, vb[ta], vb[ta+1], vb[ta+2]);
			set_vec3(B, vb[tb], vb[tb+1], vb[tb+2]);
			set_vec3(C, vb[tc], vb[tc+1], vb[tc+2]);

			gl_push_line(A,B, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(B,C, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(C,A, ctx.lines, ctx.color, ctx.matrix);

			c += 3;
		}
	}
	else
	{
		n = mesh.vertex_buffer.count;
		for(var i = 0; i < n; ++i)
		{
			var ta = vb[c  ];
			var tb = vb[c+1];
			var tc = vb[c+2];

			set_vec3(A, vb[ta], vb[ta+1], vb[ta+2]);
			set_vec3(B, vb[tb], vb[tb+1], vb[tb+2]);
			set_vec3(C, vb[tc], vb[tc+1], vb[tc+2]);

			gl_push_line(A,B, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(B,C, ctx.lines, ctx.color, ctx.matrix);
			gl_push_line(C,A, ctx.lines, ctx.color, ctx.matrix);

			c += stride;
		}
	}

	vec3_stack.index -= 3;
//	mat4_identity(ctx.matrix);
}

function draw_wire_camera(ctx, camera)
{
	var index = vec3_stack.index;
	vec_eq(ctx.matrix, camera.world_matrix);

	var hw = 1;
	var hh = 1;
	var z =  0;

	var zero = _Vec3(0,0,1);
	var tl = _Vec3(-hw, hh, z);
	var tr = _Vec3( hw, hh, z);
	var bl = _Vec3(-hw,-hh, z);
	var br = _Vec3( hw,-hh, z);

	var inv = _Mat4();
    mat4_inverse(inv, camera.projection);
    mat4_mul_point(tl, inv, tl);
    mat4_mul_point(tr, inv, tr);
    mat4_mul_point(bl, inv, bl);
    mat4_mul_point(br, inv, br);

	set_vec4(ctx.color, 0.5,0.5,0.5,1.0);
	draw_line(ctx, zero, tl);
	draw_line(ctx, zero, tr);
	draw_line(ctx, zero, bl);
	draw_line(ctx, zero, br);

	draw_line(ctx, tl, tr);
	draw_line(ctx, tr, br);
	draw_line(ctx, br, bl);
	draw_line(ctx, bl, tl);

	set_vec3(bl, -hw * 0.3, hh + 0.1, z);
	set_vec3(br,  hw * 0.3, hh + 0.1, z);
	set_vec3(tl,  0, hh + 0.5, z);
	mat4_mul_point(tl, inv, tl);
    mat4_mul_point(bl, inv, bl);
    mat4_mul_point(br, inv, br);

	draw_line(ctx, bl, tl);
	draw_line(ctx, tl, br);
	draw_line(ctx, br, bl);

	mat4_identity(ctx.matrix);
	vec3_stack.index = index;
}

function draw_bezier(ctx, b, segments)
{
	var index = vec3_stack.index;

	var last = _Vec3();
	bezier_eval(last, b, 0);
	var step = 1 / segments;
	var t = step;
	for(var i = 1; i < segments+1; ++i)
	{
		var point = _Vec3();
		bezier_eval(point, b, t);
		gl_push_line(last,point, ctx.lines, ctx.color, ctx.matrix);
		vec_eq(last, point);
		t += step;
	}

	vec3_stack.index = index;
}
function draw_rig(ctx, rig)
{
	var n = rig.joints.length;
	var a = _Vec3();
	var b = _Vec3();
	for(var i = 0; i < n; ++i)
	{
		var j = rig.joints[i];
		if(j.parent === -1 || j.parent === 0) continue;

		var parent = rig.joints[j.parent];
		mat4_get_position(a, parent.world_matrix);
		mat4_get_position(b, j.world_matrix);
		gl_push_line(a,b, ctx.lines, ctx.color, ctx.matrix);
	}
}
function draw_rig_transforms(ctx, rig)
{
	var n = rig.joints.length;
	for(var i = 0; i < n; ++i)
	{
		draw_transform(ctx, rig.joints[i].world_matrix);
	}
}