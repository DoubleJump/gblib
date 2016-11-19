function DebugDraw(GL, buffer_size)
{
	var r = {};
	r.color = Vec4(1,1,1,1);
	r.matrix = Mat4();

	var attributes = 
	{
		position: VertexAttribute(3),
		color: VertexAttribute(4, true)
	};

	var vb = VertexBuffer(null, attributes, BufferUpdateRate.DYNAMIC);
	alloc_vertex_buffer_memory(vb, buffer_size);
    r.lines = Mesh(vb, null, MeshLayout.LINES);
    bind_mesh(GL, r.lines);

    vb = VertexBuffer(null, attributes, BufferUpdateRate.DYNAMIC);
	alloc_vertex_buffer_memory(vb, buffer_size);

    var ib = IndexBuffer(new Uint32Array(buffer_size), BufferUpdateRate.DYNAMIC);
    r.quads = Mesh(vb, ib);
    bind_mesh(GL, r.quads, MeshLayout.TRIANGLES);

	return r;
}

function reset_debug_draw(DD)
{
	mat4_identity(DD.matrix);
	set_vec4(DD.color, 1,1,1,1);
	clear_mesh_buffers(DD.lines);
	clear_mesh_buffers(DD.quads);
}

function render_debug_draw(GL, DD, camera)
{
	var shader = assets.shaders.basic;
	update_mesh(GL, DD.lines);
	update_mesh(GL, DD.quads);

	use_shader(GL, shader);
	set_uniform(GL, shader.uniforms.mvp, camera.view_projection);
	draw_mesh(GL, shader, DD.lines);
	draw_mesh(GL, shader, DD.quads);

	reset_debug_draw(DD);
}

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
/*
function draw_quad(DD, x,y,w,h)
{
	draw_quad_abs(DD, x - (w/2), y - (h/2), w,h); 
}
*/

function gl_push_rect(r, depth, mesh, color, matrix)
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
	d[o+3] = c[0];
	d[o+4] = c[1];
	d[o+5] = c[2];
	d[o+6] = c[3];

	//br
	d[o+7] = r[0] + r[2];
	d[o+8] = r[1] - r[3];
	d[o+9] = z;
	d[o+10] = c[0];
	d[o+11] = c[1];
	d[o+12] = c[2];
	d[o+13] = c[3];

	//tl
	d[o+14] = r[0];
	d[o+15] = r[1];
	d[o+16] = z;
	d[o+17] = c[0];
	d[o+18] = c[1];
	d[o+19] = c[2];
	d[o+20] = c[3];

	//tr
	d[o+21] = r[0] + r[2];
	d[o+22] = r[1];
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
}


function draw_line(DD, a,b)
{
	gl_push_line(a,b, DD.lines, DD.color, DD.matrix);
}

function draw_point(DD, p, size)
{
	var index = vec3_stack.index;

	var a = _Vec3(p[0] - size, p[1], p[2]);
	var b = _Vec3(p[0] + size, p[1], p[2]);
	var c = _Vec3(p[0], p[1] - size, p[2]);
	var d = _Vec3(p[0], p[1] + size, p[2]);

	gl_push_line(a,b, DD.lines, DD.color, DD.matrix);
	gl_push_line(d,c, DD.lines, DD.color, DD.matrix);

	vec3_stack.index = index;
}

function draw_normal(DD, origin, normal, length)
{
	var end = _Vec3();
	vec_mul_f(end, normal, length);
	vec_add(end, origin, end);
	gl_push_line(origin,end, DD.lines, DD.color, DD.matrix);
}
function draw_ray(DD, r)
{
	var end = _Vec3();
	vec_mul_f(end, r.direction, r.length);
	vec_add(end, r.origin, end);
	gl_push_line(r.origin, end, DD.lines, DD.color, DD.matrix);
}
function draw_wire_rect(DD, r)
{
	var index = vec3_stack.index;

	var bl = _Vec3(r[0], r[1]);
	var tl = _Vec3(r[0], r[1] + r[3]);
	var tr = _Vec3(r[0] + r[2], r[1] + r[3]);
	var br = _Vec3(r[0] + r[2], r[1]);

	gl_push_line(bl,tl, DD.lines, DD.color, DD.matrix);
	gl_push_line(tl,tr, DD.lines, DD.color, DD.matrix);
	gl_push_line(tr,br, DD.lines, DD.color, DD.matrix);
	gl_push_line(br,bl, DD.lines, DD.color, DD.matrix);

	vec3_stack.index = index;
}
function draw_wire_cube(DD, width, height, depth)
{
	var x = width / 2.0;
	var y = height / 2.0;
	var z = depth / 2.0;
	var v = _Vec3;
	var l = gl_push_line;
	var o = DD.lines;
	var c = DD.color;
	var m = DD.matrix;

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
function draw_wire_circle(DD, radius, segments)
{
	var theta = TAU / segments;
	var tanf = Math.tan(theta);
	var cosf = Math.cos(theta);

	var index = vec3_stack.index;

	var current = _Vec3(radius, 0, 0);
	var last = _Vec3(radius, 0, 0);

	for(var i = 0; i < segments + 1; ++i)
	{
		gl_push_line(last,current, DD.lines, DD.color, DD.matrix);

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
function draw_wire_sphere(DD, radius)
{
	var q = _Vec4();

	draw_wire_circle(radius, 32);
	quat_set_euler_f(q, 0,90,0);
	mat4_set_rotation(DD.matrix, q);
	draw_wire_circle(DD, radius, 32);

	quat_set_euler_f(q, 90,0,0);
	mat4_set_rotation(DD.matrix, q);
	draw_wire_circle(DD, radius, 32);
	mat4_identity(DD.matrix);
}
function draw_transform(DD, m)
{
	var index = vec3_stack.index;

	var o = _Vec3();
	var e = _Vec3();

	mat4_get_position(o, m);

	set_vec4(DD.color, 1,0,0,1);
	mat4_mul_point(e, m, _Vec3(1,0,0));
	gl_push_line(o,e, DD.lines, DD.color, DD.matrix);
	
	set_vec4(DD.color, 0,1,0,1);
	mat4_mul_point(e, m, _Vec3(0,1,0));
	gl_push_line(o,e, DD.lines, DD.color, DD.matrix);

	set_vec4(DD.color, 0,0,1,1);
	mat4_mul_point(e, m, _Vec3(0,0,1));
	gl_push_line(o,e, DD.lines, DD.color, DD.matrix);

	vec3_stack.index = index;
}
function draw_bounds(DD, b)
{
	mat4_identity(DD.matrix);

	var center = _Vec3();
	aabb_center(center, b);

	mat4_set_position(DD.matrix, center);

	var w = ab.width(b);
	var h = ab.height(b);
	var d = ab.depth(b);

	draw_wire_cube(DD, w,h,d);
	mat4_identity(DD.matrix);
}
function draw_wire_mesh(DD, mesh, matrix)
{
	mat4_eq(DD.matrix, matrix);
	var stride = mesh.vertex_buffer.stride;
	var n = mesh.vertex_count / 3;
	var d = mesh.vertex_buffer.data;
	var c = 0;
	for(var i = 0; i < n; ++i)
	{
		var stack = vec_stack.index;
		var ta = _Vec3(d[c], d[c+1], d[c+2]);
		c += stride;
		var tb = _Vec3(d[c], d[c+1], d[c+2]);
		c += stride;
		var tc = _Vec3(d[c], d[c+1], d[c+2]);
		c += stride;
		gl_push_line(ta,tb, DD.lines, DD.color, DD.matrix);
		gl_push_line(tb,tc, DD.lines, DD.color, DD.matrix);
		gl_push_line(tc,ta, DD.lines, DD.color, DD.matrix);
		vec_stack.index = stack;
	}
	mat4_identity(DD.matrix);
}
function draw_bezier(DD, b, segments)
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
		gl_push_line(last,point, DD.lines, DD.color, DD.matrix);
		vec_eq(last, point);
		t += step;
	}

	vec3_stack.index = index;
}
function draw_rig(DD, rig)
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
		gl_push_line(a,b, DD.lines, DD.color, DD.matrix);
	}
}
function draw_rig_transforms(DD, rig)
{
	var n = rig.joints.length;
	for(var i = 0; i < n; ++i)
	{
		draw_transform(DD, rig.joints[i].world_matrix);
	}
}