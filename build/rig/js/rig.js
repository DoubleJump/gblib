'use strict';

//DEBUG
function ASSERT(expr, message)
{
    if(expr === false) console.error(message);
}
function LOG(message)
{
	console.log(message);
}
function EXISTS(val)
{
	return val !== null && val !== undefined;
}
//END

var gb = 
{
	config:
	{
		frame_skip: false,
		update: null,
		render: null,
		gl:
		{
			container: document.querySelector('.webgl'),
			width: 512,
			height: 512,
			antialias: false,
		},
		gl_draw:
		{
			buffer_size: 2048,
		},
		input:
		{
			root: document,
			keycodes: ['mouse_left', 'up', 'down', 'left', 'right', 'w', 'a', 's', 'd', 'f'],
		},
	},

	allow_update: false,
	has_focus: true,
	do_skip_this_frame: false,

	update: function(t){},
	render: function(){},

	focus: function(e)
	{
		gb.has_focus = true;
		LOG('focus');
	},
	blur: function(e)
	{
		gb.has_focus = false;
		LOG('blur');
	},
	init: function(config)
	{
		for(var k in config.config)
			gb.config[k] = config.config[k];

		for(var k in config.gl)
			gb.config.gl[k] = config.gl[k];

		for(var k in config.input)
			gb.config.input[k] = config.input[k];

		//DEBUG
		for(var k in config.gl_draw)
			gb.config.gl_draw[k] = config.gl_draw[k];
		//END

		gb.input.init(gb.config.input);
		gb.webgl.init(gb.config.gl);
		//DEBUG
		gb.gl_draw.init(gb.config.gl_draw);
		//END

		if(gb.config.update) gb.update = config.config.update;
		if(gb.config.render) gb.render = config.config.render;

		window.onfocus = gb.focus;
		window.onblur = gb.blur;

		requestAnimationFrame(gb._init_time);
	},
	_init_time: function(t)
	{
		gb.time.init(t);
		requestAnimationFrame(gb._update);
	},
	_update: function(t)
	{
		if(gb.config.frame_skip === true)
		{
			if(gb.do_skip_this_frame === true)
			{
				gb.do_skip_this_frame = false;
				requestAnimationFrame(gb._update);
				return;
			}
			gb.do_skip_this_frame = true;
		}
		
		gb.time.update(t);
		if(gb.time.paused || gb.has_focus === false || gb.allow_update === false)
		{
			gb.input.update();
			requestAnimationFrame(gb._update);
			return;
		}
		gb.stack.clear_all();
		
		gb.update(gb.time.dt);
		gb.scene.update(gb.time.dt);
		
		gb.input.update();
		//DEBUG
		gb.webgl.verify_context();
		//END
		gb.render();
		requestAnimationFrame(gb._update);
	},

	has_flag_set: function(mask, flag)
	{
	    return (flag & mask) === flag;
	},
	event_load_progress: function(e)
	{
		var percent = e.loaded / e.total;
		LOG('Loaded: ' + e.loaded + ' / ' + e.total + ' bytes');
	},
}

gb.stack_array = [];
gb.Stack = function(type, count)
{
	this.data = [];
	this.index = 0;
	this.count = count;

	for(var i = 0; i < count; ++i)
		this.data.push(new type());

	gb.stack.active_stacks.push(this);
}
gb.stack = 
{
	active_stacks : [],
	get: function(s)
	{
		var r = s.data[s.index];
		s.index += 1;
		if(s.index === s.count)
		{
			console.error("Stack overflow");
		}
		return r;
	},
	clear_all: function()
	{
		var n = gb.stack.active_stacks.length;
		for(var i = 0; i < n; ++i)
			gb.stack.active_stacks[i].index = 0;
	},
}
gb.time = 
{
	start: 0,
    elapsed: 0,
    now: 0,
    last: 0,
    dt: 0,
    at: 0,
    scale: 1,
    paused: false,

    init: function(t)
    {
        var _t = gb.time;
    	_t.time_elapsed = 0;
        _t.start = t;
    },
    update: function(t)
    {
        var _t = gb.time;
    	_t.now = t;
    	_t.dt = ((t - _t.last) / 1000) * _t.scale;
    	_t.last = t;
        _t.at += _t.dt * _t.scale;
        if(_t.at > 1) _t.at -=1;
    },
}
gb.math = 
{
	E: 2.71828182845904523536028747135266250,
	PI: 3.14159265358979323846264338327950288,
	TAU: 6.28318530718,
	DEG2RAD: 0.01745329251,
	RAD2DEG: 57.2957795,
	PI_OVER_360: 0.00872664625,
	EPSILON: 2.2204460492503131e-16,
	MAX_F32: 3.4028234e38,

	min: function(a, b)
	{
		if(a < b) return a; else return b;
	},
	max: function(a, b)
	{
		if(a > b) return a; else return b;
	},
	round: function(a)
	{
		return Math.round(a);
	},
	round_to: function(a, f)
	{
		return a.toFixed(f);
	},
	floor: function(a)
	{
		return Math.floor(a);
	},
	ceil: function(a)
	{
		return Math.ceil(a);
	},
	clamp: function(a, min, max)
	{
		if(a < min) return min;
		else if(a > max) return max;
		else return a;
	},
	abs: function(a)
	{
		return Math.abs(a);
	},
	square: function(a)
	{
		return a * a;
	},
	sqrt: function(a)
	{
		return Math.sqrt(a);
	},
	cos: function(a)
	{
		return Math.cos(a);
	},
	sin: function(a)
	{
		return Math.sin(a);
	},
	tan: function(a)
	{
		return Math.tan(a);
	},
	acos: function(a)
	{
		return Math.acos(a);
	},
	asin: function(a)
	{
		return Math.asin(a);
	},
	atan: function(a)
	{
		return Math.atan(a);
	},
	atan2: function(y, x)
	{
		return Math.atan2(y, x);
	},
	lerp: function(a,b,t)
	{
		return (1-t) * a + t * b;
	},
	/*
    hash: function(str)
    {
        var seed = 5381;
        var c;
        var n = str.length;
        var result;
        for(var i = 0; i < n; ++i)
        {
        	c = str[i]; 
            hash = ((hash << 5) + hash) + c;
        }
        return result;
    }
    */
}
gb.Binary_Reader = function(buffer)
{
	this.buffer = buffer;
	this.bytes = new DataView(buffer);
	this.offset = 0;
}

gb.binary_reader =
{
	b32: function(br)
	{
		var r = br.bytes.getInt32(br.offset, true);
		br.offset += 4;
		if(r === 1) return true;
		return false;
	},
	i32: function(br)
	{
		var r = br.bytes.getInt32(br.offset, true);
		br.offset += 4;
		return r;
	},
	u32: function(br)
	{
		var r = br.bytes.getUint32(br.offset, true);
		br.offset += 4;
		return r;
	},
	f32: function(br)
	{
		var r = br.bytes.getFloat32(br.offset, true);
		br.offset += 4;
		return r;
	},
	string: function(br)
	{
		var _t = gb.binary_reader;
		var pad = _t.i32(br);
        var l = _t.i32(br);
    	var r = String.fromCharCode.apply(null, new Uint8Array(br.buffer, br.offset, l));
        br.offset += l;
        br.offset += pad;
        return r;
	},
	f32_array: function(br, l)
	{
		var r = new Float32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	u8_array: function(br, l)
	{
		var r = new Uint8Array(br.buffer, br.offset, l);
		br.offset += l;
		return r;
	},
	u32_array: function(br, l)
	{
		var r = new Uint32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	i32_array: function(br, l)
	{
		var r = new Int32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	vec3: function(br)
	{
		return gb.binary_reader.f32_array(br, 3);
	},
	vec4: function(br)
	{
		return gb.binary_reader.f32_array(br, 4);
	},
	mat3: function(br)
	{
		return gb.binary_reader.f32_array(br, 9);
	},
	mat4: function(br)
	{
		return gb.binary_reader.f32_array(br, 16);
	},
}
gb.Vec2 = function(x,y)
{
	return new Float32Array(2);
}

gb.Vec3 = function()
{
	return new Float32Array(3);
}

gb.vec2 = 
{
	stack: new gb.Stack(gb.Vec2, 20),

	new: function(x,y)
	{
		var r = new gb.Vec2();
		r[0] = x;
		r[1] = y;
		return r;
	},
	set: function(v, x,y)
	{
		v[0] = x;
		v[1] = y;
	},
	eq: function(a,b)
	{
		a[0] = b[0];
		a[1] = b[1];
	},
	tmp: function(x,y)
	{
		var _t = gb.vec2;
		var r = gb.stack.get(_t.stack);
		_t.set(r, x || 0, y || 0);
		return r;
	},
	add: function(r, a,b)
	{
		var x = a[0] + b[0];
		var y = a[1] + b[1];
		r[0] = x;
		r[1] = y;
	},
	sub: function(r, a,b)
	{
		var x = a[0] - b[0];
		var y = a[1] - b[1];
		r[0] = x;
		r[1] = y;
	},
	mulf: function(r, a,f)
	{
		var x = a[0] * f;
		var y = a[1] * f;
		r[0] = x;
		r[1] = y;
	},
	divf: function(r, a,f)
	{
		var x = a[0] / f;
		var y = a[1] / f;
		r[0] = x;
		r[1] = y;
	},
	inverse: function(r, a)
	{
		r[0] = -a[0];
		r[1] = -a[1];
	},
	sqr_length: function(v)
	{
		return v[0] * v[0] + v[1] * v[1];
	},
	length: function(v) 
	{
		return gb.math.sqrt(gb.vec2.sqr_length(v));
	},
	distance: function(a, b)
	{
		return gb.math.sqrt(gb.vec2.sqr_distance(a,b));
	},
	sqr_distance: function(a, b)
	{
		var dx = b[0] - a[0];
		var dy = b[1] - a[1];
		return dx * dx + dy * dy;
	},
	normalized: function(r, v) 
	{
		var _t = gb.vec2;
		var l = _t.sqr_length(v);
		var x, y;
		if(l > gb.math.EPSILON)
		{
			var il = gb.math.sqrt(1/l);
			x = v[0] * il;
			y = v[1] * il;
		} 
		else
		{
			x = v[0];
			y = v[1]; 
		}
		_t.set(r,x,y);
	},
	dot: function(a, b)
	{
		return a[0] * b[0] + a[1] * b[1];
	},
	perp: function(r, a)
	{
		var _t = gb.vec2;
		var x = -a[1];
		var y = a[0];
		_t.set(r,x,y);
		_t.normalized(r,r);
	},
	angle: function(a, b)
	{
		var _t = gb.vec2;
		var m = gb.math;
		var l = _t.length(a) * _t.length(b);

		if(l < m.EPSILON) l = m.EPSILON;
		
		var f = _t.dot(a, b) / l;
		if(f > 1) return m.acos(1);
		else if(f < 1) return m.acos(-1);
		else return m.acos(f);
	},
	min: function(r, a,b)
	{
		var m = gb.math;
		r[0] = m.min(a[0], b[0]);
		r[1] = m.min(a[1], b[1]);
	},
	max: function(r, a,b)
	{
		var m = gb.math;
		r[0] = m.max(a[0], b[0]);
		r[1] = m.max(a[1], b[1]);
	},
	lerp: function(r, a,b, t)
	{
		var it = 1-t;
		r[0] = it * a[0] + t * b[0];
		r[1] = it * a[1] + t * b[1];
	},
	clamp: function(r, min_x, min_y, max_x, max_y)
	{
		if(r[0] < min_x) r[0] = min_x;
		if(r[0] > max_x) r[0] = max_x;
		if(r[1] < min_y) r[1] = min_y;
		if(r[1] > max_y) r[1] = max_y;
	}
}

gb.vec3 = 
{
	stack: new gb.Stack(gb.Vec3, 64),

	new: function(x,y,z)
	{
		var r = new gb.Vec3();
		r[0] = x || 0;
		r[1] = y || 0;
		r[2] = z || 0;
		return r;
	},
	push: function()
	{
		return gb.vec3.stack.index;
	},
	pop: function(index)
	{
		gb.vec3.stack.index = index;
	},
	set: function(v, x,y,z)
	{
		v[0] = x;
		v[1] = y;
		v[2] = z;
	},
	eq: function(a,b)
	{
		a[0] = b[0];
		a[1] = b[1];
		a[2] = b[2];
	},
	tmp: function(x,y,z)
	{
		var _t = gb.vec3;
		var r = gb.stack.get(_t.stack);
		_t.set(r, x || 0, y || 0, z || 0);
		return r;
	},
	add: function(r, a,b)
	{
		r[0] = a[0] + b[0];
		r[1] = a[1] + b[1];
		r[2] = a[2] + b[2];
	},
	sub: function(r, a,b)
	{
		r[0] = a[0] - b[0];
		r[1] = a[1] - b[1];
		r[2] = a[2] - b[2];
	},
	mulf: function(r, a,f)
	{
		r[0] = a[0] * f;
		r[1] = a[1] * f;
		r[2] = a[2] * f;
	},
	divf: function(r, a,f)
	{
		r[0] = a[0] / f;
		r[1] = a[1] / f;
		r[2] = a[2] / f;
	},
	inverse: function(r, v)
	{
		var x = -v[0];
		var y = -v[1];
		var z = -v[2];
		gb.vec3.set(r, x,y,z);
	},
	sqr_length: function(v)
	{
		return gb.vec3.dot(v,v);
	},
	length: function(v) 
	{
		return gb.math.sqrt(gb.vec3.sqr_length(v));
	},
	normalized: function(r, v) 
	{
		var _t = gb.vec3;
		var l = _t.sqr_length(v);
		if(l > gb.math.EPSILON)
		{
			_t.mulf(r, v, gb.math.sqrt(1 / l));
		} 
		else
		{
			_t.eq(r,v);
		}
	},
	dot: function(a, b)
	{
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	},
	cross: function(r, a, b)
	{
		r[0] = a[1] * b[2] - a[2] * b[1];
		r[1] = a[2] * b[0] - a[0] * b[2];
		r[2] = a[0] * b[1] - a[1] * b[0];
	},
	angle: function(a, b)
	{
		var _t = gb.vec3;
		var m = gb.math;
		var l = _t.length(a) * _t.length(b);

		if(l < m.EPSILON) l = m.EPSILON;
		
		var f = _t.dot(a, b) / l;
		if(f > 1) return m.acos(1);
		else if(f < 1) return m.acos(-1);
		else return m.acos(f);
	},
	min: function(r, a,b)
	{
		var m = gb.math;
		r[0] = m.min(a[0], b[0]);
		r[1] = m.min(a[1], b[1]);
		r[2] = m.min(a[2], b[2]);
	},
	max: function(r, a,b)
	{
		var m = gb.math;
		r[0] = m.max(a[0], b[0]);
		r[1] = m.max(a[1], b[1]);
		r[2] = m.max(a[2], b[2]);
	},
	reflect: function(r, a,n)
	{
		var _t = gb.vec3;
		_t.add(r, v,n);
		_t.mulf(r, -2.0 * _t.dot(v,n)); 
	},
	project: function(r, a,b)
	{
		var _t = gb.vec3;
		_t.mulf(r, _t.dot(a,b));
		var sqr_l = _t.sqr_length(r);
		if(sqr_l < 1)
		{
			_t.divf(r, gb.math.sqrt(sqr_l));
		}
	},
	tangent: function(r, a,b, plane)
	{
		var _t = gb.vec3;
		var t = v3.tmp();
		_t.add(t, b,a);
		_t.normalized(t,t);
		_t.cross(r, t,plane);
		_t.stack.index--;
	},
	rotate: function(r, v,q)
	{
		var tx = (q[1] * v[2] - q[2] * v[1]) * 2;
		var ty = (q[2] * v[0] - q[0] * v[2]) * 2;
		var tz = (q[0] * v[1] - q[1] * v[0]) * 2;

		var cx = q[1] * tz - q[2] * ty;
		var cy = q[2] * tx - q[0] * tz;
		var cz = q[0] * ty - q[1] * tx;

		r[0] = v[0] + q[2] * tx + cx,
		r[1] = v[1] + q[2] * ty + cy,
		r[2] = v[2] + q[2] * tz + cz
	},
	lerp: function(r, a,b, t)
	{
		var it = 1-t;
		r[0] = it * a[0] + t * b[0];
		r[1] = it * a[1] + t * b[1];
		r[2] = it * a[2] + t * b[2];
	},
}
gb.Quat = function(x,y,z,w)
{
	return new Float32Array(4);
}
gb.quat = 
{
	stack: new gb.Stack(gb.Quat, 5),

	new: function()
	{
		var r = new gb.Quat();
		r[3] = 1;
		return r;
	},
	set: function(v, x,y,z,w)
	{
		v[0] = x;
		v[1] = y;
		v[2] = z;
		v[3] = w;
	},
	eq: function(a,b)
	{
		a[0] = b[0];
		a[1] = b[1];
		a[2] = b[2];
		a[3] = b[3];
	},
	tmp: function(x,y,z,w)
	{
		var _t = gb.quat;
		var r = gb.stack.get(_t.stack);
		_t.set(r, x || 0, y || 0, z || 0, w || 1);
		return r;
	},
	mul: function(r, a,b)
	{
		var x = a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1];
		var y = a[3] * b[1] + a[1] * b[3] + a[2] * b[0] - a[0] * b[2];
		var z = a[3] * b[2] + a[2] * b[3] + a[0] * b[1] - a[1] * b[0];
		var w = a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2];

		gb.quat.set(r, x,y,z,w);
	},
	mulf: function(r, q,f)
	{
		r[0] = q[0] * f;
		r[1] = q[1] * f;
		r[2] = q[2] * f;
		r[3] = q[3] * f;
	},

	divf: function(r, q,f)
	{
		r[0] = q[0] / f;
		r[1] = q[1] / f;
		r[2] = q[2] / f;
		r[3] = q[3] / f;
	},

	dot: function(a, b)
	{
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
	},

	sqr_length:function(q)
	{
		return gb.quat.dot(q, q);
	},

	length:function(q)
	{
		return gb.math.sqrt(qb.quat.sqr_length(q));
	},

	normalized:function(r, q)
	{
		var _t = gb.quat;
		var l = qt.sqr_length(q);
		if(l > gb.math.EPSILON) qt.mulf(r, q, 1.0 / l);
		else qt.eq(r, q);
	},

	conjugate:function(r, q) 
	{
		r[0] = -q[0];
		r[1] = -q[1];
		r[2] = -q[2];
		r[3] = -q[3];
	},

	inverse:function(r, q)
	{
		var _t = gb.quat;
		var t = _t.tmp(0,0,0,1);
		_t.normalized(r, _t.conjugate(t,q));
	},

	euler:function(r, x,y,z)
	{
		var m = gb.math;
		var xr = x * m.DEG2RAD / 2;
		var yr = y * m.DEG2RAD / 2;
		var zr = z * m.DEG2RAD / 2;

		var sx = m.sin(xr);
		var sy = m.sin(yr);
		var sz = m.sin(zr);
		var cx = m.cos(xr);
		var cy = m.cos(yr);
		var cz = m.cos(zr);

		r[0] = sx * cy * cz - cx * sy * sz;
		r[1] = cx * sy * cz + sx * cy * sz;
		r[2] = cx * cy * sz - sx * sy * cz;
		r[3] = cx * cy * cz + sx * sy * sz;
	},

	get_euler:function(r, q)
	{
		var m = gb.math;
		var tolerance = 0.499;
		var test = q[0] * q[1] + q[2] * q[3];
		var x, y, z = 0;
		if(test > tolerance)
		{ 
			x = 2 * m.atan2(q[0], q[3]);
			y = m.PI / 2; 
			z = 0;
		}
		else if(test < -tolerance)
		{ 
			x = -2 * m.atan2(q[0], q[3]);
			y = -m.PI / 2;
			z = 0;
		}
		else
		{
			var sqx = q[0] * q[0];
			var sqy = q[1] * q[1];
			var sqz = q[2] * q[2];

			x = m.atan2(2 * q[1] * q[3] - 2 * q[0] * q[2], 1 - 2 * sqy - 2 * sqz);
			y = m.asin(2 * test);
			z = m.atan2(2 * q[0] * q[3] - 2 * q[1] * q[2], 1 - 2 * sqx - 2 * sqz);
		}
		gb.vec3.set(r, x,y,z);
	},

	angle_axis:function(r, angle, axis)
	{
		var m = gb.math;
		var radians = angle * m.DEG2RAD;
		var h = 0.5 * radians;
		var s = m.sin(h);	
		r[0] = s * axis[0];
		r[1] = s * axis[1];
		r[2] = s * axis[2];
		r[3] = m.cos(h);
	},

	get_angle_axis:function(q, angle, axis)
	{
		var m = gb.math;
		var sqrl = gb.quat.sqr_length(q);
		if(sqr_l > 0)
		{
			var i = 1 / m.sqrt(sqr_l);
			angle = (2 * m.acos(q[3])) * m.RAD2DEG;
			axis[0] = q[0] * i;
			axis[1] = q[1] * i;
			axis[2] = q[2] * i;
		}
		else
		{
			angle = 0;
			gb.vec3.set(axis, 1,0,0);
		}
	},
	
	from_to:function(r, from, to)
	{
		var _t = gb.quat;
		var v3 = gb.vec3;
		var fn = v3.tmp();
		var tn = v3.tmp();
		var c = v3.tmp();

		v3.normalized(fn, from);
		v3.normalized(tn, to);
		v3.cross(c, fn, tn);
			
		var t = _t.tmp();
		t[0] = c[0];
		t[1] = c[1];
		t[2] = c[2];
		t[3] = 1 + v3.dot(fn, tn);

		_t.normalized(r,t);
	},

	lerp: function(r, a,b, t)
	{
		var it = 1-t;
		r[0] = it * a[0] + t * b[0];
		r[1] = it * a[1] + t * b[1];
		r[2] = it * a[2] + t * b[2];
		r[3] = it * a[3] + t * b[3];
	},
}
gb.Mat3 = function()
{
	return new Float32Array(9);
}
gb.Mat4 = function()
{
	return new Float32Array(16);
}

gb.mat3 =
{
	stack: new gb.Stack(gb.Mat3, 16),

	new: function()
	{
		var _t = gb.mat3;
		var r = new gb.Mat3();
		_t.identity(r);
		return r;		
	},
	eq: function(a,b)
	{
		for(var i = 0; i < 9; ++i)
			a[i] = b[i];
	},
	tmp: function()
	{
		var _t = gb.mat3;
		var r = gb.stack.get(_t.stack);
		_t.identity(r);
		return r;
	},
	from_mat4: function(r, m)
	{
		r[0] = m[0]; 
		r[1] = m[1]; 
		r[2] = m[2];
		r[3] = m[4]; 
		r[4] = m[5]; 
		r[5] = m[6];
		r[6] = m[8]; 
		r[7] = m[9]; 
		r[8] = m[10];
	},

	identity: function(m)
	{
		m[0] = 1; m[1] = 0; m[2] = 0;
		m[3] = 0; m[4] = 1; m[5] = 0;
		m[6] = 0; m[7] = 0; m[8] = 1;
	},

	determinant: function(m)
	{
		return m[0] * (m[4] * m[8] - m[5] * m[7]) -
	      	   m[1] * (m[3] * m[8] - m[5] * m[6]) +
	      	   m[2] * (m[3] * m[7] - m[4] * m[6]);
	},

	inverse: function(r, m)
	{
		var math = gb.math;
		var _t = gb.mat3;
		var t = _t.tmp();

	    t[0] = m[4] * m[8] - m[5] * m[7];
	    t[1] = m[2] * m[7] - m[1] * m[8];
	    t[2] = m[1] * m[5] - m[2] * m[4];
	    t[3] = m[5] * m[6] - m[3] * m[8];
	    t[4] = m[0] * m[8] - m[2] * m[6];
	    t[5] = m[2] * m[3] - m[0] * m[5];
	    t[6] = m[3] * m[7] - m[4] * m[6];
	    t[7] = m[1] * m[6] - m[0] * m[7];
	    t[8] = m[0] * m[4] - m[1] * m[3];

	    var det = m[0] * t[0] + m[1] * t[3] + m[2] * t[6];
	    if(math.abs(det) <= math.EPSILON)
	    {
	    	_t.identity(r);
	    }

	   	var idet = 1 / det;
	   	for(var i = 0; i < 9; ++i)
	   		r[i] = t[i] * idet;
	},

	mul: function(r, a,b)
	{
		var _t = gb.mat3;
		var t = _t.tmp();
		t[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
		t[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
		t[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];
		t[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
		t[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
		t[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];
		t[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
		t[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
		t[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];
		_t.eq(r,t);
	},

	transposed: function(r,m)
	{
		var _t = gb.mat3;
		var t = _t.tmp();
		t[1] = m[3];
		t[2] = m[6]; 
		t[3] = m[1];
		t[5] = m[7]; 
		t[6] = m[2]; 
		t[7] = m[5];
		t[8] = m[0];
		for(var i = 0; i < 9; ++i)
	   		r[i] = t[i];		
	},

	set_position: function(m, x, y)
	{
		m[2] = x;
		m[5] = y;
	},

	set_rotation: function(m, r)
	{
		var x2 = 2 * r[0]; 
		var y2 = 2 * r[1]; 
		var z2 = 2 * r[2];
		var xx = r[0] * x2; 
		var xy = r[0] * y2; 
		var xz = r[0] * z2;
		var yy = r[1] * y2;
		var yz = r[1] * z2;
		var zz = r[2] * z2;
		var wx = r[3] * x2; 
		var wy = r[3] * y2;
		var wz = r[3] * z2;

		m[0] = 1 - (yy + zz);
		m[1] = xy + wz;
		m[2] = xz - wy;
		m[3] = xy - wz;
		m[4] = 1 - (xx + zz);
		m[5] = yz + wx;
		m[6] = xz + wy;
		m[7] = yz - wx;
		m[8] = 1 - (xx + yy);
	},

	compose: function(m, x,y, sx,sy, r)
	{
		var theta = r * gb.math.DEG2RAD;
		var st = gb.math.sin(theta);
		var ct = gb.math.cos(theta);

		m[0] = ct * sx;
		m[1] = st;
		m[2] = x;
		m[3] = -st;
		m[4] = ct * sy;
		m[5] = y;
		m[6] = 0;
		m[7] = 0;
		m[8] = 1;
	},
	compose_t: function(m, p, s, r)
	{
		var theta = r * gb.math.DEG2RAD;
		var st = gb.math.sin(theta);
		var ct = gb.math.cos(theta);

		m[0] = ct * s[0];
		m[1] = st;
		m[2] = p[0];
		m[3] = -st;
		m[4] = ct * s[1];
		m[5] = p[1];
		m[6] = 0;
		m[7] = 0;
		m[8] = 1;
	},
}

gb.mat4 =
{
	stack: new gb.Stack(gb.Mat4, 16),

	new: function()
	{
		var _t = gb.mat4;
		var r = new gb.Mat4();
		_t.identity(r);
		return r;		
	},
	eq: function(a,b)
	{
		for(var i = 0; i < 16; ++i)
			a[i] = b[i];
	},
	tmp: function()
	{
		var _t = gb.mat4;
		var r = gb.stack.get(_t.stack);
		_t.identity(r);
		return r;
	},
	identity: function(m)
	{
		m[ 0] = 1; m[ 1] = 0; m[ 2] = 0; m[ 3] = 0;
		m[ 4] = 0; m[ 5] = 1; m[ 6] = 0; m[ 7] = 0;
		m[ 8] = 0; m[ 9] = 0; m[10] = 1; m[11] = 0;
		m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
	},
	mul: function(r, a,b)
	{
		var _t = gb.mat4;
		var i = _t.stack.index;
		var t = _t.tmp();
		t[ 0] = a[ 0] * b[0] + a[ 1] * b[4] + a[ 2] * b[ 8] + a[ 3] * b[12];
		t[ 1] = a[ 0] * b[1] + a[ 1] * b[5] + a[ 2] * b[ 9] + a[ 3] * b[13];
		t[ 2] = a[ 0] * b[2] + a[ 1] * b[6] + a[ 2] * b[10] + a[ 3] * b[14];
		t[ 3] = a[ 0] * b[3] + a[ 1] * b[7] + a[ 2] * b[11] + a[ 3] * b[15];
		t[ 4] = a[ 4] * b[0] + a[ 5] * b[4] + a[ 6] * b[ 8] + a[ 7] * b[12];
		t[ 5] = a[ 4] * b[1] + a[ 5] * b[5] + a[ 6] * b[ 9] + a[ 7] * b[13];
		t[ 6] = a[ 4] * b[2] + a[ 5] * b[6] + a[ 6] * b[10] + a[ 7] * b[14];
		t[ 7] = a[ 4] * b[3] + a[ 5] * b[7] + a[ 6] * b[11] + a[ 7] * b[15];	
		t[ 8] = a[ 8] * b[0] + a[ 9] * b[4] + a[10] * b[ 8] + a[11] * b[12];
		t[ 9] = a[ 8] * b[1] + a[ 9] * b[5] + a[10] * b[ 9] + a[11] * b[13];
		t[10] = a[ 8] * b[2] + a[ 9] * b[6] + a[10] * b[10] + a[11] * b[14];
		t[11] = a[ 8] * b[3] + a[ 9] * b[7] + a[10] * b[11] + a[11] * b[15];
		t[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[ 8] + a[15] * b[12];
		t[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[ 9] + a[15] * b[13];
		t[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
		t[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
		_t.eq(r,t);
		_t.stack.index = i;
	},

	determinant: function(m)
	{
		var a0 = m[ 0] * m[ 5] - m[ 1] * m[ 4];
		var a1 = m[ 0] * m[ 6] - m[ 2] * m[ 4];
		var a2 = m[ 0] * m[ 7] - m[ 3] * m[ 4];
		var a3 = m[ 1] * m[ 6] - m[ 2] * m[ 5];
		var a4 = m[ 1] * m[ 7] - m[ 3] * m[ 5];
		var a5 = m[ 2] * m[ 7] - m[ 3] * m[ 6];
		var b0 = m[ 8] * m[13] - m[ 9] * m[12];
		var b1 = m[ 8] * m[14] - m[10] * m[12];
		var b2 = m[ 8] * m[15] - m[11] * m[12];
		var b3 = m[ 9] * m[14] - m[10] * m[13];
		var b4 = m[ 9] * m[15] - m[11] * m[13];
		var b5 = m[10] * m[15] - m[11] * m[14];
		return a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
	},

	transposed: function(r, m)
	{
		r[ 1] = m[ 4]; 
		r[ 2] = m[ 8]; 
		r[ 3] = m[12];
		r[ 4] = m[ 1]; 
		r[ 6] = m[ 9]; 
		r[ 7] = m[13];
		r[ 8] = m[ 2]; 
		r[ 9] = m[ 6]; 
		r[11] = m[14];
		r[12] = m[ 3]; 
		r[13] = m[ 7]; 
		r[14] = m[11];
		r[15] = m[15]; 	
	},
	inverse: function(r, m)
	{
		var v0 = m[ 2] * m[ 7] - m[ 6] * m[ 3];
		var v1 = m[ 2] * m[11] - m[10] * m[ 3];
		var v2 = m[ 2] * m[15] - m[14] * m[ 3];
		var v3 = m[ 6] * m[11] - m[10] * m[ 7];
		var v4 = m[ 6] * m[15] - m[14] * m[ 7];
		var v5 = m[10] * m[15] - m[14] * m[11];

		var t0 =   v5 * m[5] - v4 * m[9] + v3 * m[13];
		var t1 = -(v5 * m[1] - v2 * m[9] + v1 * m[13]);
		var t2 =   v4 * m[1] - v2 * m[5] + v0 * m[13];
		var t3 = -(v3 * m[1] - v1 * m[5] + v0 * m[ 9]);

		var idet = 1.0 / (t0 * m[0] + t1 * m[4] + t2 * m[8] + t3 * m[12]);

		r[0] = t0 * idet;
		r[1] = t1 * idet;
		r[2] = t2 * idet;
		r[3] = t3 * idet;

		r[4] = -(v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
		r[5] =  (v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
		r[6] = -(v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
		r[7] =  (v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;

		v0 = m[1] * m[ 7] - m[ 5] * m[3];
		v1 = m[1] * m[11] - m[ 9] * m[3];
		v2 = m[1] * m[15] - m[13] * m[3];
		v3 = m[5] * m[11] - m[ 9] * m[7];
		v4 = m[5] * m[15] - m[13] * m[7];
		v5 = m[9] * m[15] - m[13] * m[11];

		r[ 8] =  (v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
		r[ 9] = -(v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
		r[10] =  (v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
		r[11] = -(v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;

		v0 = m[ 6] * m[1] - m[ 2] * m[ 5];
		v1 = m[10] * m[1] - m[ 2] * m[ 9];
		v2 = m[14] * m[1] - m[ 2] * m[13];
		v3 = m[10] * m[5] - m[ 6] * m[ 9];
		v4 = m[14] * m[5] - m[ 6] * m[13];
		v5 = m[14] * m[9] - m[10] * m[13];

		r[12] = -(v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
		r[13] =  (v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
		r[14] = -(v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
		r[15] =  (v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;
	},

	inverse_affine: function(r, m)
	{
		var t0 = m[10] * m[5] - m[ 6] * m[9];
		var t1 = m[ 2] * m[9] - m[10] * m[1];
		var t2 = m[ 6] * m[1] - m[ 2] * m[5];

		var idet = 1 / (m[0] * t0 + m[4] * t1 + m[8] * t2);

		t0 *= idet;
		t1 *= idet;
		t2 *= idet;

		var v0 = m[0] * idet;
		var v4 = m[4] * idet;
		var v8 = m[8] * idet;

		r[ 0] = t0; 
		r[ 1] = t1; 
		r[ 2] = t2;
		r[ 3] = 0;
		r[ 4] = v8 * m[ 6] - v4 * m[10];
		r[ 5] = v0 * m[10] - v8 * m[ 2];
		r[ 6] = v4 * m[ 2] - v0 * m[ 6];
		r[ 7] = 0;
		r[ 8] = v4 * m[9] - v8 * m[5];
		r[ 9] = v8 * m[1] - v0 * m[9];
		r[10] = v0 * m[5] - v4 * m[1];
		r[11] = 0;
		r[12] = -(r[0] * m[12] + r[4] * m[13] + r[ 8] * m[14]);
		r[13] = -(r[1] * m[12] + r[5] * m[13] + r[ 9] * m[14]);
		r[14] = -(r[2] * m[12] + r[6] * m[13] + r[10] * m[14]);		
		r[15] = 1;

		return r;
	},

	set_position: function(m, p)
	{
		m[12] = p[0]; 
		m[13] = p[1]; 
		m[14] = p[2];
	},

	get_position: function(r, m)
	{
		r[0] = m[12];
		r[1] = m[13];
		r[2] = m[14];
	},

	set_scale: function(m, s)
	{
		m[ 0] = s[0]; 
		m[ 5] = s[1]; 
		m[10] = s[2];
	},
	scale: function(m, s)
	{
		m[ 0] *= s[0]; 
		m[ 1] *= s[0]; 
		m[ 2] *= s[0];
		m[ 3] *= s[0];
		m[ 4] *= s[1];
		m[ 5] *= s[1];
		m[ 6] *= s[1];
		m[ 7] *= s[1];
		m[ 8] *= s[2];
		m[ 9] *= s[2];
		m[10] *= s[2];
		m[11] *= s[2];
	},
	get_scale: function(r, m)
	{
		r[0] = m[0];
		r[1] = m[5];
		r[2] = m[10];
	},

	set_rotation: function(m, r)
	{
		var x2 = 2 * r[0]; 
		var y2 = 2 * r[1]; 
		var z2 = 2 * r[2];
		var xx = r[0] * x2; 
		var xy = r[0] * y2; 
		var xz = r[0] * z2;
		var yy = r[1] * y2;
		var yz = r[1] * z2;
		var zz = r[2] * z2;
		var wx = r[3] * x2; 
		var wy = r[3] * y2;
		var wz = r[3] * z2;

		m[ 0] = 1 - (yy + zz);
		m[ 1] = xy + wz;
		m[ 2] = xz - wy;
		m[ 3] = 0;
		m[ 4] = xy - wz;
		m[ 5] = 1 - (xx + zz);
		m[ 6] = yz + wx;
		m[ 7] = 0;
		m[ 8] = xz + wy;
		m[ 9] = yz - wx;
		m[10] = 1 - (xx + yy);
		m[11] = 0;
		m[12] = 0;
		m[13] = 0;
		m[14] = 0;
		m[15] = 1;
	},

	get_rotation: function(r, m)
	{
		var t;
		if(m[10] < 0)
		{
			if(m[0] > m[5])
			{
				t = 1 + m[0] - m[5] - m[10];
				r.set(t, m[1] + m[4], m[8] + m[2], m[6] - m[9]);
			}
			else
			{
				t = 1 - m[0] + m[5] - m[10];
				r.set(m[1] + m[4], t, m[6] + m[9], m[8] - m[2]);
			}
		}
		else
		{
			if (m[0] < -m[5])
			{
				t = 1 - m[0] - m[5] + m[10];
				r.set(m[8] + m[2], m[6] + m[9], t, m[1] - m[4]);
			}
			else
			{
				t = 1 + m[0] + m[5] + m[10];
				r.set(m[6] - m[9], m[8] - m[2], m[1] - m[4], t);
			}
		}

		var q = gb.quat;
		var rf = q.tmp();
		q.mulf(rf, r, 0.5);
		q.divf(r, rf, t);
	},

	compose: function(m, p, s, r)
	{
		var _t = gb.mat4;
		_t.set_rotation(m,r);
		_t.scale(m,s);
		_t.set_position(m,p);
	},

	mul_point: function(r, m, p)
	{
		var x = m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12];
		var y = m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13];
		var z = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];
		r[0] = x; r[1] = y; r[2] = z;
	},

	mul_dir: function(r, m, p)
	{
		var x = m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2];
		var y = m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2];
		var z = m[2] * p[0] + m[6] * p[1] + m[10] * p[2];
		r[0] = x; r[1] = y; r[2] = z;
	},

	mul_projection: function(r, m, p)
	{
		var d = 1 / (m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]);
		var x = (m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12]) * d;
		var y = (m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13]) * d;
		var z = (m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]) * d;
		r[0] = x; r[1] = y; r[2] = z;
	},

	ortho_projection: function(m, w,h,n,f)
	{
		m[ 0] = 2.0 / w;
		m[ 5] = 2.0 / h;
		m[10] = -2.0 / (f - n);
		m[11] = -n / (f - n);
		m[15] = 1.0;
	},
	perspective_projection: function(m, f,n,aspect,fov)
	{
		var h = 1.0 / gb.math.tan(fov * gb.math.PI_OVER_360);
		var y = n - f;
		
		m[ 0] = h / aspect;
		m[ 5] = h;
		m[10] = (f + n) / y;
		m[11] = -1.0;
		m[14] = 2.0 * (n * f) / y;
		m[15] = 0.0;
	},
}
gb.projections = 
{
    cartesian_to_polar: function(r, c)
    {
        var radius = gb.vec3.length(c);
        var theta = gb.math.atan2(c[1], c[0]);
        var phi = gb.math.acos(2/radius);
        gb.vec3.set(r, theta, phi, radius);
    },
    polar_to_cartesian: function(r, theta, phi, radius)
    {
        var x = radius * gb.math.cos(theta) * gb.math.sin(phi);
        var y = radius * gb.math.cos(phi);
        var z = radius * gb.math.sin(theta) * gb.math.sin(phi);
        gb.vec3.set(r, x,y,z);
    },

    world_to_screen: function(r, projection, world, view)
    {
    	var wp = gb.vec3.tmp(); 
        gb.mat4.mul_projection(wp, projection, world);
        r[0] = ((wp[0] + 1.0) / 2.0) * view.width;
        r[1] = ((1.0 - wp[1]) / 2.0) * view.height;
    },

    screen_to_view: function(r, point, view)
    {
        r[0] = point[0] / view.width;
        r[1] = 1.0 - (point[1] / view.height);
        r[2] = point[2];
    },

    screen_to_world: function(r, projection, point, view)
    {
        var t = gb.vec3.tmp();
        t[0] = 2.0 * point[0] / view.width - 1.0;
        t[1] = -2.0 * point[1] / view.height + 1.0;
        t[2] = point[2];
            
        var inv = gb.mat4.tmp();
        gb.mat4.inverse(inv, projection);
        gb.mat4.mul_projection(r, inv, t);
    },
}
gb.Rect = function()
{
	this.x;
	this.y;
	this.width;
	this.height;
}
gb.rect = 
{
	stack: new gb.Stack(gb.Rect, 20),

	new: function(x,y,w,h)
	{
		var r = new gb.Rect();
		gb.rect.set(r, x,y,w,h);
		return r;
	},
	set: function(r, x,y,w,h)
	{
		r.x = x || 0;
		r.y = y || 0;
		r.width = w || 0;
		r.height = h || 0;
	},
	eq: function(a,b)
	{
		a.x = b.x;
		a.y = b.y;
		a.width = b.width;
		a.height = b.height;
	},
	tmp: function(x,y,w,h)
	{
		var _t = gb.rect;
		var r = gb.stack.get(_t.stack);
		_t.set(r, x || 0, y || 0, w || 0, h || 0);
		return r;
	},
}
gb.AABB = function()
{
    this.min = gb.vec3.new();
    this.max = gb.vec3.new();
}

gb.aabb = 
{
	stack: new gb.Stack(gb.AABB, 16),

    new: function()
    {
        return new gb.AABB();
    },
    set:function(r, min, max)
    {
        gb.vec3.eq(r.min, min);
        gb.vec3.eq(r.max, max);
    },
    eq:function(a, b)
    {
        gb.aabb.set(a, b.min, b.max);
    },
    setf:function(a, x,y,z)
    {
        a.min[0] = -x / 2;
        a.max[0] = x / 2;
        a.min[1] = -y / 2;
        a.max[1] = y / 2;
        a.min[2] = -z / 2;
        a.max[2] = z / 2;
    },
	tmp: function(min, max)
	{
        var _t = gb.aabb;
        var v = gb.stack.get(_t.stack);
		if(min || max) _t.set(v, min, max);
		return v;
	},
    contains: function(a, b)
    {
        return a.min[0] >= b.min[0] && 
               a.max[0] <= b.max[0] && 
               a.min[1] >= b.min[1] && 
               a.max[1] <= b.max[1] && 
               a.min[2] >= b.min[2] && 
               a.max[2] <= b.max[2];
    },
    combine: function(r, a,b)
    {
        gb.vec3.min(r.min, a.min, b.min);
        gb.vec3.max(r.max, a.max, b.max);
    },
    center: function(r, a)
    {
        r[0] = (a.min[0] + a.max[0]) / 2.0;
        r[1] = (a.min[1] + a.max[1]) / 2.0;
        r[2] = (a.min[2] + a.max[2]) / 2.0;
    },
    width: function(a)
    {
        return a.max[0] - a.min[0];
    },
    height: function(a)
    {
        return a.max[1] - a.min[1];
    },
    depth: function(a)
    {
        return a.max[2] - a.min[2];
    },
    test_min_max: function(p, min, max)
    {
        if(p[0] < min[0]) min[0] = p[0];
        if(p[1] < min[1]) min[1] = p[1];
        if(p[2] < min[2]) min[2] = p[2];

        if(p[0] > max[0]) max[0] = p[0];
        if(p[1] > max[1]) max[1] = p[1];
        if(p[2] > max[2]) max[2] = p[2];        
    },
    transform: function(a, m)
    {
        var _t = gb.aabb;
        var v3 = gb.vec3;
        var m4 = gb.mat4;
        
        var stack = v3.push();

        var e = a.min;
        var f = a.max;

        var p0 = v3.tmp(e[0],e[1],e[2]); 
        var p1 = v3.tmp(f[0],e[1],e[2]);
        var p2 = v3.tmp(e[0],f[1],e[2]);
        var p3 = v3.tmp(f[0],f[1],e[2]);

        var p4 = v3.tmp(e[0],e[1],f[2]); 
        var p5 = v3.tmp(f[0],e[1],f[2]);
        var p6 = v3.tmp(e[0],f[1],f[2]);
        var p7 = v3.tmp(f[0],f[1],f[2]);

        m4.mul_point(p0, m, p0);
        m4.mul_point(p1, m, p1);
        m4.mul_point(p2, m, p2);
        m4.mul_point(p3, m, p3);
        m4.mul_point(p4, m, p4);
        m4.mul_point(p5, m, p5);
        m4.mul_point(p6, m, p6);
        m4.mul_point(p7, m, p7);

        e = v3.tmp(p0[0], p0[1], p0[2]);
        f = v3.tmp(p0[0], p0[1], p0[2]);
        
        _t.test_min_max(p1, e, f);
        _t.test_min_max(p2, e, f);
        _t.test_min_max(p3, e, f);
        _t.test_min_max(p4, e, f);
        _t.test_min_max(p5, e, f);
        _t.test_min_max(p6, e, f);
        _t.test_min_max(p7, e, f);

        v3.eq(a.min, e);
        v3.eq(a.max, f);

        v3.pop(stack);
    },
}
gb.Ray = function()
{
	this.point = gb.vec3.new();
	this.dir = gb.vec3.new();
}
gb.ray = 
{
	stack: new gb.Stack(gb.Ray, 5),

	new: function()
	{
		return new gb.Ray();
	},
	tmp: function(point, dir)
	{
		var r = gb.stack.get(gb.ray.stack);
		gb.ray.set(v, point,dir);
		return v;
	},
	set: function(r, point, dir)
	{
		gb.vec3.eq(r.point, point);
		gb.vec3.eq(r.dir, dir);
	},
	eq: function(a,b)
	{
		gb.ray.set(a, b.point, b.dir);
	},
}
gb.Hit = function()
{
	this.hit = false;
	this.point = gb.vec3.new();
	this.normal = gb.vec3.new();
	this.t = 0;
}
gb.hit = 
{
	stack: new gb.Stack(gb.Hit, 5),

	eq: function(a,b)
	{
		a.hit = b.hit;
		gb.vec3.eq(a.point, b.point);
		gb.vec3.eq(a.normal, b.normal);
		a.t = b.t;
	},
	tmp: function()
	{
		var r = gb.stack.get(gb.hit.stack);
		r.hit = false;
		gb.vec3.set(r.point, 0,0,0);
		gb.vec3.set(r.normal, 0,0,0);
		r.t = 0;
		return r;
	},
}


gb.intersect = 
{
	point_circle: function(h, p, c, r)
	{
		var v2 = gb.vec2;
		var delta = v2.tmp();
		v2.sub(delta, c, p);
		var l = v2.sqr_length(delta);
		if(l < r * r)
		{
			var nl = gb.math.sqrt(l);
			h.hit = true;
			h.t = nl - r;
			var nd = v2.tmp();
			v2.mulf(nd, delta, 1/nl);
			v2.eq(h.normal, nd);
		}
		else 
		{
			h.hit = false;
		}
	},

	line_circle: function(h, c,r, a,b)
	{
		var lax = a[0] - c[0];
		var lay = a[1] - c[1];
		var lbx = b[0] - c[0];
		var lby = b[1] - c[1];

		var sx = lbx - lax;
		var sy = lby - lay;

		var a = sx * sx + sy * sy;
		var b = 2 * ((sx * lax) + (sy * lay));
		var c = (lax * lax) + (lay * lay) - (r * r);
		var delta = b * b - (4 * a * c);
		if(delta < 0)
		{
			h.hit = false;
			return;
		} 

		var sd = gb.math.sqrt(delta);
		var ta = (-b - sd) / (2 * a);

		if(ta < 0 || ta > 1)
		{
			h.hit = false;
			return;
		}

		h.point[0] = a[0] * (1 - ta) + ta * b[0];
        h.point[1] = a[1] * (1 - ta) + ta * b[1];

        /*
		if(delta === 0)
		{
			h.hit = true;
			h.t = t;
            return;
		}
		*/

		var tb = (-b + sd) / (2 * a);

		//draw.text("TA: " + ta, 10, 30)
		//draw.text("TB: " + tb, 10, 60);

		if(gb.math.abs(ta - 0.5) < gb.math.abs(tb - 0.5))
        {
        	h.hit = true;
            h.point[0] = a[0] * (1 - tb) + tb * b[0];
        	h.point[1] = a[1] * (1 - tb) + tb * b[1];
        	return;
        }

        //TODO: Get normals etc

	},

	line_line: function(h, a,b,c,d)
	{
		var lax = b[0] - a[0];
		var lay = b[1] - a[1];
		var lbx = d[0] - c[0];  
		var lby = d[1] - c[1];

		var d = -lbx * lay + lax * lby;

		var s = (-lay * (a[0] - c[0]) + lax * (a[1] - c[1])) / d;
		var t = ( lbx * (a[1] - c[1]) - lby * (a[0] - c[0])) / d;

		if(s >= 0 && s <= 1 && t >= 0 && t <= 1)
		{
			h.hit = true;
			h.point[0] = a[0] + (t * lbx);
			h.point[1] = a[1] + (t * lby);
			return 1;
		}
		else
		{
			h.hit = false;
		}
	},

	aabb_aabb: function(a, b)
    {
       	if(a.min[0] > b.max[0]) return false;
       	if(a.max[0] < b.min[0]) return false;

       	if(a.min[1] > b.max[1]) return false;
       	if(a.max[1] < b.min[1]) return false;

       	if(a.min[2] > b.max[2]) return false;
       	if(a.max[2] < b.min[2]) return false;

        return true;
    },

    aabb_ray: function(h, a, r)
	{
		var fx = 1 / r.dir[0];
		var fy = 1 / r.dir[1];
		var fz = 1 / r.dir[2];

		var t1 = (a.min[0] - r.point[0]) * fx;
		var t2 = (a.max[0] - r.point[0]) * fx;
		var t3 = (a.min[1] - r.point[1]) * fy;
		var t4 = (a.max[1] - r.point[1]) * fy;
		var t5 = (a.min[2] - r.point[2]) * fz;
		var t6 = (a.max[2] - r.point[2]) * fz;

		var m = gb.math;
		var tmin = m.max(m.max(m.min(t1, t2), m.min(t3, t4)), m.min(t5, t6));
		var tmax = m.min(m.min(m.max(t1, t2), m.max(t3, t4)), m.max(t5, t6));

		if(tmax < 0 || tmin > tmax)
		{
			h.hit = false;
			return;
		}

		var v = gb.vec3.tmp();
		gb.vec3.mulf(v, r.dir, tmin);
		gb.vec3.add(h.point, r.point, v);
		h.hit = true;
		gb.vec3.set(h.normal, 0,1,0);
		h.t = tmin;
	},

	point_triangle: function(p, a,b,c)
	{
		var A =  (-b[1] * c[0] + a[1] * (-b[0] + c[0]) + a[0] * (b[1] - c[1]) + b[0] * c[1]) / 2;
		var sign = A < 0 ? -1 : 1;
		var s = (a[1] * c[0] - a[0] * c[1] + (c[1] - a[1]) * p[0] + (a[0] - c[0]) * p[1]) * sign;
		var t = (a[0] * b[1] - a[1] * b[0] + (a[1] - b[1]) * p[0] + (b[0] - a[0]) * p[1]) * sign;
		return s > 0 && t > 0 && s + t < 2 * A * sign;
	},

	triangle_ray: function(h, a,b,c, r)
	{
		var v3 = gb.vec3;
		var e0 = v3.tmp();
		var e1 = v3.tmp();
		var cross = v3.tmp();
		var n = v3.tmp();

		v3.sub(e0, b,a);
		v3.sub(e1, c,a);

		v3.cross(cross, e0, e1);
		v3.normalized(n, cross);
		v3.inverse(n, n);

		var ndot = v3.dot(n, r.dir);
		var t = -(v3.dot(n,r.point) + v3.dot(n,a)) / ndot;

		v3.mulf(e0, r.dir, t);
		v3.add(e1, r.point, e0);

		if(gb.intersect.point_triangle(e1, a,b,c) === true)
		{
			h.hit = true;
			v3.eq(h.point, e1);
			v3.eq(h.normal, n);
			h.t = t;
		}
		else
		{
			h.hit = false;
		}
	},

	mesh_ray: function(h, m, matrix, r)
	{
		var _t = gb.intersect;
		var stride = gb.mesh.get_stride(m);
		h.t = gb.math.MAX_F32;

		var hit = gb.hit.tmp();

		var n = m.vertex_count / 3;
		var d = m.vertex_buffer.data;
		var c = 0;
		for(var i = 0; i < n; ++i)
		{
			var stack = gb.vec3.push();
			var ta = gb.vec3.tmp(d[c], d[c+1], d[c+2]);
			gb.mat4.mul_point(ta, matrix, ta);
			c += stride;
			var tb = gb.vec3.tmp(d[c], d[c+1], d[c+2]);
			gb.mat4.mul_point(tb, matrix, tb);
			c += stride;
			var tc = gb.vec3.tmp(d[c], d[c+1], d[c+2]);
			gb.mat4.mul_point(tc, matrix, tc);
			c += stride;

			_t.triangle_ray(hit, ta,tb,tc, r);
			gb.vec3.pop(stack);
			if(hit.hit === true && hit.t < h.t)
			{
				gb.hit.eq(h, hit);
			}
		}
	},
}

gb.Color = function(r,g,b,a)
{
	return new Float32Array(4);
}

gb.color = 
{
	stack: new gb.Stack(gb.Color, 10),

	new: function(r,g,b,a)
	{
		var v = new gb.Color();
		gb.color.set(v, r,g,b,a);
		return v;
	},
	set: function(v, r,g,b,a)
	{
		v[0] = r;
		v[1] = g;
		v[2] = b;
		v[3] = a;
	},
	eq: function(a,b)
	{
		a[0] = b[0];
		a[1] = b[1];
		a[2] = b[2];
		a[3] = b[3];
	},
	tmp: function(r,g,b,a)
	{
		var c = gb.stack.get(gb.color.stack);
		gb.color.set(c, r || 0, g || 0, b || 0, a || 0);
		return c;
	},
	lerp: function(r, a,b, t)
	{
		var it = 1-t;
		r[0] = it * a[0] + t * b[0];
		r[1] = it * a[1] + t * b[1];
		r[2] = it * a[2] + t * b[2];
		r[3] = it * a[3] + t * b[3];
	},
}
gb.Touch = function()
{
	this.id = -1;
	this.touching = false;
	this.position = gb.vec3.new();
	this.last_position = gb.vec3.new();
	this.delta = gb.vec3.new();
}

gb.KeyState = 
{
	UP: 1,
	DOWN: 2,
	HELD: 3,
	RELEASED: 4,
}

gb.Keys = 
{
	mouse_left: 0,
	mouse_right: 1,
	backspace: 8,
	tab: 9,
	enter: 13,
	shift: 16,
	ctrl: 17,
	alt: 18,
	caps_lock: 20,
	escape: 27,
	space: 32,
	left: 37,
	up: 38,
	right: 39,
	down: 40,
	zero: 48,
	one: 49,
	two: 50,
	three: 51,
	four: 52,
	five: 53,
	six: 54,
	seven: 55,
	eight: 56,
	nine: 57,
	a: 65,
	b: 66,
	c: 67,
	d: 68, 
	e: 69,
	f: 70,
	g: 71,
	h: 72,
	i: 73,
	j: 74,
	k: 75,
	l: 76,
	m: 77,
	n: 78,
	o: 79,
	p: 80,
	q: 81,
	r: 82,
	s: 83,
	t: 84,
	u: 85,
	v: 86,
	w: 87,
	x: 88,
	y: 89,
	z: 90,
}


gb.input = 
{
	root: null,
	mouse_position: gb.vec3.new(),
	last_mouse_position: gb.vec3.new(),
	mouse_delta: gb.vec3.new(),

	_mdy:0,
	_lmdy:0,
	mouse_scroll: 0,

	touches: [],
	MAX_TOUCHES: 5,
	acceleration: gb.vec3.new(),
	angular_acceleration: gb.vec3.new(),
	rotation: gb.quat.new(),

	keys: new Uint8Array(256),

	init: function(config)
	{
		var root = config.root;

		var _t = gb.input;
		root.onkeydown 	 = _t.key_down;
		root.onkeyup 	 = _t.key_up;
		root.onmousedown = _t.key_down;
		root.onmouseup   = _t.key_up;
		root.onmousemove = _t.mouse_move;
		root.addEventListener("wheel", _t.mouse_wheel, false);
		//root.requestPointerLock = root.requestPointerLock || root.mozRequestPointerLock || root.webkitRequestPointerLock;

		for(var i = 0; i < 256; ++i)
		{
			_t.keys[i] = 0;
		}

		var keycodes = config.keycodes;
		var n = keycodes.length;
		for(var i = 0; i < n; ++i)
		{
			var code = gb.Keys[keycodes[i]];
			_t.keys[code] = gb.KeyState.RELEASED;
		}

		for(var i = 0; i < _t.MAX_TOUCHES; ++i)
		{
			_t.touches[i] = new gb.Touch();
		}

		window.addEventListener('devicemotion', _t.device_motion);
		window.addEventListener('deviceorientation', _t.device_rotation);
		window.addEventListener("touchstart", _t.touch_start, false);
	  	window.addEventListener("touchmove", _t.touch_move, false);
	  	window.addEventListener("touchend", _t.touch_end, false);

	  	_t.root = root;
	},

	update: function()
	{
		var _t = gb.input;
		for(var i = 0; i < 256; ++i)
		{
			if(_t.keys[i] === gb.KeyState.DOWN) _t.keys[i] = gb.KeyState.HELD;
			else if(_t.keys[i] === gb.KeyState.UP) _t.keys[i] = gb.KeyState.RELEASED;
		}

		if(_t._mdy === _t._ldy)
		{
			_t.mouse_scroll = 0;
		}
		else
		{
			_t.mouse_scroll = _t._mdy;
			_t._ldy = _t._mdy;
		}

		/*
		var dx = _t.last_mouse_position[0] - _t.mouse_position[0];
		var dy = _t.last_mouse_position[1] - _t.mouse_position[1];
		gb.vec3.eq(_t.last_mouse_position, _t.mouse_position);
		gb.vec3.set(_t.mouse_delta, dx, dy, 0);
		*/
		gb.vec3.set(_t.mouse_delta, 0, 0, 0);
	},

	/*
	lock_cursor: function(mode)
	{
		var _t = gb.input;
		if(_t.root.requestPointerLock)
		{
			if(mode === true) _t.root.requestPointerLock();
			else document.exitPointerLock();
		}
	},
	*/

	up: function(code)
	{
		return gb.input.keys[code] === gb.KeyState.UP;
	},
	down: function(code)
	{
		return gb.input.keys[code] === gb.KeyState.DOWN;
	},
	held: function(code)
	{
		return gb.input.keys[code] === gb.KeyState.HELD;
	},
	released: function(code)
	{
		return gb.input.keys[code] === gb.KeyState.RELEASED;
	},

	key_down: function(e)
	{
		var _t = gb.input;
		var kc = e.keyCode || e.button;
		if(_t.keys[kc] === 0) return;

		if(_t.keys[kc] != gb.KeyState.HELD) 
			_t.keys[kc] = gb.KeyState.DOWN;

		//e.preventDefault();
	},
	key_up: function(e)
	{
		var _t = gb.input;
		var kc = e.keyCode || e.button;
		if(_t.keys[kc] === 0) return;

		if(_t.keys[kc] != gb.KeyState.RELEASED) 
			_t.keys[kc] = gb.KeyState.UP;

		//e.preventDefault();
	},

	mouse_move: function(e)
	{
		var _t = gb.input;
		var x = e.clientX;
		var y = e.clientY;
		var dx = e.movementX;
		var dy = e.movementY;
		gb.vec3.set(_t.mouse_position, x, y, 0);
		gb.vec3.set(_t.mouse_delta, dx, dy, 0);
	},
	mouse_wheel: function(e)
	{
		gb.input._mdy = e.deltaY;
	},

	device_motion: function(e)
	{
		var _t = gb.input;
		var v3 = gb.vec3;
		var l = e.acceleration;
		var a = e.rotationRate;
		v3.set(_t.acceleration, l.x, l.y, l.z);
		v3.set(_t.angular_acceleration, a.beta, a.gamma, a.alpha);
	},

	device_rotation: function(e)
	{
		gb.quat.euler(gb.input.rotation, e.beta, e.gamma, e.alpha);
	},

	touch_start: function(e)
	{
		var _t = gb.input;
		var n = e.changedTouches.length;
		for(var i = 0; i < n; ++i)
		{
			var it = e.changedTouches[i];

			for(var j = 0; j < _t.MAX_TOUCHES; ++j)
			{
				var t = _t.touches[j];
				if(t.touching === true) continue;
				var x = it.screenX;
				var y = it.screenY;
				gb.vec3.set(t.position, x, y, 0);
				gb.vec3.set(t.last_position, x,y,0);
				gb.vec3.set(t.delta, 0,0,0);
				t.touching = true;
				t.id = it.identifier;
				break;
			}
		}
		e.preventDefault();
	},
	touch_move: function(e)
	{
		var _t = gb.input;
		var n = e.changedTouches.length;
		for(var i = 0; i < n; ++i)
		{
			var it = e.changedTouches[i];

			for(var j = 0; j < _t.MAX_TOUCHES; ++j)
			{
				var t = gb.input.touches[j];
				if(it.identifier === t.id)
				{
					t.touching = true;
					var x = it.screenX;
					var y = it.screenY;
					var dx = x - t.last_position[0];
					var dy = y - t.last_position[1];
					gb.vec3.set(t.position, x, y, 0);
					gb.vec3.set(t.delta, dx,dy,0);
					gb.vec3.set(t.last_position, x,y);
					break;
				}
			}
		}
		e.preventDefault();
	},
	touch_end: function(e)
	{
		var _t = gb.input;
		var n = e.changedTouches.length;
		for(var i = 0; i < n; ++i)
		{
			var id = e.changedTouches[i].identifier;
			for(var j = 0; j < _t.MAX_TOUCHES; ++j)
			{
				var t = gb.input.touches[j];
				if(id === t.id)
				{
					t.touching = false;
					t.id = -1;
					break;
				}
			}
		}
		e.preventDefault();
	},
	
}
gb.Animation = function()
{
	this.name;
	this.is_playing = false;
	this.auto_play = true;
	this.t = 0;
	this.time_scale = 1;
	this.target;
	this.tweens = [];
	this.loops = 1;
	this.loop_count = 0;
	this.start_time = null;
	this.duration = null;
	this.callback;
	this.next;
}
gb.Tween = function()
{
	this.bone_index = -1;
	this.property;
	this.index = -1;
	this.curve = [];
	this.num_frames;
}

gb.animation = 
{
	new: function(target)
	{
		var a = new gb.Animation();
		a.target = target;
		return a;
	},
	from_to: function(animation, property, from, to, duration, delay, easing)
	{
		var components = 1;
		if(from.length) 
		{
			components = from.length;
			ASSERT(from.length === to.length, 'Animatable properties must be of same component length');
		}

		for(var i = 0; i < components; ++i)
		{
			var t = new gb.Tween();
			t.num_frames = 2;
			t.property = property;
			
			var A,B;
			if(components > 1) 
			{
				A = from[i];
				B = to[i];
				t.index = i;
			}
			else
			{
				A = from;
				B = to;
				t.index = -1;
			}

			var A = from[i];
			var B = to[i];
			var D = B - A;

			t.curve = new Float32Array(
			[
				-duration * easing[0], A - (D * easing[1]),
				delay, A,
				duration * easing[0], A + (D * easing[1]),
				(delay + duration) - (duration * easing[2]), B - (D * easing[3]),
				delay + duration, B,
				(delay + duration) + (duration * easing[2]), B + (D * easing[3])
			]);
			a.tweens.push(t);
		}
	},
	play: function(anim, loops)
	{
		anim.is_playing = true;
		anim.t = 0;
		anim.loops = loops || 1;
		anim.loop_count = 0;
	},
	add_keyframe: function(tween, value, t, easing)
	{
		tween.curve.push([0, 0, t, value, 0, 0]);
		tween.num_frames++;
	},
	tween: function(property, index, curve)
	{
		var t = new gb.Tween();
		t.property = property;
		t.index = index;
		t.curve = curve;
		return t;
	},
	get_start_time: function(animation)
	{
		if(animation.start_time !== null) return animation.start_time;

		var result = gb.math.MAX_F32;
		var num_tweens = animation.tweens.length;
		for(var i = 0; i < num_tweens; ++i)
		{
			var t = animation.tweens[i].curve[2];
			if(t < result) result = t;
		}
		animation.start_time = result;
		return result;
	},
	get_duration: function(animation)
	{
		if(animation.duration !== null) return animation.duration;

		var result = 0;
		var num_tweens = animation.tweens.length;
		for(var i = 0; i < num_tweens; ++i)
		{
			var tween = animation.tweens[i];
			var t = tween.curve[(tween.num_frames * 6) - 4];
			if(t > result) result = t;
		}
		animation.duration = result;
		return result;
	},
	add_tween: function(animation, property, index, keyframes)
	{
		animation.tweens.push(new gb.Tween(property, index, keyframes));
	},
	update: function(animation, dt)
	{
		if(animation.is_playing === false) return;

		if(animation.auto_play === true)
			animation.t += dt * animation.time_scale;

		var in_range = false;
		var num_tweens = animation.tweens.length;
		var ax, ay, bx, by, cx, cy, dx, dy;
		for(var i = 0; i < num_tweens; ++i)
		{
			var tween = animation.tweens[i];
			for(var j = 0; j < tween.num_frames-1; ++j)
			{
				var index = j * 6;
				ax = tween.curve[index + 2];
				ay = tween.curve[index + 3];
				bx = tween.curve[index + 4];
				by = tween.curve[index + 5];
				cx = tween.curve[index + 6];
				cy = tween.curve[index + 7];
				dx = tween.curve[index + 8];
				dy = tween.curve[index + 9];

				if(animation.t <= dx && animation.t >= ax)
				{
					in_range = true;
					break;
				}
			}

			if(in_range === false) continue;

			var time_range = dx - ax;
			var value_range = dy - ay;

			var t = (animation.t - ax) / time_range;
			if(t < 0.0) t = 0.0;
			else if(t > 1.0) t = 1.0;

			var u = 1.0 - t;
			var tt = t * t;
			var uu = u * u;
			var uuu = uu * u;
			var ttt = tt * t;
			var value = (uuu * ay) + (3 * uu * t * by) + (3 * u * tt * cy) + (ttt * dy);

			if(tween.bone_index !== -1)
			{
				animation.target[tween.bone_index][tween.property][tween.index] = value;
			}
			else
			{
				if(tween.index === -1)
				{
					animation.target[tween.property] = value;
				}
				else
				{
					animation.target[tween.property][tween.index] = value;
				}
			}
			if(animation.target.dirty !== undefined) animation.target.dirty = true;
		}
		if(in_range === false)
		{
			if(animation.loops === -1)
			{
				animation.t = gb.animation.get_start_time(animation);
			}
			else
			{
				animation.loop_count++;
				if(animation.loop_count === animation.loops)
				{
					if(animation.callback) animation.callback(animation);
					if(animation.next) animation.next.is_playing = true;
					animation.is_playing = false;
				}
				else
				{
					animation.t = gb.animation.get_start_time(animation);
				}
			}
		}
	},
}

gb.binary_reader.action = function(br)
{
    var s = gb.binary_reader;
    var animation = new gb.Animation();
    animation.target_type = s.i32(br);
    animation.name = s.string(br);
    animation.target = s.string(br);

    var num_curves = s.i32(br);
    for(var i = 0; i < num_curves; ++i)
    {
    	var tween = new gb.Tween();
    	tween.property = s.string(br);
    	tween.index = s.i32(br);

    	tween.num_frames = s.i32(br);
    	tween.curve = s.f32_array(br, tween.num_frames * 6);
    	animation.tweens.push(tween);
    }
    gb.animation.get_start_time(animation);
    gb.animation.get_duration(animation);
    return animation;	
}
gb.binary_reader.rig_action = function(br)
{
	var s = gb.binary_reader;
    var animation = new gb.Animation();
    animation.target_type = 2;
    animation.name = s.string(br);

    var num_curves = s.i32(br);
    for(var i = 0; i < num_curves; ++i)
    {
    	var tween = new gb.Tween();
    	tween.bone_index = s.i32(br);
    	tween.property = s.string(br);
    	tween.index = s.i32(br);

    	tween.num_frames = s.i32(br);
    	tween.curve = s.f32_array(br, tween.num_frames * 6);
    	animation.tweens.push(tween);
    }
    return animation;
}
gb.EntityType = 
{
	ENTITY: 0,
	CAMERA: 1,
	LAMP: 2,
	SPRITE: 3,
	EMPTY: 4,
	RIG: 5,
}
gb.Entity = function()
{
	this.name;
	this.id;
	this.entity_type = gb.EntityType.EMPTY;
	this.update = null;
	this.parent = null;
	this.children = [];

	this.active = true;
	this.layer = 0;
	this.dirty = true;

	this.position = gb.vec3.new(0,0,0);
	this.scale = gb.vec3.new(1,1,1);
	this.rotation = gb.quat.new(0,0,0,1);

	this.local_matrix = gb.mat4.new();
	this.world_matrix = gb.mat4.new();
	this.bounds = gb.aabb.new();
}
gb.entity = 
{
	new: function()
	{
		var e = new gb.Entity();
		e.position = gb.vec3.new(0,0,0);
		e.scale = gb.vec3.new(1,1,1);
		e.rotation = gb.quat.new(0,0,0,1);
		e.local_matrix = gb.mat4.new();
		e.world_matrix = gb.mat4.new();
		e.bounds = gb.aabb.new();
		return e;
	},
	mesh: function(mesh, material)
	{
		var e = gb.entity.new();
		e.entity_type = gb.EntityType.ENTITY;
		e.mesh = mesh;
		e.material = material;
		return e;
	},
	set_active: function(e, val)
	{
		e.active = val;
		var n = e.children.length;
		for(var i = 0; i < n; ++i)
		{
			gb.entity.set_active(e.children[i], val);
		}
	},
	set_parent: function(e, parent)
	{
		if (e.parent === parent) return;

		if (e.parent !== null && parent === null) // clearing parent
		{
			gb.entity.remove_child(e.parent, e);
			e.parent = null;
		}
		else if (e.parent !== null && parent !== null) // swapping parent
		{
			gb.entity.remove_child(e.parent, e);
			e.parent = parent;
			gb.entity.add_child(e.parent, e);
		}
		else // setting new parent from null
		{
			e.parent = parent;
			gb.entity.add_child(e.parent, e);
		}
	},
	add_child: function(e, child)
	{
		e.children.push(child);
	},
	remove_child: function(e, child)
	{
		var index = e.children.indexOf(child, 0);
		ASSERT(index == undefined, "Cannot remove child - not found!");
		e.children.splice(index, 1);
	},
	move_f: function(e, x,y,z)
	{
		e.position[0] += x;
		e.position[1] += y;
		e.position[2] += z;
		e.dirty = true;
	},
	rotate_f: function(e, x,y,z)
	{
		var rotation = gb.quat.tmp();
		gb.quat.euler(rotation, x, y, z);
		gb.quat.mul(e.rotation, rotation, e.rotation);
		e.dirty = true;
	},
	set_position: function(e, x,y,z)
	{
		gb.vec3.set(e.position, x,y,z);
		e.dirty = true;
	},
	set_scale: function(e, x,y,z)
	{
		gb.vec3.set(e.scale, x,y,z);
		e.dirty = true;
	},
	set_rotation: function(e, x,y,z)
	{
		gb.quat.euler(e.rotation, x,y,z);
		e.dirty = true;
	},
	set_armature: function(e, a)
	{
		e.entity_type = gb.EntityType.RIG;
		e.rig = a;
	},

	update: function(e, scene)
	{
		if(e.rig) gb.rig.update(e.rig, scene);

		if(e.dirty === true)
		{
			gb.mat4.compose(e.local_matrix, e.position, e.scale, e.rotation);
			if(e.parent === null)
			{
				gb.mat4.eq(e.world_matrix, e.local_matrix);
			}
			else
			{
				gb.mat4.mul(e.world_matrix, e.local_matrix, e.parent.world_matrix);
			}
		}
	
		if(e.update !== null) e.update(e); //updates component

		var n = e.children.length;
		for(var i = 0; i < n; ++i)
		{
			var child = e.children[i];
			child.dirty = true;
			gb.entity.update(child);
		}
		e.dirty = false;
	},
}
gb.binary_reader.entity = function(br, ag)
{
    var s = gb.binary_reader;

    var entity = new gb.Entity();
    entity.name = s.string(br);

    var parent_name = s.string(br);
    if(parent_name !== 'none') 
    {
    	var parent = ag.entities[parent_name];
    	ASSERT(parent, 'Cannot find entity ' + parent_name + ' in asset group');
    	gb.entity.set_parent(entity, parent);
    }

    entity.position = s.vec3(br);
    entity.scale 	= s.vec3(br);
    entity.rotation = s.vec4(br);
    return entity;
}
gb.Lamp = function()
{
	this.entity;
	this.type = gb.LampType.POINT;
	this.energy = 1;
	this.distance = 1;
	this.projection = gb.mat4.new();
}

gb.lamp = 
{
	new: function(type, energy, distance)
	{
		var e = gb.entity.new();
	    var l = new gb.Lamp();
	    l.type = type;
	    l.energy = energy;
	    l.distance = distance;
	    e.lamp = l;
	    l.entity = e;
	    return e;
	},
}

gb.LampType = 
{
    POINT: 0,
    SUN: 1,
}

gb.binary_reader.lamp = function(br, ag)
{
    var s = gb.binary_reader;
    var entity = s.entity(br, ag);
    entity.type = gb.EntityType.LAMP;
    var lamp = new gb.Lamp();
    lamp.energy = s.f32(br);
    lamp.distance = s.f32(br);
    entity.lamp = lamp;
    lamp.entity = entity;
    return lamp;
}
gb.Camera = function()
{
	this.entity;
	this.projection_type = null;
	this.projection = gb.mat4.new();
	this.view = gb.mat4.new();
	this.view_projection = gb.mat4.new();
	this.normal = gb.mat3.new();
	this.mask = 0;
	this.dirty = true;
	this.aspect;
	this.near;
	this.far;
	this.fov;
	this.scale;
	return this;
}
gb.camera = 
{
	new: function(projection, near, far, fov, mask, scale)
	{
		var e = gb.entity.new();
		e.entity_type = gb.EntityType.CAMERA;
		e.update = gb.camera.update;
	    var c = new gb.Camera();
	    c.projection_type = projection || gb.Projection.PERSPECTIVE;
	    c.near = near || 0.1;
	    c.far = far || 100;
	    c.fov = fov || 60;
	    c.mask = mask || 0;
	    c.scale = scale || 1;
	    c.entity = e;
	    e.camera = c;
	    return c;
	},
	update_projection: function(c, view)
	{
		c.aspect = view.width / view.height;
		if(c.projection_type === gb.Projection.ORTHO)
		{
			gb.mat4.ortho_projection(c.projection, c.scale * c.aspect, c.scale, c.near, c.far);
		}
		else
		{
			gb.mat4.perspective_projection(c.projection, c.far, c.near, c.aspect, c.fov);
		}
		c.dirty = false;
	},

	set_clip_range: function(c, near, far)
	{
		c.near = near;
		c.far = far;
		c.dirty = true;
	},

	update: function(e)
	{
		ASSERT(e.camera, 'Entity is not a camera');
		var c = e.camera;
		if(c.dirty === true)
		{
			gb.camera.update_projection(c, gb.webgl.view);
		}
		gb.mat4.inverse(c.view, e.world_matrix);
		gb.mat4.mul(c.view_projection, c.view, c.projection);
		gb.mat3.from_mat4(c.normal, c.view);
		gb.mat3.inverse(c.normal, c.normal);
		gb.mat3.transposed(c.normal, c.normal);
	},
}

gb.Projection = 
{
    ORTHO: 0,
    PERSPECTIVE: 1,
}

gb.binary_reader.camera = function(br, ag)
{
    var s = gb.binary_reader;

    var e = s.entity(br, ag);
    e.entity_type = gb.EntityType.CAMERA;
    e.update = gb.camera.update;

    var c = new gb.Camera();
    e.camera = c;

    var camera_type = s.i32(br);
    if(camera_type === 0) 
    {
    	c.projection_type = gb.Projection.PERSPECTIVE;
    }
    else 
    {
    	c.projection_type = gb.Projection.ORTHO;
    	c.scale = s.f32(br);
    }
    c.near = s.f32(br);
    c.far  = s.f32(br);
    c.fov  = s.f32(br);
    c.mask = 0;
    c.entity = e;
    return c;
}
gb.Scene = function()
{
	this.name;
	this.active_camera = null;
	this.world_matrix = gb.mat4.new();
	this.num_entities = 0;
	this.entities = [];
	this.draw_items;
	this.num_draw_items;
	this.animations = [];
}
gb.scene = 
{
	scenes: {},
	current: null,

	new: function(name, make_active)
	{
		var scene = new gb.Scene();
		scene.name = name;
		scene.draw_items = new Uint32Array(64);
		scene.num_draw_items = 0;
		gb.scene.scenes[name] = scene;
		if(make_active) gb.scene.current = scene;
		return scene;
	},
	load_asset_group: function(ag, s)
	{
		s = s || gb.scene.current;
	    for(var e in ag.entities)
	    {
	        gb.scene.add(ag.entities[e], s);
	    }
	    for(var a in ag.animations)
	    {
	    	var anim = ag.animations[a];
	    	switch(anim.target_type)
	    	{
	    		case 0: // entity transform
	    		{
	    			anim.target = gb.scene.find(anim.target, s);
	    			break;
	    		}
	    		case 1: // material
	    		{
	    			anim.target = gb.scene.find(anim.target, s).material;
	    			break;
	    		}
	    		case 2: // armature
	    		{
	    			break;
	    		}
	    	}
	    	s.animations.push(anim);
	    }
	},	
	find: function(name, s)
	{
		s = s || gb.scene.current;
		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			var e = s.entities[i];
			if(e.name === name) return e;
		}
		return null;
	},
	add: function(entity, s)
	{
		var e = entity.entity || entity;
		s = s || gb.scene.current;
		s.entities.push(e);
		e.id = s.num_entities;
		s.num_entities++;

		if(e.entity_type === gb.EntityType.CAMERA && s.active_camera === null)
		{
			s.active_camera = e.camera;
		}
	},
	update: function(dt, s)
	{
		s = s || gb.scene.current;

		var n = s.animations.length;
		for(var i = 0; i < n; ++i) 
		{
			var anim = s.animations[i];
			if(anim.is_playing)
			{
				gb.animation.update(anim, dt);
			}
		}

		var n = s.num_entities;
		s.num_draw_items = 0;
		for(var i = 0; i < n; ++i) 
		{
			var e = s.entities[i];
			if(e.active === true)
			{
				gb.entity.update(e, s);

				if(e.mesh && e.material)
				{
					s.draw_items[s.num_draw_items] = e.id;
					s.num_draw_items++;
				}
			}
		}
	},
}
gb.binary_reader.scene = function(br, ag)
{
	var s = gb.binary_reader;
	var name = s.string(br);
    LOG("Loading Scene: " + name);

    var scene_complete = false;
    while(scene_complete === false)
    {
        var import_type = s.i32(br);
        switch(import_type)
        {
            case 0:
            {
                var camera = s.camera(br, ag);
                ag.entities[camera.entity.name] = camera;
                LOG("Loaded Camera: " + camera.entity.name);
                break;                        
            }
            case 1:
            {
                var entity = s.lamp(br, ag);
                ag.entities[entity.name] = entity;
                LOG("Loaded Lamp: " + entity.name);
                break;
            }
            case 2:
            {
                var mesh = s.mesh(br);
                ag.meshes[mesh.name] = mesh;
                LOG("Loaded Mesh: " + mesh.name);
                break;
            }
            case 3:
            {
                var material = s.material(br, ag);
                ag.materials[material.name] = material;
                LOG("Loaded Material: " + material.name);
                break;
            }
            case 4:
            {
                var action = s.action(br);
                ag.animations[action.name] = action;
                LOG("Loaded Action: " + action.name);
                break;
            }
            case 5:
            {
                var entity = s.entity(br, ag);
                entity.material = ag.materials[s.string(br)];
                entity.mesh = ag.meshes[s.string(br)];
                entity.entity_type = gb.EntityType.ENTITY;
                ag.entities[entity.name] = entity;
                LOG("Loaded Entity: " + entity.name);
                break;
            }
            case 6:
            {
                var entity = s.entity(br, ag);
                ag.entities[empty.name] = empty;
                LOG("Loaded Entity: " + empty.name);
                break;
            }
            case 7:
            {
                var rig = s.rig(br, ag);
                ag.rigs[rig.name] = rig;
                LOG("Loaded Rig: " + rig.name);
                break;
            }
            case 8:
            {
                var action = s.rig_action(br);
                ag.animations[action.name] = action;
                LOG("Loaded Action: " + action.name);
                break;
            }
            case 9:
            {
            	var name = s.string(br);
            	var curve = s.curve(br);
            	ag.curves[name] = curve;
            	LOG("Loaded Curve: " + name);
            	break;
            }
            case -101: //FINISH
            {
                scene_complete = true;
                break;
            }
        }
    }

    var scene = gb.scene.new(name, true);
    gb.scene.scenes[scene.name] = scene;
    gb.scene.load_asset_group(ag, scene);
}
gb.Vertex_Attribute = function()
{
	this.name;
	this.size;
	this.normalized;
	this.offset = 0;
}
gb.Vertex_Buffer = function()
{
	this.id = 0;
	this.data;
	this.attributes = {};
	this.stride = 0;
}
gb.Index_Buffer = function()
{
	this.id = 0;
	this.data;
}
gb.Mesh = function()
{
	this.name;
	this.layout;
	this.update_mode;
	this.vertex_buffer = null;
	this.vertex_count = 0;
	this.index_buffer = null;
	this.index_count = 0;
	this.linked = false;
	//this.dirty = true;
}

gb.vertex_buffer = 
{
	new: function(vertices)
	{
		var vb = new gb.Vertex_Buffer();
		if(vertices) vb.data = new Float32Array(vertices);
		return vb;
	},
	add_attribute: function(vb, name, size, normalized)
	{
		ASSERT(vb.attributes[name] === undefined, 'Vertex buffer already has an attribute named: ' + name);

		var attr = new gb.Vertex_Attribute();
		attr.name = name;
		attr.size = size;
		attr.normalized = normalized || false;
		attr.offset = vb.stride;
		vb.attributes[name] = attr;
		vb.stride += size;
	},
	alloc: function(vb, vertex_count)
	{
		vb.data = new Float32Array(vb.stride * vertex_count);		
	},
	resize: function(vb, vertex_count, copy)
	{
		ASSERT((vb.data.length / vb.stride) !== vertex_count, 'Buffer already correct size');
		var new_buffer = new Float32Array(vb.stride * vertex_count);
		if(copy) new_buffer.set(vb.data);
		vb.data = new_buffer; 
	},
}
gb.index_buffer = 
{
	new: function(indices)
	{
		var ib = new gb.Index_Buffer();
		if(indices) ib.data = new Uint32Array(indices);
		return ib;
	},
	alloc: function(ib, count)
	{
		ib.data = new Uint32Array(count);		
	},
	resize: function(ib, count, copy)
	{
		ASSERT(ib.data.length !== count, 'Buffer already correct size');
		var new_buffer = new Uint32Array(count);
		if(copy) new_buffer.set(ib.data);
		ib.data = new_buffer; 
	},
}

gb.mesh = 
{
	new: function(vertex_buffer, index_buffer, layout, update_mode)
	{
		var m = new gb.Mesh();

		if(layout) m.layout = gb.webgl.ctx[layout];
		else m.layout = gb.webgl.ctx.TRIANGLES;

		if(update_mode) m.update_mode = gb.webgl.ctx[update_mode];
		else m.update_mode = gb.webgl.ctx.STATIC_DRAW;

	    m.vertex_buffer = vertex_buffer;
		m.index_buffer = index_buffer;

	    gb.mesh.update(m);
	    return m;
	},
	update: function(m)
	{
	    if(m.vertex_buffer.data.length === 0) m.vertex_count = 0;
	    else m.vertex_count = m.vertex_buffer.data.length / m.vertex_buffer.stride;

	    if(m.index_buffer)
	    { 
		    if(m.index_buffer.data.length === 0) m.index_count = 0;
		    else m.index_count = m.index_buffer.data.length;
		}
	    gb.webgl.update_mesh(m);
	},
	get_vertex: function(result, mesh, attribute, index)
	{
		var vb = mesh.vertex_buffer;
		var attr = vb.attributes[attribute];
		var start = (index * vb.stride) + attr.offset; 
		for(var i = 0; i < attr.size; ++i)
		{
			result[i] = vb.data[start + i];
		}
	},
	set_vertex: function(mesh, attribute, index, val)
	{
		var vb = mesh.vertex_buffer;
		var attr = vb.attributes[attribute];
		var start = (index * vb.stride) + attr.offset; 
		for(var i = 0; i < attr.size; ++i)
		{
			vb.data[start + i] = val[i];
		}
	},
	set_vertex_abs: function(mesh, index, val, size)
	{
		for(var i = 0; i < size; ++i)
			vb.data[i] = val[i];
		return index + size;
	},
	get_vertices: function(result, mesh, attribute, start, end)
	{
		var vb = mesh.vertex_buffer;
		var attr = vb.attributes[attribute];
		start = start || 0;
		end = end || mesh.vertex_count;
		var range = end - start;
		var dest_index = 0;
		var src_index = (start * vb.stride) + attr.offset;

		for(var i = 0; i < range; ++i)
		{
			for(var j = 0; j < attr.size; ++j)
			{
				result[dest_index + j] = vb.data[src_index + j]; 
			}
			src_index += vb.stride;
			dest_index += attr.size;
		}
	},
	set_vertices: function(mesh, attribute, start, val)
	{
		var vb = mesh.vertex_buffer;
		var attr = vb.attributes[attribute];
		var range = val.length;
		ASSERT((start + range) < mesh.vertex_count, 'src data too large for vertex buffer');
		for(var i = 0; i < range; ++i)
		{
			for(var j = 0; j < attr.size; ++j)
			{
				vb.data[dest_index + j] = val[src_index + j]; 
			}
			src_index += attr.size;
			dest_index += vb.stride;
		}
	},
	get_bounds: function(b, m)
	{
		var v3 = gb.vec3;
		var d = m.vertex_buffer.data;
		v3.set(b.min, d[0], d[1], d[2]);
		v3.set(b.max, d[0], d[1], d[2]);

		var stride = m.vertex_buffer.stride;
		var n = m.vertex_count;
		var p = v3.tmp(0,0,0);
		var c = stride;
		for(var i = 1; i < n; ++i)
		{
			v3.set(p, d[c], d[c+1], d[c+2]);

			if(p[0] < b.min[0]) b.min[0] = p[0];
			if(p[1] < b.min[1]) b.min[1] = p[1];
			if(p[2] < b.min[2]) b.min[2] = p[2];

			if(p[0] > b.max[0]) b.max[0] = p[0];
			if(p[1] > b.max[1]) b.max[1] = p[1];
			if(p[2] > b.max[2]) b.max[2] = p[2];

			c += stride;
		}
		v3.stack.index -= 1;
	},
}
gb.binary_reader.mesh = function(br)
{
	var s = gb.binary_reader;
	var name = s.string(br);

	var vb_size = s.i32(br);
	var vertices = s.f32_array(br, vb_size);
	var vb = gb.vertex_buffer.new(vertices);
	
	var ib_size = s.i32(br);
	if(ib_size > 0)
	{
		var indices = s.u32_array(br, ib_size);
		var ib = gb.index_buffer.new(indices);
	}

	var num_attributes = s.i32(br);
	for(var i = 0; i < num_attributes; ++i)
	{
		var attr_name = s.string(br);
		var attr_size = s.i32(br);
		var attr_norm = s.b32(br);
		gb.vertex_buffer.add_attribute(vb, attr_name, attr_size, attr_norm);
	}

	var mesh = gb.mesh.new(vb, null);
	mesh.name = name;
	return mesh;
}
gb.mesh.quad = function(width, height, depth)
{
    var P = gb.vec3.tmp(width / 2, height / 2, depth / 2);
    var N = gb.vec3.tmp();
    gb.vec3.normalized(N, P);

    var vb = gb.vertex_buffer.new(
    [
    	// POS  NORMAL UV
        -P[0],-P[1], P[2], N[0], N[1], N[2], 0,0,
         P[0],-P[1], P[2], N[0], N[1], N[2], 1,0,
        -P[0], P[1],-P[2], N[0], N[1], N[2], 0,1,
         P[0], P[1],-P[2], N[0], N[1], N[2], 1,1
    ]);

    gb.vertex_buffer.add_attribute(vb, 'position', 3);
    gb.vertex_buffer.add_attribute(vb, 'normal', 3);
    gb.vertex_buffer.add_attribute(vb, 'uv', 2);

    var ib = gb.index_buffer.new([0,1,3,0,3,2]);

    return gb.mesh.new(vb, ib);
}
gb.Texture = function()
{
	this.id = 0;
	this.width;
	this.height;
	this.pixels;
	this.format;
	this.byte_size;
	this.mipmaps = 0;
	this.sampler;
	this.compressed = false;
	this.dirty = true;
	this.linked = false;
}
gb.Sampler = function()
{
	this.x;
	this.y;
	this.up;
	this.down;
}

gb.texture = 
{
	new: function(w, h, pixels, sampler, format, byte_size, mipmaps, compressed)
	{
		var t = new gb.Texture();
		t.width = w;
		t.height = h;
		t.pixels = pixels;
		t.format = gb.webgl.ctx[format];
		t.byte_size = gb.webgl.ctx[byte_size];
		t.mipmaps = mipmaps || 0;
		t.sampler = sampler;
		t.compressed = compressed || false;
		gb.webgl.update_texture(t);
		return t;
	},
	rgba: function(w, h, pixels, sampler, mipmaps)
	{
		return gb.texture.new(w, h, pixels, sampler, 'RGBA', 'UNSIGNED_BYTE', mipmaps);
	},
	depth: function(w, h)
	{
		return gb.texture.new(w, h, null, gb.webgl.samplers.default, 'DEPTH_COMPONENT', 'UNSIGNED_SHORT', 0);
	},
}
gb.sampler = 
{
	new: function(x,y,up,down)
	{
		var s = new gb.Sampler();
	    s.x = x;
	    s.y = y;
	    s.up = up;
	    s.down = down;
	    return s;
	}
}
gb.binary_reader.dds = function(br)
{
	// http://msdn.microsoft.com/en-us/library/bb943991.aspx/
	var s = gb.binary_reader;
	var dxt = gb.webgl.extensions.WEBGL_compressed_texture_s3tc;
    var DXT1 = 827611204;
   	var DXT5 = 894720068;

	var t = new gb.Texture();
	t.name = s.string(br);

	var h = new Int32Array(br.buffer, br.offset, 31);

	ASSERT(h[0] === 0x20534444, "Invalid magic number in DDS header");
	ASSERT(!h[20] & 0x4, "Unsupported format, must contain a FourCC code");

    t.height = h[3];
	t.width = h[4];
	
	var four_cc = h[21];
	ASSERT(four_cc === DXT1 || four_cc === DXT5, "Invalid FourCC code");
	
	var block_size = 0;
	switch(four_cc)
	{
		case DXT1:
			block_size = 8;
			t.format = dxt.COMPRESSED_RGBA_S3TC_DXT1_EXT;
			t.byte_size = dxt.UNSIGNED_BYTE;
		break;
		case DXT5:
			block_size = 16;
			t.format = dxt.COMPRESSED_RGBA_S3TC_DXT5_EXT;
			t.byte_size = dxt.UNSIGNED_SHORT;
		break;
	}
	
	var size = Math.max(4, t.width) / 4 * Math.max(4, t.height) / 4 * block_size;

	br.offset += h[1] + 4;
    t.pixels = new Uint8Array(br.buffer, br.offset, size);
    t.sampler = gb.webgl.samplers.default;
    t.compressed = true;

    if(h[2] & 0x20000) 
    {
        t.mipmaps = Math.max(1, h[7]);
    }
    br.offset += size;

    gb.webgl.update_texture(t);

    //DEBUG
    LOG("Loaded Texture: " + t.name);
    LOG("Width: " + t.width);
	LOG("Height: " + t.height);
	//END

    return t;
}
gb.ShaderAttribute = function()
{
	this.location;
	this.size;
    this.type;
}
gb.ShaderUniform = function()
{
    this.location;
    this.name;
    this.type;
    this.size;
    this.sampler_index;
}
gb.Shader = function()
{
    this.name = null;
    this.id = 0;
    this.vertex_src;
    this.fragment_src;
    this.num_attributes;
    this.num_uniforms;
    this.attributes = {};
    this.uniforms = {};
    this.linked = false;
}
gb.shader = 
{
    new: function(v_src, f_src)
    {
        var shader = new gb.Shader();
        shader.vertex_src = v_src;
        shader.fragment_src = f_src;
        gb.webgl.link_shader(shader);
        return shader;
    }
}
gb.binary_reader.shader = function(br)
{
	var s = gb.binary_reader;
    var name = s.string(br);
   	var vs = s.string(br);
   	var fs = s.string(br);
    var shader = gb.shader.new(vs, fs);
    shader.name = name;
    LOG("Loaded Shader: " + shader.name);
    return shader;
}
gb.Material = function()
{
    this.name;
    this.shader;
    this.mvp;
    this.proj_matrix;
    this.view_matrix;
    this.normal_matrix;
}
gb.material = 
{
    new: function(shader, name)
    {
        var m = new gb.Material();
        m.name = name || shader.name;
        m.shader = shader;
        for(var key in shader.uniforms)
        {
            var uniform = shader.uniforms[key];
            var size = uniform.size;
            var val;

            switch(uniform.type)
            {
                case 'FLOAT': 
                {
                    if(size > 1) val = new Float32Array(size);
                    else val = 0.0;
                    break;
                }
                case 'FLOAT_VEC2':
                {
                    val = new Float32Array(size * 2);
                    break;
                }
                case 'FLOAT_VEC3':
                {
                    val = new Float32Array(size * 3);
                    break;
                }
                case 'FLOAT_VEC4':
                {
                    val = new Float32Array(size * 4);
                    break;
                }
                case 'BOOL':
                {
                    val = true;
                    break;
                }
                case 'FLOAT_MAT3':
                {
                    if(size > 1) val = new Float32Array(size * 9);
                    val = gb.mat3.new();
                    break;
                }
                case 'FLOAT_MAT4':
                {
                    if(size > 1) val = new Float32Array(size * 16);
                    else val = gb.mat4.new();
                    break;
                }
                case 'SAMPLER_2D':
                {
                    val = null;
                    break;
                }
                case 'INT':
                {
                    val = 0;
                    break;
                }
                default:
                {
                    ASSERT(false, uniform.type + ' is an unsupported uniform type');
                }
            }
            m[key] = val
        }
        return m;
    },
    set_uniform: function(material, uniform, value)
    {
        if(material[uniform] !== undefined)
        {
            material[uniform] = value;
        }
    },
    set_camera_uniforms: function(material, camera)
    {
        gb.material.set_uniform(material, 'projection', camera.projection);
        gb.material.set_uniform(material, 'view', camera.view);
        gb.material.set_uniform(material, 'view_projection', camera.view_projection);
        gb.material.set_uniform(material, 'normal_matrix', camera.normal);
    },
    set_entity_uniforms: function(material, entity, camera)
    {
        if(material.mvp !== undefined)
        {
            gb.mat4.mul(material.mvp, entity.world_matrix, camera.view_projection);
        }
        if(material.model_view !== undefined)
        {
            gb.mat4.mul(material.model_view, entity.world_matrix, camera.view);
        }
        if(material.model_matrix !== undefined)
        {
            material.model = entity.world_matrix;
        }
        if(material['rig[0]'] !== undefined)
        {
            var rig = material['rig[0]'];
            var n = entity.rig.joints.length;
            var t = 0;
            for(var i = 0; i < n; ++i)
            {
                var joint = entity.rig.joints[i];
                for(var j = 0; j < 16; ++j)
                {
                    rig[t+j] = joint.offset_matrix[j];
                }
                t += 16;
            }
        }
    },
}
gb.binary_reader.material = function(br, ag)
{
    var s = gb.binary_reader;
    var name = s.string(br);
    var shader_name = s.string(br);
    var shader = ag.shaders[shader_name];
    ASSERT(shader, 'Cannot find shader ' + shader_name);

    var material = gb.material.new(shader);
    material.name = name;

    var num_textures = s.i32(br);
    for(var i = 0; i < num_textures; ++i)
    {
        var tex_name = s.string(br);
        var sampler_name = s.string(br);
        ASSERT(material[sampler_name], 'Cannot find sampler ' + sampler_name + ' in shader ' + shader_name);
        ASSERT(ag.textures[tex_name], 'Cannot find texture ' + tex_name + ' in asset group');
        material[sampler_name] = ag.textures[tex_name];
    }
    return material;
}
gb.Rig = function()
{
	this.joints;	
}
gb.Joint = function()
{
	this.parent;
	this.position;
	this.scale;
	this.rotation;
	this.local_matrix;
	this.world_matrix; 
	this.inverse_bind_pose;
	this.offset_matrix;
	this.bind_pose;
}

gb.rig = 
{
	MAX_JOINTS: 18,

	new: function()
	{
		var r = new gb.Rig();
		r.joints = [];
		return r;
	},
	copy: function(src)
	{
		var r = new gb.Rig();
		var m4 = gb.mat4;
		var v3 = gb.vec3;
		r.joints = [];
		var n = src.joints.length;
		for(var i = 0; i < n; ++i)
		{
			var sj = src.joints[i];
			var j = gb.rig.joint();
			j.parent = sj.parent;
			v3.eq(j.postition, sj.position);
			v3.eq(j.scale, sj.scale);
			gb.quat.eq(j.rotation, sj.rotation);
			m4.eq(j.local_matrix, sj.local_matrix);
			m4.eq(j.world_matrix, sj.world_matrix);
			m4.eq(j.bind_pose, sj.bind_pose);
			m4.eq(j.inverse_bind_pose, sj.inverse_bind_pose);
			m4.eq(j.offset_matrix, sj.offset_matrix);
			r.joints.push(j);
		}
		return r;
	},
	joint: function()
	{
		var j = new gb.Joint();
		j.parent = -1;
		j.position = gb.vec3.new();
		j.scale = gb.vec3.new(1,1,1);
		j.rotation = gb.quat.new();
		j.local_matrix = gb.mat4.new();
		j.world_matrix = gb.mat4.new(); 
		j.bind_pose = gb.mat4.new();
		j.inverse_bind_pose = gb.mat4.new();
		j.offset_matrix = gb.mat4.new();
		return j;
	},
	update: function(rig, scene)
	{
		var qt = gb.quat.tmp();

		var n = rig.joints.length;
		for(var i = 0; i < n; ++i)
		{
			var j = rig.joints[i];
			gb.mat4.compose(j.local_matrix, j.position, j.scale, j.rotation);
			gb.mat4.mul(j.local_matrix, j.local_matrix, j.bind_pose);
			if(j.parent === -1)
			{
				gb.mat4.eq(j.world_matrix, j.local_matrix);
			}
			else
			{
				var parent = rig.joints[j.parent];
				gb.mat4.mul(j.world_matrix, j.local_matrix, parent.world_matrix);
			}

			gb.mat4.mul(j.offset_matrix, j.inverse_bind_pose, j.world_matrix);
		}
	},
}
gb.binary_reader.rig = function(br, ag)
{
    var s = gb.binary_reader;
    var rig = gb.rig.new();
    rig.name = s.string(br);
    var num_joints = s.i32(br);
    ASSERT(num_joints <= gb.rig.MAX_JOINTS, "Rig has too many joints!");
    for(var i = 0; i < num_joints; ++i)
    {
    	var j = new gb.Joint();
		j.position = gb.vec3.new();
		j.scale = gb.vec3.new(1,1,1);
		j.rotation = gb.quat.new();
		j.local_matrix = gb.mat4.new();
		j.world_matrix = gb.mat4.new(); 
		j.offset_matrix = gb.mat4.new();
    	j.parent = s.i32(br);
    	j.bind_pose = s.mat4(br);
    	j.inverse_bind_pose = s.mat4(br);
    	rig.joints.push(j);
    } 
    return rig;
}
gb.Render_Target = function()
{
	this.bounds;
	this.frame_buffer;
	this.render_buffer;
	this.color = null;
	this.depth = null;
	this.stencil = null;
    this.linked = false;
}

gb.render_target = 
{
    COLOR: 1,
    DEPTH: 2,
    STENCIL: 4,
    DEPTH_STENCIL: 8,

    new: function(view, mask)
    {
        var rt = new gb.Render_Target();

        if(!view) view = gb.webgl.view;

        rt.bounds = gb.rect.new();
        gb.rect.eq(rt.bounds, view);

        if(!mask) mask = gb.render_target.COLOR | gb.render_target.DEPTH;
        
        if(gb.has_flag_set(mask, gb.render_target.COLOR) === true)
        {
            rt.color = gb.texture.rgba(view.width, view.height, null, gb.webgl.samplers.linear, 0);
        }
        if(gb.has_flag_set(mask, gb.render_target.DEPTH) === true)
        {
            rt.depth = gb.texture.depth(view.width, view.height);
        }

        gb.webgl.link_render_target(rt);
        return rt;
    },
}

gb.DrawCall = function()
{
	this.depth_test = true;
	//this.camera;
	this.entities = [];
	this.material;
	this.target;
}
gb.PostCall = function()
{
	this.mesh;
	this.material;
	this.target;
}

gb.draw_call = 
{
	new: function(entities, material, target)
	{
		var r = new gb.DrawCall();
		//r.camera = camera;
		r.entities = entities;
		r.material = material;
		r.target = target;
		return r;
	},
}
gb.post_call = 
{
	new: function(material, target)
	{
		var r = new gb.PostCall();
		r.mesh = gb.mesh.quad(2,2);
		r.material = material;
		r.target = target;
		return r;
	},
}
gb.webgl = 
{
	types:
	{
        0x8B50: 'FLOAT_VEC2',
        0x8B51: 'FLOAT_VEC3',
        0x8B52: 'FLOAT_VEC4',
        0x8B53: 'INT_VEC2',
        0x8B54: 'INT_VEC3',
        0x8B55: 'INT_VEC4',
        0x8B56: 'BOOL',
        0x8B57: 'BOOL_VEC2',
        0x8B58: 'BOOL_VEC3',
        0x8B59: 'BOOL_VEC4',
        0x8B5A: 'FLOAT_MAT2',
        0x8B5B: 'FLOAT_MAT3',
        0x8B5C: 'FLOAT_MAT4',
        0x8B5E: 'SAMPLER_2D',
        0x8B60: 'SAMPLER_CUBE',
        0x1400: 'BYTE',
        0x1401: 'UNSIGNED_BYTE',
        0x1402: 'SHORT',
        0x1403: 'UNSIGNED_SHORT',
        0x1404: 'INT',
        0x1405: 'UNSIGNED_INT',
        0x1406: 'FLOAT',
    },
    config: 
    {
    	fill_container: false,
		width: 512,
		height: 512,
		resolution: 1,
		alpha: false,
	    depth: true,
	    stencil: false,
	    antialias: true,
	    premultipliedAlpha: false,
	    preserveDrawingBuffer: false,
	    preferLowPowerToHighPerformance: false,
	    failIfMajorPerformanceCaveat: false,
	    extensions: ['WEBGL_depth_texture', 
					 'WEBGL_compressed_texture_s3tc',
					 'WEBKIT_WEBGL_compressed_texture_pvrtc',
					 'OES_standard_derivatives',
					 'OES_texture_float',
					 'OES_element_index_uint'],
	},
	canvas: null,
	extensions: {},
	ctx: null,
	view: null,
	samplers: {},

	init: function(config)
	{
		var _t = gb.webgl;
		var gl;

		for(var k in config)
			_t.config[k] = config[k];

		var width = 0;
		var height = 0;
		if(_t.config.fill_container === true)
		{
			width = _t.config.container.offsetWidth * _t.config.resolution;
        	height = _t.config.container.offsetHeight * _t.config.resolution;
		}
		else
		{
        	width = _t.config.width * _t.config.resolution;
			height = _t.config.height * _t.config.resolution;
		}

		var canvas = document.createElement('canvas');
        config.container.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;
        _t.view = gb.rect.new(0,0,width,height);

        gl = canvas.getContext('webgl', _t.config);
        _t.canvas = canvas;

        //DEBUG
        ASSERT(EXISTS(gl), "Could not load WebGL");
        //_t.get_context_info(gl);
        //END

		_t.ctx = gl;

        gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL); 
    	gl.clearDepth(1.0);
		
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CCW);
		gl.enable(gl.SCISSOR_TEST);

		_t.set_viewport(_t.view);

        //gl.clearColor(0.0,0.0,0.0,0.0);
        //gl.colorMask(true, true, true, false);
    	//gl.clearStencil(0);
    	//gl.depthMask(true);
		//gl.depthRange(-100, 100); // znear zfar
		//gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        _t.samplers.default = gb.sampler.new(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);
        _t.samplers.linear = gb.sampler.new(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR);
        _t.samplers.repeat_x = gb.sampler.new(gl.WRAP, gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR);
        _t.samplers.repeat_y = gb.sampler.new(gl.CLAMP_TO_EDGE, gl.WRAP, gl.LINEAR, gl.LINEAR);
        _t.samplers.repeat = gb.sampler.new(gl.WRAP, gl.WRAP, gl.LINEAR, gl.LINEAR);

		for(var i = 0; i < _t.config.extensions.length; ++i)
		{
			var extension = _t.config.extensions[i];
			_t.extensions[extension] = gl.getExtension(extension);
			//DEBUG
			if(_t.extensions[extension] === null)
				LOG('Extension: ' + extension + ' is not supported');
			//
		}
	},

	set_clear_color: function(r,g,b,a)
	{
		gb.webgl.ctx.clearColor(r,g,b,a);
	},

	update_mesh: function(m)
	{
		var gl = gb.webgl.ctx;
		
		if(m.linked === false)
		{
			m.vertex_buffer.id = gl.createBuffer();
			if(m.index_buffer) m.index_buffer.id = gl.createBuffer();
			m.linked = true;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, m.vertex_buffer.id);
		gl.bufferData(gl.ARRAY_BUFFER, m.vertex_buffer.data, m.update_mode);
		//gl.bufferSubData
		if(m.index_buffer)
		{
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.index_buffer.id);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.index_buffer.data, m.update_mode);
		}
	},
	delete_mesh: function(m)
	{
		var gl = gb.webgl.ctx;
		gl.deleteBuffer(m.vertex_buffer.id);
		if(mesh.index_buffer) gl.deleteBuffer(m.index_buffer.id);
	},

	link_shader: function(s)
	{
		ASSERT(s.linked === false, 'Shader is already linked');

		var _t = gb.webgl;
		var gl = _t.ctx;
		var vs = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vs, s.vertex_src);
	    gl.compileShader(vs);

	    //DEBUG
	    _t.shader_compile_status(vs);
	    //END

	    var fs = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.shaderSource(fs, s.fragment_src);
	    gl.compileShader(fs);

	    //DEBUG
	    _t.shader_compile_status(fs);
	    //END

	    var id = gl.createProgram();
	    gl.attachShader(id, vs);
	    gl.attachShader(id, fs);
	    gl.linkProgram(id);

	    //DEBUG
	    _t.shader_link_status(id);
	    //END

	    ASSERT(s.id === 0, "Shader already bound to id " + s.id); 
	    s.id = id;
	    s.num_attributes = gl.getProgramParameter(id, gl.ACTIVE_ATTRIBUTES);
	    s.num_uniforms = gl.getProgramParameter(id, gl.ACTIVE_UNIFORMS);

	    for(var i = 0; i < s.num_attributes; ++i)
		{
			var attr = gl.getActiveAttrib(s.id, i);
			var sa = new gb.ShaderAttribute();
			sa.location = gl.getAttribLocation(id, attr.name);
			sa.size = attr.size;
			sa.type = attr.type;
			s.attributes[attr.name] = sa;
		}

	    var sampler_index = 0;
	    for(var i = 0; i < s.num_uniforms; ++i)
	    {
	        var uniform = gl.getActiveUniform(id, i);
	        var su = new gb.ShaderUniform();
	        su.location = gl.getUniformLocation(id, uniform.name);
	        su.type = _t.types[uniform.type];
	        if(su.type === 'SAMPLER_2D')
	        {
	        	su.sampler_index = sampler_index;
	        	sampler_index++;
	        }
	        su.size = uniform.size;
	        s.uniforms[uniform.name] = su;
	    }

	    s.linked = true;
	    return s;
	},
	use_shader: function(s)
	{
		gb.webgl.ctx.useProgram(s.id);
	},
	delete_shader: function(s)
	{
		//detachShader
	},

	set_state: function(val, state)
	{
		if(state === true) gb.webgl.ctx.enable(val);
		else gb.webgl.ctx.disable(val);
	},
	
	set_sampler:function(s)
	{
		var gl = gb.webgl.ctx;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, s.x);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, s.y);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, s.up);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, s.down);
	},
	
	update_texture: function(t)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;

		if(t.linked === false)
		{
			t.id = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, t.id);
			t.linked = true;
		}

		ASSERT(t.dirty === true, 'Texture already updated');

		_t.set_sampler(t.sampler);

		if(t.compressed === true)
		{
			gl.compressedTexImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.pixels);
		}
		else
		{
			gl.texImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.format, t.byte_size, t.pixels);
		}
		if(t.mipmaps > 1) 
		{
			//gl.hint(gl.GENERATE_MIPMAP_HINT, t.mipmap_hint) gl.FASTEST, NICEST, DONT_CARE
			gl.generateMipmap(gl.TEXTURE_2D);
		}

		t.dirty = false;
	},
	delete_texture: function(t)
	{

	},

	set_viewport: function(v)
	{
		var gl = gb.webgl.ctx;
		gl.viewport(v.x, v.y, v.width, v.height);
		gl.scissor(v.x, v.y, v.width, v.height);
	},

	new_render_buffer: function(width, height)
	{
		var gl = gb.webgl.ctx;
		var rb = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
		return rb;
	},

	set_render_target: function(rt, clear)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		if(rt === null)
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
			_t.set_viewport(_t.view);
			if(clear === true) _t.ctx.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}
		else
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, rt.frame_buffer);
			gl.bindRenderbuffer(gl.RENDERBUFFER, rt.render_buffer);
			_t.set_viewport(rt.bounds);
			if(clear === true)
			{
				var mode = 0;
				if(rt.color) mode |= gl.COLOR_BUFFER_BIT;
				if(rt.depth) mode |= gl.DEPTH_BUFFER_BIT;
				gl.clear(mode);
			}
		}
	},

	set_render_target_attachment: function(attachment, texture)
	{
		var gl = gb.webgl.ctx;
		gl.bindTexture(gl.TEXTURE_2D, texture.id);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture.id, 0);
	},

	link_render_target: function(rt)
	{
		ASSERT(rt.linked === false, 'Render target already linked');

		var _t = gb.webgl;
		var gl = _t.ctx;
		rt.frame_buffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, rt.frame_buffer);

		if(rt.color !== null)
		{
			_t.set_render_target_attachment(gl.COLOR_ATTACHMENT0, rt.color);
		}
		if(rt.depth !== null)
		{
			_t.set_render_target_attachment(gl.DEPTH_ATTACHMENT, rt.depth);
		}
		else
		{
			rt.render_buffer = _t.new_render_buffer(rt.bounds.width, rt.bounds.height);
		}

		//DEBUG
		_t.verify_render_target();
		//END

		rt.linked = true;
	},

	draw_mesh: function(mesh)
	{
		var gl = gb.webgl.ctx;
		if(mesh.index_buffer)
		{
    		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
        	gl.drawElements(mesh.layout, mesh.index_count, gl.UNSIGNED_INT, 0);
		}
		else
		{
			gl.drawArrays(mesh.layout, 0, mesh.vertex_count);
		}
	},

	link_attributes: function(shader, mesh)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var vb = mesh.vertex_buffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, vb.id);

		for(var k in shader.attributes)
		{
			var sa = shader.attributes[k];
			var va = vb.attributes[k];

			ASSERT(va !== undefined, 'Shader wants attribute ' + k + ' but mesh does not have it');

			gl.enableVertexAttribArray(sa.location);
			gl.vertexAttribPointer(sa.location, va.size, gl.FLOAT, va.normalized, vb.stride * 4, va.offset * 4);
		}
	},

	set_uniforms: function(material)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var shader = material.shader;
		for(var key in shader.uniforms)
		{
			var uniform = shader.uniforms[key];
			var loc = uniform.location;
			var val = material[key];
			ASSERT(EXISTS(val), "Could not find shader uniform " + key + " in material " + material.name);
			switch(uniform.type)
			{
				case 'FLOAT': 
		        {
					gl.uniform1f(loc, val);
					break;
				}
				case 'FLOAT_VEC2':
				{
					gl.uniform2f(loc, val[0], val[1]);
					break;
				}
		        case 'FLOAT_VEC3':
		        {
					gl.uniform3f(loc, val[0], val[1], val[2]);
					break;
				}
		        case 'FLOAT_VEC4':
		        {
					gl.uniform4f(loc, val[0], val[1], val[2], val[3]);
					break;
				}
		        case 'BOOL':
		        {
		        	if(val === true) gl.uniform1i(loc, 1);
		        	else gl.uniform1i(loc, 0);
		        	break;
		        }
		        case 'FLOAT_MAT2':
		        {
		        	gl.uniformMatrix2fv(loc, false, val);
		        	break;
		        }
		        case 'FLOAT_MAT3':
		        {
					gl.uniformMatrix3fv(loc, false, val);
					break;
				}
		        case 'FLOAT_MAT4':
		        {
					gl.uniformMatrix4fv(loc, false, val);
					break;
				}
		        case 'SAMPLER_2D':
		        {
					gl.uniform1i(loc, uniform.sampler_index);
					gl.activeTexture(gl.TEXTURE0 + uniform.sampler_index);
					gl.bindTexture(gl.TEXTURE_2D, val.id);
					break;
				}
		        case 'SAMPLER_CUBE':
		        {
		        	break;
		        }
		        case 'INT':
		        {
					gl.uniform1i(loc, val);
					break;
				}
				 case 'INT_VEC2':
		        {
		        	gl.uniform2i(loc, val[0], val[1]);
		        	break;
		        }
		        case 'INT_VEC3':
		        {
		        	gl.uniform3i(loc, val[0], val[1], val[2]);
		        	break;
		        }
		        case 'INT_VEC4':
		        {
		        	gl.uniform3i(loc, val[0], val[1], val[2], val[3]);
		        	break;
		        }
				default:
				{
					ASSERT(false, uniform.type + ' is an unsupported uniform type');
				}
			}
		}
	},

	render_scene: function(scene, camera, target)
	{
		var _t = gb.webgl;
		_t.render_draw_call(camera, scene, scene.draw_items, scene.num_draw_items, null, target, true, true);
	},

	render_draw_call: function(camera, scene, ids, count, material, target, clear, depth)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var n = count;
		
		_t.set_state(gl.DEPTH_TEST, depth);
		_t.set_render_target(target, clear);

		gl.depthRange(camera.near, camera.far);

		if(material)
		{
			_t.use_shader(material.shader);
			gb.material.set_camera_uniforms(material, camera);
			for(var i = 0; i < n; ++i)
			{
				var id = ids[i];
				var e = scene.entities[id];
				gb.material.set_entity_uniforms(material, e, camera); //NOTE: prolly not needed on mats?
				_t.link_attributes(material.shader, e.mesh);
				_t.set_uniforms(material);
				_t.draw_mesh(e.mesh);
			}
		}
		else
		{
			for(var i = 0; i < n; ++i)
			{
				var id = ids[i];
				var e = scene.entities[id];
				var material = e.material;
				_t.use_shader(material.shader);
				gb.material.set_camera_uniforms(material, camera);
				gb.material.set_entity_uniforms(material, e, camera);
				_t.link_attributes(material.shader, e.mesh);
				_t.set_uniforms(material);
				_t.draw_mesh(e.mesh);
			}
		}
	},

	render_post_call: function(pc)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;

		_t.set_render_target(pc.target, true);

		gl.disable(gl.DEPTH_TEST);
		_t.use_shader(pc.material.shader);
		_t.link_attributes(pc.material.shader, pc.mesh);
		_t.set_uniforms(pc.material);
		_t.draw_mesh(pc.mesh);
	},


    //DEBUG
    get_context_info: function(gl)
	{
		LOG("AA Size: " + gl.getParameter(gl.SAMPLES));
		LOG("Shader High Float Precision: " + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT));
		LOG("Max Texture Size: " + gl.getParameter(gl.MAX_TEXTURE_SIZE) + "px");
		LOG("Max Cube Map Size: " + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE) + "px");
		LOG("Max Render Buffer Size: " + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) + "px");
		LOG("Max Vertex Shader Texture Units: " + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
		LOG("Max Fragment Shader Texture Units: " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
		LOG("Max Combined Texture Units: " + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
		LOG("Max Vertex Shader Attributes: " + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
		LOG("Max Vertex Uniform Vectors: " + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
		LOG("Max Frament Uniform Vectors: " + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
		LOG("Max Varying Vectors: " + gl.getParameter(gl.MAX_VARYING_VECTORS));

		var supported_extensions = gl.getSupportedExtensions();
		for(var i = 0; i < supported_extensions.length; ++i)
		{
			LOG(supported_extensions[i]);
		}
	},
	verify_context: function()
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		if(gl.isContextLost())
		{
			gl.error("Lost WebGL context");
			// attempt recovery
		}
	},
	shader_compile_status: function(s)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
	    var success = gl.getShaderParameter(s, gl.COMPILE_STATUS);
	    if(!success)
	    {
	        console.error("Shader Compile Error: " + gl.getShaderInfoLog(s));
	    }
	},
	shader_link_status: function(p)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
	    var success = gl.getProgramParameter(p, gl.LINK_STATUS);
	    if(!success)
	    {
	        console.error("Shader Link Error: " + gl.getProgramInfoLog(p));
	    }
	},
	verify_render_target: function(gl)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if(status != gl.FRAMEBUFFER_COMPLETE)
		{
			console.error('Error creating framebuffer: ' +  status);
		}
	}
	//END
}
gb.Asset_Group = function()
{
    this.shaders = {};
    this.materials = {};
    this.animations = {};
    this.entities = {};
    this.meshes = {};
    this.textures = {};
    this.rigs = {};
    this.curves = {};
    this.sounds = {};
}

gb.assets = 
{
    load: function(url, on_load, on_progress)
    {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = gb.assets.event_asset_load;
        request.onprogress = on_progress || gb.event_load_progress;
        request.responseType = 'arraybuffer';
        request.upload.callback = on_load;
        request.send();
    },
    event_asset_load: function(e)
    {
        if(e.target.status === 200)
        {
            var s = gb.binary_reader;
            var br = new gb.Binary_Reader(e.target.response);
            LOG("Asset File Size: " + br.buffer.byteLength + " bytes");

            var ag = new gb.Asset_Group();

            var asset_load_complete = false;
            while(asset_load_complete === false)
            {
                var asset_load_type = s.i32(br);
                switch(asset_load_type)
                {
                    case 0:
                    {
                        var shader = s.shader(br);
                        ag.shaders[shader.name] = shader;
                        break;
                    }
                    case 1:
                    {
                        var scene = s.scene(br, ag);
                        break;
                    } 
                    case 2:
                    {
                        var texture = s.dds(br);
                        ag.textures[texture.name] = texture;
                        break;
                    }
                    case 3:
                    {
                        var texture = s.pvr(br);
                        ag.textures[texture.name] = texture;
                        break;
                    } 
                    case -1:
                    {
                        asset_load_complete = true;
                        break;
                    }
                    default:
                    {
                        console.error("Invalid asset load type: " + asset_load_type);
                        asset_load_complete = true;
                    }
                }
            }

            e.target.upload.callback(ag);    
        }
        else
        {
            console.error("Resource failed to load");
        }
    }
}
//DEBUG
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

		var e = gb.entity.new();
		_t.entity = e;
		_t.matrix = e.world_matrix;
		e.entity_type = gb.EntityType.ENTITY;

		_t.offset = 0;
		_t.color = gb.color.new(1,1,1,1);

		var vb = gb.vertex_buffer.new();
		gb.vertex_buffer.add_attribute(vb, 'position', 3, false);
		gb.vertex_buffer.add_attribute(vb, 'color', 4, true);
		gb.vertex_buffer.alloc(vb, config.buffer_size);

		var m = gb.mesh.new(vb, null, 'LINES', 'DYNAMIC_DRAW');
	    e.mesh = m;
	    _t.mesh = m;

	    var vs = 'attribute vec3 position;attribute vec4 color;uniform mat4 mvp;varying vec4 _color;void main(){_color = color;gl_Position = mvp * vec4(position, 1.0);}';
	    var fs = 'precision highp float;varying vec4 _color;void main(){gl_FragColor = _color;}'; 
	    e.material = gb.material.new(gb.shader.new(vs,fs));
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

		gl.update_mesh(_t.entity.mesh);
		gl.use_shader(_t.entity.material.shader);
		gb.material.set_camera_uniforms(_t.entity.material, camera);
		gb.material.set_entity_uniforms(_t.entity.material, _t.entity, camera);
		gl.link_attributes(_t.entity.material.shader, _t.entity.mesh);
		gl.set_uniforms(_t.entity.material);
		gl.set_state(gl.ctx.DEPTH_TEST, false);
		gl.set_render_target(target, false);
		gl.ctx.depthRange(camera.near, camera.far);
		gl.ctx.lineWidth = _t.thickness;
		gl.draw_mesh(_t.entity.mesh);

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
gb.Debug_View = function()
{
	this.root;
	this.container;
	this.observers = [];
	this.controllers = [];
}
gb.Debug_Observer = function()
{
	this.element;
	this.in_use;
	this.is_watching;
	this.label;
	this.target;
	this.property;
	this.index;
}
gb.Debug_Controller = function()
{
	this.name;
	this.label;
	this.slider;
	this.value;
}

gb.debug_view =
{
	new: function(root, x, y, opacity)
	{
		var view = new gb.Debug_View();
		view.root = root;

		var container = document.createElement('div');
		container.classList.add('gb-debug-view');
		container.style.left = x || 10;
		container.style.top = y || 10;
		container.style.opacity = opacity || 0.95;
		view.container = container;

		var MAX_OBSERVERS = 10;
		for(var i = 0; i < MAX_OBSERVERS; ++i)
		{
			var element = document.createElement('div');
			element.classList.add('gb-debug-observer');
			element.classList.add('gb-debug-hidden');
			container.appendChild(element);

			var observer = new gb.Debug_Observer();
			observer.element = element;
			observer.in_use = false;
			observer.is_watching = false;
			view.observers.push(observer);
		}
		
		root.appendChild(container);
		return view;
	},
	update: function(view)
	{
		var n = view.observers.length;
		for(var i = 0; i < n; ++i)
		{
			var observer = view.observers[i];
			if(observer.is_watching === true)
			{
				var val;
				var target = observer.target;
				var prop = observer.property;
				var index = observer.index;
				if(index === -1)
				{
					val = target[prop];
				}
				else
				{
					val = target[prop][index];
				}
				observer.element.innerText = observer.label + ": " + val;
				continue;
			}
			if(observer.in_use === true)
			{
				observer.in_use = false;
				observer.element.classList.add('gb-debug-hidden');
			}
		}
		n = view.controllers.length;
		for(var i = 0; i < n; ++i)
		{
			var controller = view.controllers[i];
			controller.value = controller.slider.value;
			controller.label.innerText = controller.name + ': ' + controller.value;
		}
	},
	label: function(view, label, val)
	{
		var n = view.observers.length;
		for(var i = 0; i < n; ++i)
		{
			var observer = view.observers[i];
			if(observer.in_use === false)
			{
				observer.element.innerText = label + ": " + val;
				observer.element.classList.remove('gb-debug-hidden');
				observer.in_use = true;
				return;
			}
		}
		LOG('No free observers available');
	},
	watch: function(view, label, target, property, index)
	{
		var n = view.observers.length;
		for(var i = 0; i < n; ++i)
		{
			var observer = view.observers[i];
			if(observer.in_use === false)
			{
				observer.label = label;
				observer.target = target;
				observer.property = property;
				observer.index = index || -1;
				observer.in_use = true;
				observer.is_watching = true;
				observer.element.classList.remove('gb-debug-hidden');
				return;
			}
		}
		LOG('No free observers available');
	},
	control: function(view, name, min, max, step, initial_value)
	{
		initial_value = initial_value || 0;

		var label = document.createElement('div');
		label.classList.add('gb-debug-label');
		label.innerText = name + ': ' + initial_value;
		view.container.appendChild(label);

		var slider = document.createElement('input');
		slider.setAttribute('type', 'range');

		slider.classList.add('gb-debug-slider');
		slider.min = min;
		slider.max = max;
		slider.step = step;
		slider.defaultValue = initial_value;
		slider.value = initial_value;
		view.container.appendChild(slider);

		var controller = new gb.Debug_Controller();
		controller.name = name;
		controller.label = label;
		controller.slider = slider;
		view.controllers.push(controller);

		return controller;
	},
}
//END
gb.camera.fly = function(c, dt, vertical_limit)
{
	if(c.fly_mode === undefined) 
	{
		c.fly_mode = false;
		c.angle_x = 0;
		c.angle_y = 0;
	}
	if(gb.input.down(gb.Keys.f))
	{
		c.fly_mode = !c.fly_mode;
	}
	if(c.fly_mode === false) return;

	var e = c.entity;
	var index = gb.vec3.stack.index;

	var m_delta = gb.input.mouse_delta;
	var ROTATE_SPEED = 30.0;

	c.angle_x -= m_delta[1] * ROTATE_SPEED * dt;
	c.angle_y -= m_delta[0] * ROTATE_SPEED * dt;
	
	if(c.angle_x > vertical_limit) c.angle_x = vertical_limit;
	if(c.angle_x < -vertical_limit) c.angle_x = -vertical_limit;

	var rot_x = gb.quat.tmp();
	var rot_y = gb.quat.tmp();
	var rot = gb.quat.tmp();
	var right = gb.vec3.tmp(1,0,0);
	var up = gb.vec3.tmp(0,1,0);

	gb.quat.angle_axis(rot_x, c.angle_x, right);
	gb.quat.angle_axis(rot_y, c.angle_y, up);

	gb.quat.mul(rot, rot_y, rot_x);
	gb.quat.mul(e.rotation, rot_y, rot_x);

	var move = gb.vec3.tmp();
	var MOVE_SPEED = 1.0;
	if(gb.input.held(gb.Keys.a))
	{
		move[0] = -MOVE_SPEED * dt;
	}
	else if(gb.input.held(gb.Keys.d))
	{
		move[0] = MOVE_SPEED * dt;
	}
	if(gb.input.held(gb.Keys.w))
	{
		move[2] = -MOVE_SPEED * dt;
	}
	else if(gb.input.held(gb.Keys.s))
	{
		move[2] = MOVE_SPEED * dt;
	}

	gb.mat4.mul_dir(move, e.world_matrix, move);
	gb.vec3.add(e.position, move, e.position);
	e.dirty = true;

	gb.entity.update(c.entity);

	// Draw reticule cross... (yeah, I know)

	var vx = gb.webgl.view.width / 2;
	var vy = gb.webgl.view.height / 2;

	var size = 5;
	var ct = v3.tmp(vx, vy + size,0);
	var cb = v3.tmp(vx, vy - size,0);
	var cl = v3.tmp(vx - size, vy);
	var cr = v3.tmp(vx + size, vy);
	gb.projections.screen_to_world(ct, c.view_projection, ct, gb.webgl.view);
	gb.projections.screen_to_world(cb, c.view_projection, cb, gb.webgl.view);
	gb.projections.screen_to_world(cl, c.view_projection, cl, gb.webgl.view);
	gb.projections.screen_to_world(cr, c.view_projection, cr, gb.webgl.view);
	gb.gl_draw.line(ct, cb);
	gb.gl_draw.line(cl, cr);

	gb.vec3.stack.index = index;
}

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var input = gb.input;
var scene = gb.scene;
var character;
var surface_target;
var fxaa_pass;

function init()
{
	gb.init(
	{
		config:
		{
			frame_skip: false,
			update: update, 
			render: render,
		},
	});
	gb.assets.load("assets/assets.gl", load_complete);
}

function load_complete(ag)
{
	character = scene.find('cube');
	gb.entity.set_armature(character, ag.rigs.armature);
	ag.animations.test.target = character.rig.joints;
	gb.animation.play(ag.animations.test, -1);

	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(ag.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);

	gb.allow_update = true;
}

function update(dt)
{
	gb.camera.fly(scene.current.active_camera, dt, 80);
	gb.gl_draw.rig_transforms(character.rig);
}

function render()
{
	var s = scene.current;
	gl.render_draw_call(s.active_camera, s, s.draw_items, s.num_draw_items, null, null, true, true);
	gb.gl_draw.render(s.active_camera, null);
	//gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);


