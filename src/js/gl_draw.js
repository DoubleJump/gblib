function GLDraw(buffer_size, shader)
{
	var r = {};
	r.color = Vec4(1,1,1,1);
	r.matrix = Mat4();
	r.shader = shader;

	var attributes = 
	{
		position: VertexAttribute(3),
		color: VertexAttribute(4, true)
	};

	var vb = VertexBuffer(null, attributes, BufferUpdateRate.DYNAMIC);
	alloc_vertex_buffer_memory(vb, buffer_size);
    r.lines = Mesh(vb, null, MeshLayout.LINES);
    bind_mesh(r.lines);

    vb = VertexBuffer(null, attributes, BufferUpdateRate.DYNAMIC);
	alloc_vertex_buffer_memory(vb, buffer_size);

    var ib = IndexBuffer(new Uint32Array(buffer_size), BufferUpdateRate.DYNAMIC);
    r.triangles = Mesh(vb, ib, MeshLayout.TRIANGLES);
    bind_mesh(r.triangles);

	return r;
}

function reset_gl_draw(ctx)
{
	mat4_identity(ctx.matrix);
	set_vec4(ctx.color, 1,1,1,1);
	clear_mesh_buffers(ctx.lines);
	clear_mesh_buffers(ctx.triangles);
}

function render_gl_draw(ctx, camera)
{
	var shader = ctx.shader;
	update_mesh(ctx.lines);
	update_mesh(ctx.triangles);

	use_shader(shader);
	set_uniform('mvp', camera.view_projection);
	draw_mesh(shader, ctx.lines);
	draw_mesh(shader, ctx.triangles);

	reset_gl_draw(ctx);
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
function draw_quad(ctx, x,y,w,h)
{
	draw_quad_abs(ctx, x - (w/2), y - (h/2), w,h); 
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


function draw_line(ctx, a,b)
{
	gl_push_line(a,b, ctx.lines, ctx.color, ctx.matrix);
}

function draw_point(ctx, p, size)
{
	var index = vec3_stack.index;

	var a = _Vec3(p[0] - size, p[1], p[2]);
	var b = _Vec3(p[0] + size, p[1], p[2]);
	var c = _Vec3(p[0], p[1] - size, p[2]);
	var d = _Vec3(p[0], p[1] + size, p[2]);

	gl_push_line(a,b, ctx.lines, ctx.color, ctx.matrix);
	gl_push_line(d,c, ctx.lines, ctx.color, ctx.matrix);

	vec3_stack.index = index;
}

function draw_normal(ctx, origin, normal, length)
{
	var end = _Vec3();
	vec_mul_f(end, normal, length);
	vec_add(end, origin, end);
	gl_push_line(origin,end, ctx.lines, ctx.color, ctx.matrix);
}
function draw_ray(ctx, r)
{
	var end = _Vec3();
	vec_mul_f(end, r.direction, r.length);
	vec_add(end, r.origin, end);
	gl_push_line(r.origin, end, ctx.lines, ctx.color, ctx.matrix);
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
		gl_push_line(last,current, ctx.lines, ctx.color, ctx.matrix);

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
	gl_push_line(o,e, ctx.lines, ctx.color, ctx.matrix);
	
	set_vec4(ctx.color, 0,1,0,1);
	mat4_mul_point(e, m, _Vec3(0,1,0));
	gl_push_line(o,e, ctx.lines, ctx.color, ctx.matrix);

	set_vec4(ctx.color, 0,0,1,1);
	mat4_mul_point(e, m, _Vec3(0,0,1));
	gl_push_line(o,e, ctx.lines, ctx.color, ctx.matrix);

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
	mat4_eq(ctx.matrix, matrix);
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
		gl_push_line(ta,tb, ctx.lines, ctx.color, ctx.matrix);
		gl_push_line(tb,tc, ctx.lines, ctx.color, ctx.matrix);
		gl_push_line(tc,ta, ctx.lines, ctx.color, ctx.matrix);
		vec_stack.index = stack;
	}
	mat4_identity(ctx.matrix);
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