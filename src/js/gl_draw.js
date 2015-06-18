gb.gl_draw = 
{
	mesh: null,
	offset: null,
	color: null,
	matrix: null,
	shader: null,

	init: function(config)
	{
		var _t = gb.gl_draw;
		var wgl = gb.webgl;
		_t.offset = 0;
		_t.color = new gb.Color(1,1,1,1);
		_t.matrix = new gb.Mat4();

		var m = new gb.Mesh();
		m.layout = wgl.ctx.LINES;
	    var vb = new gb.Vertex_Buffer();
	    vb.mask = 1 | 16;
	    vb.data = new Float32Array(config.buffer_size);
	    vb.update_mode = wgl.ctx.DYNAMIC_DRAW;
	    m.vertex_buffer = vb;
	    m.vertex_count = 0;
	    m.dirty = true;

	    wgl.link_mesh(m);
	    
	    var v_src = "attribute vec3 position;\n attribute vec4 color;\n uniform mat4 mvp;\n varying vec4 _color;\n void main()\n {\n _color = color;\n gl_Position = mvp * vec4(position, 1.0);\n}";

        var f_src = "precision mediump float;\n varying vec4 _color;\n void main()\n {\n gl_FragColor = _color;\n }\n";

        _t.shader = gb.new_shader(v_src, f_src);
        wgl.link_shader(_t.shader);
	    _t.mesh = m;
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
	draw: function(camera)
	{
		var _t = gb.gl_draw;
		var w = gb.webgl;
		w.set_shader(_t.shader);
		w.update_mesh(_t.mesh);
		w.link_attributes(_t.shader, _t.mesh);
		//var mvp = gb.mat4.tmp();
		//gb.mat4.mul(mvp, _t.matrix, camera.view_projection);
		w.set_shader_mat4(_t.shader, "mvp", camera.view_projection);
		w.draw_mesh_arrays(_t.mesh);
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
	/*
	sphere: function(radius, rings, segments)
	{
		var last = gb.vec3.tmp(0,0,0);
		var current = gb.vec3.tmp(0,0,0);
		var lat, lng;

		for(lat = 0; lat <= rings; ++lat)
		{      
            var theta = lat * gb.math.PI / rings;
            var sintheta = gb.math.sin(theta);
            var costheta = gb.math.cos(theta);

            for(lng = 0; lng <= segments; ++lng)
            {
                var phi = lng * 2.0 * gb.math.PI / segments;
                var sinphi = gb.math.sin(phi);
                var cosphi = gb.math.cos(phi);

               	var x = cosphi * sintheta;
              	var y = costheta;
                var z = sinphi * sintheta;

                gb.vec3.set(current, x * radius, y * radius, z * radius);
                _t.line(last, current);
                gb.vec3.eq(last, current);
            }
        }
	},
	*/
	transform: function(m)
	{
		var _t = gb.gl_draw;
		var v3 = gb.vec3;
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
	clear: function()
	{
		var _t = gb.gl_draw;
		gb.mat4.identity(_t.matrix);
		gb.color.set(_t.color, 1,1,1,1);
		_t.offset = 0;
		_t.mesh.vertex_count = 0;
		var n = _t.mesh.vertex_buffer.data.length;
		for(var i = 0; i < n; ++i)
		{
			_t.mesh.vertex_buffer.data[i] = 0;
		}	
	},
}