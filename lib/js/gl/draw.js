gb.gl_draw = 
{
	entity: null,
	offset: null,
	color: null,
	thickness: 1.0,
	matrix: null,

	init: function(config)
	{
		var _t = gb.gl_draw;

		_t.matrix = gb.mat4.new();
		_t.offset = 0;
		_t.color = gb.color.new(1,1,1,1);

		var vb = gb.vertex_buffer.new();
		gb.vertex_buffer.add_attribute(vb, 'position', 3, false);
		gb.vertex_buffer.add_attribute(vb, 'color', 4, true);
		gb.vertex_buffer.alloc(vb, config.buffer_size);
	    _t.mesh = gb.mesh.new(vb, null, 'LINES', 'DYNAMIC_DRAW');

	    var vs = 'attribute vec3 position;attribute vec4 color;uniform mat4 mvp;varying vec4 _color;void main(){_color = color;gl_Position = mvp * vec4(position, 1.0);}';
	    var fs = 'precision highp float;varying vec4 _color;void main(){gl_FragColor = _color;}'; 
		_t.material = gb.material.new(gb.shader.new(vs,fs));
		_t.clear();
	},
	set_matrix: function(m)
	{
		var _t = gb.gl_draw;
		gb.mat4.eq(_t.matrix, m);
	},
	clear: function()
	{
		var _t = gb.gl_draw;
		gb.mat4.identity(_t.matrix);
		gb.color.set(_t.color, 1,1,1,1);
		_t.offset = 0;
		_t.mesh.vertex_count = 0;
		_t.thickness = 1.0;
		var n = _t.mesh.vertex_buffer.data.length;
		for(var i = 0; i < n; ++i)
		{
			_t.mesh.vertex_buffer.data[i] = 0;
		}
	},
	render: function(camera, target)
	{
		var _t = gb.gl_draw;
		var gl = gb.webgl;

		gl.update_mesh(_t.mesh);
		gl.use_shader(_t.material.shader);
		gb.material.set_camera_uniforms(_t.material, camera);
		gb.material.set_matrix_uniforms(_t.material, _t.matrix, camera);
		gl.link_attributes(_t.material.shader, _t.mesh);
		gl.set_uniforms(_t.material);
		gl.set_state(gl.ctx.DEPTH_TEST, false);
		gl.set_render_target(target, false);
		gl.ctx.depthRange(camera.near, camera.far);
		gl.ctx.lineWidth = _t.thickness;
		gl.draw_mesh(_t.mesh);

		_t.clear();
	},
	set_position_f: function(x,y,z)
	{
		var p = gb.vec3.tmp(x,y,z);
		gb.mat4.set_position(gb.gl_draw.matrix, p);
	},
	set_position: function(p)
	{
		gb.mat4.set_position(gb.gl_draw.matrix, p);
	},
	set_color: function(r,g,b,a)
	{
		gb.color.set(gb.gl_draw.color, r,g,b,a);
	},
	line: function(start, end)
	{
		var _t = gb.gl_draw;
		var c = _t.color;
		var o = _t.offset;
		var d = _t.mesh.vertex_buffer.data;

		var stack = gb.vec3.push();

		var a = gb.vec3.tmp();
		var b = gb.vec3.tmp();
		gb.mat4.mul_point(a, _t.matrix, start);
		gb.mat4.mul_point(b, _t.matrix, end);

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

		gb.vec3.pop(stack);

		_t.offset += 14;
		_t.mesh.vertex_count += 2;
		_t.mesh.dirty = true;
	},
	ray: function(r)
	{
		var _t = gb.gl_draw;
		var end = gb.vec3.tmp();
		gb.vec3.add(end, r.point, r.dir);
		_t.line(r.point, end);
	},
	hit: function(h)
	{
		var _t = gb.gl_draw;
		var end = gb.vec3.tmp();
		gb.vec3.add(end, h.point, h.normal);
		_t.line(h.point, end);
	},
	rect: function(r)
	{
		var _t = gb.gl_draw;
		var v3 = gb.vec3;
		var bl = v3.tmp(r.x, r.y);
		var tl = v3.tmp(r.x, r.y + r.height);
		var tr = v3.tmp(r.x + r.width, r.y + r.height);
		var br = v3.tmp(r.x + r.width, r.y);

		_t.line(bl, tl);
		_t.line(tl, tr);
		_t.line(tr, br);
		_t.line(br, bl);
	},
	cube: function(width, height, depth)
	{
		var _t = gb.gl_draw;
		var x = width / 2.0;
		var y = height / 2.0;
		var z = depth / 2.0;
		var v = gb.vec3.tmp;
		var l = _t.line;
		
		var stack = gb.vec3.push();

		l(v(-x,-y,-z), v(-x, y,-z));
		l(v(-x, y,-z), v( x, y,-z));
		l(v( x, y,-z), v( x,-y,-z));
		l(v( x,-y,-z), v(-x,-y,-z));

		l(v(-x,-y, z), v(-x, y, z));
		l(v(-x, y, z), v( x, y, z));
		l(v( x, y, z), v( x,-y, z));
		l(v( x,-y, z), v(-x,-y, z));

		l(v(-x,-y,-z), v(-x,-y, z));
		l(v(-x, y,-z), v(-x, y, z));
		l(v( x, y,-z), v( x, y, z));
		l(v( x,-y,-z), v( x,-y, z));

		gb.vec3.pop(stack);
	},
	circle: function(radius, segments)
	{
		var _t = gb.gl_draw;
		var m = gb.math;
		var v3 = gb.vec3;
		var theta = m.TAU / segments;
		var tanf = m.tan(theta);
		var cosf = m.cos(theta);

		var stack = v3.push();

		var current = v3.tmp(radius, 0, 0);
		var last = v3.tmp(radius, 0, 0);

		for(var i = 0; i < segments + 1; ++i)
		{
			_t.line(last, current);
			v3.eq(last, current);
			var tx = -current[1];
			var ty = current[0];
			current[0] += tx * tanf;
			current[1] += ty * tanf;
			current[0] *= cosf;
			current[1] *= cosf;
		}
		v3.pop(stack);
	},
	sphere: function(radius)
	{
		var _t = gb.gl_draw;
		var v3 = gb.vec3;
		var q = gb.quat.tmp();
		_t.circle(radius, 32);
		gb.quat.euler(q, 0,90,0);
		gb.mat4.set_rotation(_t.matrix, q);
		_t.circle(radius, 32);
		gb.quat.euler(q, 90,0,0);
		gb.mat4.set_rotation(_t.matrix, q);
		_t.circle(radius, 32);
		gb.mat4.identity(_t.matrix);
	},
	transform: function(m)
	{
		var _t = gb.gl_draw;
		var v3 = gb.vec3;
		var index = v3.stack.index;
		var m4 = gb.mat4;
		var o = v3.tmp(0,0,0);
		var e = v3.tmp(0,0,0);

		m4.get_position(o, m);

		_t.set_color(1,0,0,1);
		m4.mul_point(e, m, v3.tmp(1.0,0.0,0.0));
		_t.line(o, e);
		_t.set_color(0,1,0,1);
		m4.mul_point(e, m, v3.tmp(0.0,1.0,0.0));
		_t.line(o, e);
		_t.set_color(0,0,1,1);
		m4.mul_point(e, m, v3.tmp(0.0,0.0,1.0));
		_t.line(o, e);

		v3.stack.index = index;
	},
	bounds: function(b)
	{
		var _t = gb.gl_draw;
		var m4 = gb.mat4;
		var ab = gb.aabb;
		
		m4.identity(_t.matrix);

		var center = gb.vec3.tmp();
		ab.center(center, b);

		m4.set_position(_t.matrix, center);

		var w = ab.width(b);
		var h = ab.height(b);
		var d = ab.depth(b);

		_t.cube(w,h,d);
		m4.identity(_t.matrix);
	},
	wire_mesh: function(mesh, matrix)
	{
		var _t = gb.gl_draw;
		var v3 = gb.vec3;
		var mt = gb.mat4;
		m4.eq(_t.matrix, matrix);
		var stride = mesh.vertex_buffer.stride;
		var n = mesh.vertex_count / 3;
		var d = mesh.vertex_buffer.data;
		var c = 0;
		for(var i = 0; i < n; ++i)
		{
			var stack = v3.push();
			var ta = v3.tmp(d[c], d[c+1], d[c+2]);
			c += stride;
			var tb = v3.tmp(d[c], d[c+1], d[c+2]);
			c += stride;
			var tc = v3.tmp(d[c], d[c+1], d[c+2]);
			c += stride;
			_t.line(ta, tb);
			_t.line(tb, tc);
			_t.line(tc, ta);
			v3.pop(stack);
		}
		m4.identity(_t.matrix);
	},
	bezier: function(b, segments)
	{
		var _t = gb.gl_draw;
		var c = gb.bezier;
		var v3 = gb.vec3;
		var stack = v3.push();
		var last = v3.tmp();
		c.eval(last, b, 0);
		var step = 1 / segments;
		var t = step;
		for(var i = 1; i < segments+1; ++i)
		{
			var point = v3.tmp();
			c.eval(point, b, t);
			_t.line(last, point);
			v3.eq(last, point);
			t += step;
		}
		v3.pop(stack);
	},
	

	rig: function(r)
	{
		var _t = gb.gl_draw;
		var v3 = gb.vec3;
		var n = r.joints.length;
		var a = v3.tmp();
		var b = v3.tmp();
		for(var i = 0; i < n; ++i)
		{
			var j = r.joints[i];
			if(j.parent === -1 || j.parent === 0) continue;

			var parent = r.joints[j.parent];
			m4.get_position(a, parent.world_matrix);
			m4.get_position(b, j.world_matrix);
			_t.line(a,b);
		}
	},
	rig_transforms: function(r)
	{
		var n = r.joints.length;
		for(var i = 0; i < n; ++i)
		{
			var j = r.joints[i];
			gb.gl_draw.transform(j.world_matrix);
		}
	}
}