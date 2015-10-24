'use strict';

///INCLUDE demos/wgl_dev.js
///INCLUDE demos/fluid_sim.js
///INCLUDE demos/particles.js
///INCLUDE demos/gravity.js
///INCLUDE demos/impulse.js
///INCLUDE demos/lines.js
///INCLUDE demos/lines2.js
///INCLUDE demos/lines3.js
///INCLUDE demos/lines4.js
///INCLUDE demos/orb.js
///INCLUDE demos/shapes.js
///INCLUDE demos/diamond.js
/*
TODO: 
- dds mipmaps
- deferred rendering
- PBR
- basic sound
- mesh gen
- particles
*/

//DEBUG
function ASSERT(expr, message)
{
    if(expr === false) console.error(message);
}
function LOG(message)
{
	console.log(message);
}
//END

var gb = 
{
	has_focus: true,
	init: function(){},
	update: function(t){},

	focus: function(e)
	{
		gb.has_focus = true;
		//DEBUG
		console.log('focus');
		//END
	},
	blur: function(e)
	{
		gb.has_focus = false;
		//DEBUG
		console.log('blur');
		//END
	},
	_init: function(e)
	{
		if(gb.init) gb.init();
		gb.time.init();
		if(gb.update) requestAnimationFrame(gb._update);
	},
	_update: function(t)
	{
		gb.time.update(t);
		if(gb.time.paused || gb.has_focus === false)
		{
			gb.input.update();
			requestAnimationFrame(gb._update);
			return;
		}
		gb.stack.clear_all();
		gb.update(t);
		gb.input.update();
		requestAnimationFrame(gb._update);
	},

	has_flag_set: function(mask, flag)
	{
	    return (flag & mask) === flag;
	}
}
window.addEventListener('load', gb._init, false);
window.onfocus = gb.focus;
window.onblur = gb.blur;

gb.dom = 
{
	insert: function(type, parent)
	{
		var el = document.createElement(type);
        parent.appendChild(el);
        return el;
	},
	div: function(parent, classes)
	{
		var e = gb.dom.insert('div', parent);
		if(classes !== null) gb.dom.set_class(e, classes);
		return e;
	},
	add_stylesheet: function(url)
	{
		var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.type =  'text/css';
        l.href =  url;
        document.head.appendChild(l);
	},
	set_class: function(el, c)
	{
		el.className = c;
	},
	add_class: function(el, c)
	{
		el.classList.add(c);
	},
	remove_class: function(el, c)
	{
		el.classList.remove(c);
	},
	find: function(query)
	{
		return document.querySelector(query);
	},
	set_transform: function(el, sx, sy, tx, ty, r)
	{
		var ang = r * gb.math.DEG2RAD;
		var a = Math.cos(ang) * sx;
		var b = -Math.sin(ang);
		var c = tx;
		var d = Math.sin(ang);
		var e = Math.cos(ang) * sy;
		var f = ty;

		var matrix = "matrix("+a+","+b+","+d+","+e+","+c+","+f+")";

		el.style["webkitTransform"] = matrix;
		el.style.MozTransform = matrix;
		el.style["oTransform"] = matrix;
		el.style["msTransform"] = matrix;
	},
	add_event: function(el, event, handler)
	{
		el.addEventListener(event, handler, false);
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
	began: 0,
    elapsed: 0,
    now: 0,
    last: 0,
    dt: 0,
    at: 0,
    scale: 1,
    paused: false,

    init: function()
    {
        var _t = gb.time;
    	_t.time_elapsed = 0;
        if(window.performance) _t.time_start = window.performance.now();
        else _t.time_start = Date.now();
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

gb.serialize =
{
	r_i32: function(br)
	{
		var r = br.bytes.getInt32(br.offset, true);
		br.offset += 4;
		return r;
	},
	r_f32: function(br)
	{
		var r = br.bytes.getFloat32(br.offset, true);
		br.offset += 4;
		return r;
	},
	r_string: function(br)
	{
		var _t = gb.serialize;
		var pad = _t.r_i32(br);
        var l = _t.r_i32(br);
    	var r = String.fromCharCode.apply(null, new Uint8Array(br.buffer, br.offset, l));
        br.offset += l;
        br.offset += pad;
        return r;
	},
	r_f32_array: function(br, l)
	{
		var r = new Float32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	r_u32_array: function(br, l)
	{
		var r = new Uint32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	r_i32_array: function(br, l)
	{
		var r = new Int32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
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
		var x; var y;
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
		r[0] = a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2];
		r[1] = a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1];
		r[2] = a[3] * b[1] + a[1] * b[3] + a[2] * b[0] - a[0] * b[2];
		r[3] = a[3] * b[2] + a[2] * b[3] + a[0] * b[1] - a[1] * b[0];
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
		if(l > gb.math.EPSILON)
		{
			qt.mulf(r, q, 1 / l);
		} 
		else
		{
			qt.eq(r, q);
		}
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
		var t = -t.tmp(0,0,0,1);
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
		var h = 0.5 * (angle * m.DEG2RAD);
		var s = m.sin(h);	
		r[0] = s * axis[0];
		r[1] = s * axis[1];
		r[2] = s * axis[1];
		r[3] = m.cos(s);
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

	mul_projection: function(r, m, p)
	{
		var d = 1 / (m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]);
		var x = (m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12]) * d;
		var y = (m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13]) * d;
		var z = (m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]) * d;
		r[0] = x; r[1] = y; r[2] = z;
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
gb.Bezier = function()
{
	this.a = gb.vec3.new(0,0,0);
	this.b = gb.vec3.new(0,0,0);
	this.c = gb.vec3.new(0,0,0);
	this.d = gb.vec3.new(0,0,0);
}
gb.bezier = 
{
	stack: new gb.Stack(gb.Bezier, 5),

	new: function()
	{
		return new gb.Bezier();
	},
	free: function(ax,ay, bx,by, cx,cy, dx,dy)
	{
		var curve = new gb.Bezier();
		curve.a[0] = ax;
		curve.a[1] = ay;
		curve.b[0] = bx;
		curve.b[1] = by;
		curve.c[0] = cx;
		curve.c[1] = cy;
		curve.d[0] = dx;
		curve.d[1] = dy;
		return curve;
	},
	clamped: function(a,b,c,d)
	{
		var curve = new gb.Bezier();
		curve.b[0] = a;
		curve.b[1] = b;
		curve.c[0] = c;
		curve.c[1] = d;
		curve.d[0] = 1;
		curve.d[1] = 1;
		return curve;
	},
	tmp: function()
	{
		var _t = gb.bezier;
		var r = gb.stack.get(_t.stack);
		return r;
	},
	eval: function(r, b, t)
	{
		var u = 1.0 - t;
		var tt = t * t;
		var uu = u * u;
		var uuu = uu * u;
		var ttt = tt * t;

		for(var i = 0; i < 3; ++i)
			r[i] = (uuu * b.a[i]) + 
				   (3 * uu * t * b.b[i]) + 
				   (3 * u * tt * b.c[i]) + 
				   (ttt * b.d[i]);
	},
	eval_f: function(b, t)
	{
		var u = 1.0 - t;
		var tt = t * t;
		var uu = u * u;
		var uuu = uu * u;
		var ttt = tt * t;

		return (uuu * b.a[1]) + 
			   (3 * uu * t * b.b[1]) + 
			   (3 * u * tt * b.c[1]) + 
			   (ttt * b.d[1]);
	}
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

		draw.text("TA: " + ta, 10, 30)
		draw.text("TB: " + tb, 10, 60);

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
gb.random = 
{
	int: function(min, max)
	{
    	return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	float: function(min, max)
	{
    	return Math.random() * (max - min) + min;
	},
	float_fuzzy: function(f, fuzz)
	{
		return gb.random.float(f-fuzz, f+fuzz);
	},
	vec2: function(r, min_x, max_x, min_y, max_y)
	{
		r[0] = Math.random() * (max_x - min_x) + min_x;
		r[1] = Math.random() * (max_y - min_x) + min_y;
	},
	vec2_fuzzy: function(r, x,y, fuzz)
	{
		gb.random.vec2(r, x-fuzz, x+fuzz, y-fuzz, y+fuzz);
	},
	vec3: function(r, min_x, max_x, min_y, max_y, min_z, max_z)
	{
		r[0] = Math.random() * (max_x - min_x) + min_x;
		r[1] = Math.random() * (max_y - min_x) + min_y;
		r[2] = Math.random() * (max_z - min_x) + min_z;
	},
	rotation: function(r, min_x, max_x, min_y, max_y, min_z, max_z)
	{
		var x = Math.random() * (max_x - min_x) + min_x;
		var y = Math.random() * (max_y - min_x) + min_y;
		var z = Math.random() * (max_z - min_x) + min_z;
		gb.quat.euler(r, x,y,z);
	},
	color: function(r, min_r, max_r, min_g, max_g, min_b, max_b, min_a, max_a)
	{
		r[0] = Math.random() * (max_r - min_r) + min_r;
		r[1] = Math.random() * (max_g - min_g) + min_g;
		r[2] = Math.random() * (max_b - min_b) + min_b;
		r[3] = Math.random() * (max_a - min_a) + min_a;
	},
	unit_circle: function(r)
	{
		var x = gb.rand.float(-1,1);
		var y = gb.rand.float(-1,1);
		var l = 1 / gb.math.sqrt(x * x + y * y);
		r[0] = x * l;
		r[1] = y * l;
	}
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

	init: function(root, config)
	{
		var _t = gb.input;
		root.onkeydown 	 = _t.key_down;
		root.onkeyup 	 = _t.key_up;
		root.onmousedown = _t.key_down;
		root.onmouseup   = _t.key_up;
		root.onmousemove = _t.mouse_move;

		root.addEventListener("wheel", _t.mouse_wheel, false);

		for(var i = 0; i < 256; ++i)
		{
			_t.keys[i] = 0;
		}

		var keycodes = config.keycodes;
		var n = keycodes.length;
		for(var i = 0; i < n; ++i)
		{
			_t.keys[keycodes[i]] = gb.KeyState.RELEASED;
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

		var dx = _t.last_mouse_position[0] - _t.mouse_position[0];
		var dy = _t.last_mouse_position[1] - _t.mouse_position[1];
		gb.vec3.eq(_t.last_mouse_position, _t.mouse_position);
		gb.vec3.set(_t.mouse_delta, dx, dy, 0);
	},

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
		gb.vec3.set(_t.mouse_position, x, y, 0);
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
/*
plx.Animation = function(tweens)
{
	this.tweens = tweens || [];
	this.curve = plx.ease;
	this.loops = 1;
	this.loops_count = 0;
	this.is_playing = false;
	this.manual_play = false;
	this.callback = callback;
	this.t = 0;
	this.time_scale = 1;
	return this;
}
*/

gb.Animation = function()
{
	this.name;
	this.is_playing = false;
	this.auto_play = true;
	this.t = 0;
	this.time_scale = 1;
	this.target; 
	this.tweens = [];
	return this;
}
gb.Tween = function()
{
	this.property;
	this.index = -1;
	this.keyframes = [];
	return this;
}
gb.Keyframe = function()
{
	this.value;
	this.t;
	this.handles = new Float32Array(4);
	return this;
}

gb.animation = 
{
	update: function(animation, dt)
	{
		if(animation.is_playing === false) return;

		if(animation.auto_play === true)
			animation.t += dt; 

		var num_tweens = animation.tweens.length;
		for(var i = 0; i < num_tweens; ++i)
		{
			var tween = animation.tweens[i];
			var key_start;
			var key_end;
			//get keys we are between
			var num_keys = tween.keyframes.length;
			for(var j = 1; j < num_keys; ++j)
			{
				key_start = tween.keyframes[j-1];
				key_end = tween.keyframes[j];
				if(animation.t < key_end.t && animation.t >= key_start.t)
				{
					//console.log(j);
					break;
				}
			}			

			var time_range = key_end.t - key_start.t;
			var value_range = key_end.value - key_start.value;

			//normalize time by our range
			var nt = (animation.t - key_start.t) / time_range;

			//if(nt < 0.0) nt = 0.0;
			if(nt > 1.0) nt = 1.0;
			/*
			var ax = key_start.handles[0];
			var ay = key_start.handles[1];
			var bx = key_start.handles[2];
			var by = key_start.handles[3];
			var cx = key_end.handles[0];
			var cy = key_end.handles[1];
			var dx = key_end.handles[2];
			var dy = key_end.handles[3];
			*/
			var ax = key_start.t;
			var ay = key_start.value;
			var bx = key_start.handles[2];
			var by = key_start.handles[3];
			var cx = key_end.handles[0];
			var cy = key_end.handles[1];
			var dx = key_end.t;
			var dy = key_end.value;


			var t = nt;
			var u = 1.0 - t;
			var tt = t * t;
			var uu = u * u;
			var uuu = uu * u;
			var ttt = tt * t;

			var value = (uuu * ay) + 
				   (3 * uu * t * by) + 
				   (3 * u * tt * cy) + 
				   (ttt * dy);

			if(tween.index === -1)
			{
				animation.target[tween.property] = value;
			}
			else
			{
				animation.target[tween.property][tween.index] = value;
			}
		}
	},
}

//advance the animation
//for each channel in a tween
//evaluate the value for each channel
//tween.target[channel.property][channel.index] = evaluate(channel.keyframes, t)


/*
gb.Keyframe = function()
{
	this.value;
	this.curve;
	this.t;
}
gb.Tween = function()
{
	this.t = 0;
	this.frame = 1;
	this.target;

	this.frames;
	this.playing;
	this.modifier;
	this.loops;
	this.loops_remaining;
	this.next;
	this.callback;
}

gb.animate = 
{
	tweens: [],

	new: function(target, modifier, callback)
	{
		var t = new gb.Tween();
		t.frames = [];
		t.current = target;
		t.playing = false;
		t.frame = 0;
		t.loop_count = 0;
		t.next = null;
		t.t = 0;
		t.modifier = modifier;
		t.callback = callback;
		gb.animate.tweens.push(t);
		return t;
	},

	add_frame: function(tween, value, t, curve)
	{
		var f = new gb.Keyframe();
		f.value = value;
		f.t = t;
		f.curve = curve;
		tween.frames.push(f);
	},
	from_to: function(from, to, current, duration, curve, modifier)
	{
		var t = gb.animate.new(current, modifier, null);
		gb.animate.add_frame(t, from, 0, curve);
		gb.animate.add_frame(t, to, duration, null);
		return t;
	},
	play: function(t)
	{
		t.playing = true;
		t.t = 0;
		t.frame = 1;
	},
	set_frame: function(t, frame)
	{
		t.playing = true;
		t.frame = frame+1;
		t.t = t.frames[frame].t;
	},
	set_time: function(t, time)
	{
		var n = t.frames.length;
		for(var i = 0; i < n; ++i)
		{
			var f = t.frames[i];
			if(f.t > time)
				t.frame = i;
		}
		t.t = time;
	},
	pause: function(t)
	{
		t.playing = false;
	},
	resume: function(t)
	{
		t.playing = true;
	},
	loop: function(t, count)
	{
		t.loop_count = count || -1;
		gb.animate.play(t);	
	},

	update: function(dt)
	{
		var _t = gb.animate;
		var n = _t.tweens.length;
		var cr = gb.vec3.tmp();

		for(var i = 0; i < n; ++i)
		{
			var t = _t.tweens[i];
			if(t.playing === false) continue;

			var kfA = t.frames[t.frame-1];
			var kfB = t.frames[t.frame];

			t.t += dt;
			var alpha = (t.t - kfA.t) / (kfB.t - kfA.t);

			if(alpha > 1.0)
			{
				t.frame += 1;
				var n_frames = t.frames.length;
				if(t.frame === n_frames)
				{
					if(t.loop_count === -1)
					{
						t.t = 0;
						t.frame = 1;
					}
					else 
					{
						t.loop_count -= 1;
						if(t.loop_count === 0)
						{
							alpha = 1.0;
							t.playing = false;
						}
						else
						{
							t.t = 0;
							t.frame = 1;
						}
					}
				}
				else
				{
					kfA = t.frames[t.frame-1];
					kfB = t.frames[t.frame];
					alpha = (t - kfA.t) / (kfB.t - kfA.t);
				}
			}

			var ct = alpha;
			if(kfA.curve)
			{
				gb.bezier.eval(cr, kfA.curve, alpha);
				ct = cr[1];
			}
			t.modifier(t.current, kfA.value, kfB.value, ct);
			
			if(t.playing === false)
			{
				if(t.next !== null) _t.play(t.next);
				if(t.callback !== null) t.callback();
			} 
		}
	}
}
*/

gb.serialize.r_action = function(br)
{
    var s = gb.serialize;
    var animation = new gb.Animation();
    animation.name = s.r_string(br);
   
    var num_curves = s.r_i32(br);
    for(var i = 0; i < num_curves; ++i)
    {
    	var tween = new gb.Tween();
    	tween.property = s.r_string(br);
    	tween.index = s.r_i32(br);

    	var num_frames = s.r_i32(br);
    	for(var j = 0; j < num_frames; ++j)
    	{
    		var kf = new gb.Keyframe();
    		kf.t = s.r_f32(br);
    		kf.value = s.r_f32(br);
    		kf.handles[0] = s.r_f32(br);
    		kf.handles[1] = s.r_f32(br);
    		kf.handles[2] = s.r_f32(br);
    		kf.handles[3] = s.r_f32(br);
    		tween.keyframes.push(kf);
    	}
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
}
gb.Entity = function()
{
	this.name;
	this.id;
	this.entity_type = gb.EntityType.ENTITY;
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

	//this.material = null;
	//this.mesh = null;
}
gb.entity = 
{
	new: function()
	{
		return new gb.Entity();
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
}
gb.serialize.r_entity = function(entity, br, ag)
{
    var s = gb.serialize;

    entity.name = s.r_string(br);

    var parent_name = s.r_string(br);
    if(parent_name !== 'none') 
    {
    	var parent = ag.entities[parent_name];
    	ASSERT(parent, 'Cannot find entity ' + parent_name + ' in asset group');
    	gb.entity.set_parent(entity, parent);
    }

    entity.position[0] = s.r_f32(br);
    entity.position[1] = s.r_f32(br);
    entity.position[2] = s.r_f32(br);
    entity.scale[0] = s.r_f32(br);
    entity.scale[1] = s.r_f32(br);
    entity.scale[2] = s.r_f32(br);
    entity.rotation[0] = s.r_f32(br);
    entity.rotation[1] = s.r_f32(br);
    entity.rotation[2] = s.r_f32(br);
    entity.rotation[3] = s.r_f32(br);
}
gb.Lamp = function()
{
	this.entity;
	this.lamp_type = gb.LampType.POINT;
	this.energy = 1;
	this.distance = 1;
}

gb.lamp = 
{
	new: function(energy, distance)
	{
		var e = gb.entity.new();
	    var l = new gb.Lamp();
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

gb.serialize.r_lamp = function(entity, br, ag)
{
    var s = gb.serialize;
    s.r_entity(entity, br, ag);
    entity.type = gb.EntityType.LAMP;
    var lamp = new gb.Lamp();
    lamp.energy = s.r_f32(br);
    lamp.distance = s.r_f32(br);
    entity.lamp = lamp;
    lamp.entity = entity;
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
	return this;
}

gb.camera = 
{
	new: function(projection, near, far, fov, mask)
	{
		var e = gb.entity.new();
	    var c = new gb.Camera();
	    c.projection_type = projection || gb.Projection.PERSPECTIVE;
	    c.near = near || 0.1;
	    c.far = far || 100;
	    c.fov = fov || 60;
	    c.mask = mask || 0;
	    c.entity = e;
	    e.camera = c;
	    return e;
	},
	update_projection: function(c, view)
	{
		c.aspect = view.width / view.height;

		var m = c.projection;

		if(c.projection_type === gb.Projection.ORTHO)
		{
			m[ 0] = 2.0 / view.width;
			m[ 5] = 2.0 / view.height;
			m[10] = -2.0 / (c.far - c.near);
			m[14] = 0.0;
			m[15] = 1.0;	
		}
		else
		{
			var h = 1.0 / gb.math.tan(c.fov * gb.math.PI_OVER_360);
			var y = c.near - c.far;
			
			m[ 0] = h / c.aspect;
			m[ 5] = h;
			m[10] = (c.far + c.near) / y;
			m[11] = -1.0;
			m[14] = 2.0 * (c.near * c.far) / y;
			m[15] = 0.0;
		}

		c.dirty = false;
	},

	set_clip_range: function(c, near, far)
	{
		c.near = near;
		c.far = far;
		c.dirty = true;
	},
}

gb.Projection = 
{
    ORTHO: 0,
    PERSPECTIVE: 1,
}

gb.serialize.r_camera = function(entity, br, ag)
{
    var s = gb.serialize;
    s.r_entity(entity, br, ag);
    entity.entity_type = gb.EntityType.CAMERA;
    var c = new gb.Camera();
    var camera_type = s.r_i32(br);
    c.near = s.r_f32(br);
    c.far = s.r_f32(br);
    c.fov = s.r_f32(br);
    if(camera_type === 0) c.projection_type = gb.Projection.PERSPECTIVE;
    else c.projection_type = gb.Projection.ORTHO;
    c.dirty = true;
    entity.camera = c;
    c.entity = entity;
}
gb.Scene = function()
{
	this.num_entities = 0;
	this.num_cameras = 0;
	this.num_sprites = 0;
	this.num_lamps = 0;
	this.entities = [];
	this.cameras = [];
	this.lamps = [];
	this.sprites = [];
	//this.render_groups: [],
}
gb.scene = 
{
	new: function()
	{
		return new gb.Scene();
	},
	load_asset_group: function(s, ag)
	{
		for(var camera in ag.cameras)
	    {
	        gb.scene.add(s, ag.cameras[camera]);
	    }
	    for(var lamp in ag.lamps)
	    {
	        gb.scene.add(s, ag.lamps[lamp]);
	    }
	    for(var empty in ag.empties)
	    {
	        gb.scene.add(s, ag.empties[empty]);
	    }
	    for(var entity in ag.entities)
	    {
	        gb.scene.add(s, ag.entities[entity]);
	    }
	},	
	find: function(s, name)
	{
		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			var e = s.entities[i];
			if(e.name === name) return e;
		}
		return null;
	},
	add: function(s, e)
	{
		s.entities.push(e);
		s.num_entities++;
	},

	update_camera: function(c)
	{
		ASSERT(c.entity != null, "Camera has no transform!");
		if(c.dirty === true)
		{
			gb.camera.update_projection(c, gb.webgl.view);
		}
		gb.mat4.inverse(c.view, c.entity.world_matrix);
		gb.mat4.mul(c.view_projection, c.view, c.projection);
		gb.mat3.from_mat4(c.normal, c.view);
		gb.mat3.inverse(c.normal, c.normal);
		gb.mat3.transposed(c.normal, c.normal);
	},

	update_entity: function(e)
	{
		if(e.active === false || e.dirty === false) return;
		if(e.mesh && e.mesh.dirty === true)
		{
			gb.webgl.update_mesh(e.mesh);
		}
		gb.mat4.compose(e.local_matrix, e.position, e.scale, e.rotation);
		if(e.parent !== null)
		{
			gb.mat4.mul(e.world_matrix, e.local_matrix, e.parent.world_matrix);
		}
		else
		{
			gb.mat4.eq(e.world_matrix, e.local_matrix);
		}
		var n = e.children.length;
		for(var i = 0; i < n; ++i)
		{
			var child = e.children[i];
			child.dirty = true;
			gb.scene.update_entity(child);
		}
		e.dirty = false;
	},


	update: function(s)
	{
		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			var e = s.entities[i];
			switch(e.entity_type)
			{
				case gb.EntityType.ENTITY:
				{
					gb.scene.update_entity(e);
					break;
				}
				case gb.EntityType.CAMERA:
				{
					gb.scene.update_entity(e);
					gb.scene.update_camera(e.camera);
					break;
				}
				case gb.EntityType.LAMP:
				{
					gb.scene.update_entity(e.entity);
					break;
				}
			}
		}
	},
}
gb.Vertex_Attribute_Info = function(name, size, normalized)
{
	this.name = name;
	this.size = size;
	this.normalized = normalized;
}
gb.vertex_attributes =
[
	new gb.Vertex_Attribute_Info("position", 3, false),
	new gb.Vertex_Attribute_Info("normal", 3, false),
	new gb.Vertex_Attribute_Info("uv", 2, false),
	new gb.Vertex_Attribute_Info("uv2", 2, false),
	new gb.Vertex_Attribute_Info("color", 4, true),
];
gb.Vertex_Buffer = function()
{
	this.id = 0;
	this.data;
	this.mask;
	this.update_mode;
}
gb.Index_Buffer = function()
{
	this.id = 0;
	this.data;
	this.update_mode;
}
gb.Mesh = function()
{
	this.name;
	this.layout;
	this.vertex_buffer = null;
	this.vertex_count = 0;
	this.index_buffer = null;
	this.index_count = 0;
	this.dirty = true;
	this.linked = false;
}

gb.mesh = 
{
	new: function(vertex_count, vertices, mask, indices)
	{
	    var m = new gb.Mesh();
	    m.layout = gb.webgl.ctx.TRIANGLES;

	    var vb = new gb.Vertex_Buffer();
	    vb.data = vertices;
	    vb.mask = mask;
	    vb.update_mode = gb.webgl.ctx.STATIC_DRAW;
	    m.vertex_buffer = vb;
	    m.vertex_count = vertex_count;

	    var ib = new gb.Index_Buffer();
	    ib.data = indices;
	    ib.update_mode = gb.webgl.ctx.STATIC_DRAW;    
	    m.index_buffer = ib;

	    m.index_count = indices.length;
	    return m;
	},
	get_stride: function(m, n)
	{
		var stride = 0;
		var index = 1;
		n = n || 5;
		for(var i = 0; i < n; ++i)
		{
			var mr = (index & m.vertex_buffer.mask) === index;
			stride += mr * (gb.vertex_attributes[i].size);
			index *= 2;
		}
		return stride;
	},
	get_bounds: function(b, m)
	{
		var v3 = gb.vec3;
		var d = m.vertex_buffer.data;
		v3.set(b.min, d[0], d[1], d[2]);
		v3.set(b.max, d[0], d[1], d[2]);

		var stride = gb.mesh.get_stride(m);
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
	},
}
gb.serialize.r_mesh = function(br)
{
	var s = gb.serialize;
	var name = s.r_string(br);
	var h = s.r_i32_array(br, 4);
	var vertices = s.r_f32_array(br, h[1]);
	var indices = s.r_u32_array(br, h[2]);
	var mesh = gb.mesh.new(h[0], vertices, h[3], indices);
	mesh.name = name;
	return mesh;
}
gb.mesh.generate = 
{
	quad: function(width, height, depth)
	{
		var x = width / 2;
	    var y = height / 2;
	    var z = (depth / 2) || 0;
	    
	    var data = new Float32Array(
	    [
	    	// POS    UV
	        -x,-y, z, 0,0,
	         x,-y, z, 1,0,
	        -x, y,-z, 0,1,
	         x, y,-z, 1,1
	    ]);

	    var tris = new Uint32Array([0,1,3,0,3,2]);
	    var mask = 1 | 4;
	    return gb.mesh.new(4, data, mask, tris);
	},

	cube: function(width, height, depth)
	{
		var x = width / 2;
		var y = height / 2;
		var z = depth / 2;

		var data = new Float32Array(
		[
			// POS    NORMAL  UV
			-x,-y, z, 0,0,1, 0,0, 
			 x,-y, z, 0,0,1, 1,0, 
			-x, y, z, 0,0,1, 0,1, 
			 x, y, z, 0,0,1, 1,1, 
			 x,-y, z, 1,0,0, 0,0, 
			 x,-y,-z, 1,0,0, 1,0, 
			 x, y, z, 1,0,0, 0,1, 
			 x, y,-z, 1,0,0, 1,1, 
			-x,-y,-z, 0,-1,0,0,0, 
			 x,-y,-z, 0,-1,0,1,0, 
			-x,-y, z, 0,-1,0,0,1, 
			 x,-y, z, 0,-1,0,1,1, 
			-x,-y,-z, -1,0,0,0,0, 			
			-x,-y, z, -1,0,0,1,0, 			
			-x, y,-z, -1,0,0,0,1, 			
			-x, y, z, -1,0,0,1,1, 			
			-x, y, z, 0,1,1, 0,0, 
			 x, y, z, 0,1,1, 1,0, 
			-x, y,-z, 0,1,1, 0,1, 
			 x, y,-z, 0,1,1, 1,1, 
			 x,-y,-z, 0,0,-1,0,0, 
			-x,-y,-z, 0,0,-1,1,0, 
			 x, y,-z, 0,0,-1,0,1, 
			-x, y,-z, 0,0,-1,1,1 		
		]);
				
		var tris = new Uint32Array(
		[
			0,1,3,0,3,2, 
			4,5,7,4,7,6, 
			8,9,11,8,11,10, 
			12,13,15,12,15,14, 
			16,17,19,16,19,18, 
			20,21,23,20,23,22 
		]);

	    var mask = 1 | 2 | 4;
	    return gb.mesh.new(24, data, mask, tris);
	},
	
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
	sampler: function(x,y,up,down)
	{
		var s = new gb.Sampler();
	    s.x = x;
	    s.y = y;
	    s.up = up;
	    s.down = down;
	    return s;
	},
	rgba: function(width, height, pixels, sampler, mipmaps)
	{
		var t = new gb.Texture();
	    t.width = width;
	    t.height = height;
	    t.pixels = pixels;
	    t.format = gb.webgl.ctx.RGBA;
	    t.byte_size = gb.webgl.ctx.UNSIGNED_BYTE;
	    t.mipmaps = mipmaps;
	    t.sampler = sampler;
	    return t;
	},
	depth: function(width, height)
	{
		var t = new gb.Texture();
	    t.width = width;
	    t.height = height;
	    t.pixels = null;
	    t.format = gb.webgl.ctx.DEPTH_COMPONENT;
	    t.byte_size = gb.webgl.ctx.UNSIGNED_SHORT;
	    t.mipmaps = 0;
	  	t.sampler = gb.webgl.default_sampler;
	    return t;
	},
}
gb.serialize.r_dds = function(br)
{
	// http://msdn.microsoft.com/en-us/library/bb943991.aspx/
	var s = gb.serialize;
	var dxt = gb.webgl.extensions.dxt;
    var DXT1 = 827611204;
   	var DXT5 = 894720068;

	var h = new Int32Array(br.buffer, br.offset, 31);

	ASSERT(h[0] === 0x20534444, "Invalid magic number in DDS header");
	ASSERT(!h[20] & 0x4, "Unsupported format, must contain a FourCC code");

	var t = new gb.Texture();
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
    t.sampler = gb.webgl.default_sampler;
    t.compressed = true;

    if(h[2] & 0x20000) 
    {
        t.mipmaps = Math.max(1, h[7]);
    }
    br.offset += size;

    return t;
}
gb.ShaderAttribute = function()
{
	this.location;
	this.index;
}
gb.ShaderUniform = function()
{
    this.location;
    this.name;
    this.type;
    this.size;
}
gb.Shader = function()
{
    this.name = null;
    this.id = 0;
    this.vertex_src;
    this.fragment_src;
    this.num_attributes;
    this.num_uniforms;
    this.attributes = [null, null, null, null, null];
    this.mvp = false;
    this.camera = false;
    this.lights = false;
    this.uniforms = {};
    this.linked = false;
}
gb.shader = 
{
    new: function(v_src, f_src)
    {
        var s = new gb.Shader();
        s.vertex_src = v_src;
        s.fragment_src = f_src;
        return s;
    }
}
gb.serialize.r_shader = function(br)
{
	var s = gb.serialize;
    var name = s.r_string(br);
    var uniform_mask = s.r_i32(br);
   	var vs = s.r_string(br);
   	var fs = s.r_string(br);
    var shader = gb.shader.new(vs, fs);
    shader.name = name;
    shader.mvp = gb.has_flag_set(uniform_mask, 1);
    shader.camera = gb.has_flag_set(uniform_mask, 2);
    shader.lights = gb.has_flag_set(uniform_mask, 4);
    return shader;
}
gb.Material = function()
{
    this.shader;
    this.uniforms;
}
gb.material = 
{
    new: function(shader)
    {
        var m = new gb.Material();
        m.shader = shader;
        m.uniforms = {};
        for(var key in shader.uniforms)
        {
            m.uniforms[key] = null;
        }
        if(shader.mvp === true)
        {
            m.uniforms.mvp = gb.mat4.new();
        }
        return m;
    },
}
gb.serialize.r_material = function(br, ag)
{
    var s = gb.serialize;
    var name = s.r_string(br);
    var shader_name = s.r_string(br);
    var shader = ag.shaders[shader_name];
    ASSERT(shader, 'Cannot find shader ' + shader_name);

    var material = gb.material.new(shader);
    material.name = name;
    var num_textures = s.r_i32(br);

    for(var i = 0; i < num_textures; ++i)
    {
        var tex_name = s.r_string(br);
        var sampler_name = s.r_string(br);
        ASSERT(material.uniforms[sampler_name], 'Cannot find sampler ' + sampler_name + ' in shader ' + shader_name);
        material.uniforms[sampler_name] = ag.textures[tex_name];
    }
    return material;
}
gb.Render_Target = function()
{
	this.bounds;
	this.frame_buffer;
	this.render_buffer;
	this.color;
	this.depth;
	this.stencil;
    this.linked = false;
}

gb.render_target = 
{
    new: function(view, mask, color)
    {
        var rt = new gb.Render_Target();
        rt.bounds = gb.rect.new();
        gb.rect.eq(rt.bounds, view);
        if((1 & mask) === 1) //color
        {
            rt.color = gb.texture.rgba(view.width, view.height, null, gb.webgl.default_sampler, 0);
            gb.webgl.link_texture(rt.color);
        }
        if((2 & mask) === 2) //depth
        {
            rt.depth = gb.texture.depth(view.width, view.height);
            gb.webgl.link_texture(rt.depth);
        }
        /*
        if((4 & mask) === 4)
        {
        }
        */
        gb.webgl.link_render_target(rt);
        return rt;
    },
}

gb.DrawCall = function()
{
	this.clear = false;
	this.target;
	this.camera;
	this.material;
	this.entities = [];
	this.lights;
}
gb.PostCall = function()
{
	this.mesh;
	this.material;
}

gb.webgl = 
{
	shader_types:
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
        0x1406: 'FLOAT'
    },

	extensions: 
	{
		depth_texture: null,
		dxt: null,
		pvr: null,
		fp_texture: null,
		uint: null,
	},
	ctx: null,
	m_offsets: null,
	view: null,
	default_sampler: null,
    screen_mesh: null,
    screen_shader: null,

	init: function(container, config)
	{
		var _t = gb.webgl;
		var gl;

		var width = 0;
		var height = 0;
		if(config.width)
		{
			width = config.width * config.resolution;
			height = config.height * config.resolution;
		}
		else
		{
			width = container.offsetWidth * config.resolution;
        	height = container.offsetHeight * config.resolution;	
		}
        var canvas = gb.dom.insert('canvas', container);
        canvas.width = width;
        canvas.height = height;
        _t.view = gb.rect.new(0,0,width,height);

        try
        {
            gl = canvas.getContext('experimental-webgl', config);
            if(gl == null)
            {
                gl = canvas.getContext('webgl', config);
            }
        }
        catch(e)
        {
            console.error("Not WebGL compatible: " + e);
            return;
        }

        //DEBUG
        ASSERT(gl != null, "Could not load WebGL");
        gb.debug.get_context_info(gl);
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

        gl.clearColor(0.0,0.0,0.0,0.0);
        //gl.colorMask(true, true, true, false);
    	//gl.clearStencil(0);
    	//gl.depthMask(true);
		//gl.depthRange(-100, 100); // znear zfar
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        _t.default_sampler = gb.texture.sampler(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);

		var ex = _t.extensions;
		ex.depth_texture = gl.getExtension("WEBGL_depth_texture");
		ex.dxt = gl.getExtension("WEBGL_compressed_texture_s3tc");
		ex.pvr = gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
		ex.fp_texture = gl.getExtension("OES_texture_float");
		ex.uint = gl.getExtension("OES_element_index_uint");

		_t.m_offsets = new Uint32Array(5);
	},

	set_clear_color: function(r,g,b,a)
	{
		gb.webgl.ctx.clearColor(r,g,b,a);
	},

	link_mesh: function(m)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		m.vertex_buffer.id = gl.createBuffer();
		if(m.index_buffer)
			m.index_buffer.id = gl.createBuffer();
		_t.update_mesh(m);
		m.linked = true;
	},
	update_mesh: function(m)
	{
		var gl = gb.webgl.ctx;
		gl.bindBuffer(gl.ARRAY_BUFFER, m.vertex_buffer.id);
		gl.bufferData(gl.ARRAY_BUFFER, m.vertex_buffer.data, m.vertex_buffer.update_mode);
		if(m.index_buffer)
		{
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.index_buffer.id);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.index_buffer.data, m.index_buffer.update_mode);
		}
		m.dirty = false;
	},
	delete_mesh: function(m)
	{
		var gl = gb.webgl.ctx;
		gl.deleteBuffer(m.vertex_buffer.id);
		if(mesh.index_buffer)
			gl.deleteBuffer(m.index_buffer.id);
		m = null;
	},

	link_shader: function(s)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var vs = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vs, s.vertex_src);
	    gl.compileShader(vs);

	    //DEBUG
	    gb.debug.shader_compile_status(gl, vs);
	    //END

	    var fs = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.shaderSource(fs, s.fragment_src);
	    gl.compileShader(fs);

	    //DEBUG
	    gb.debug.shader_compile_status(gl, fs);
	    //END

	    var id = gl.createProgram();
	    gl.attachShader(id, vs);
	    gl.attachShader(id, fs);
	    gl.linkProgram(id);

	    //DEBUG
	    gb.debug.shader_link_status(gl, id);
	    //END

	    ASSERT(s.id === 0, "Shader already bound to id " + s.id); 
	    s.id = id;
	    s.num_attributes = gl.getProgramParameter(id, gl.ACTIVE_ATTRIBUTES);
	    s.num_uniforms = gl.getProgramParameter(id, gl.ACTIVE_UNIFORMS);

	    var c = 0;
	    var n = gb.vertex_attributes.length;
	    for(var i = 0; i < n; ++i)
	    {
	    	var attr = gb.vertex_attributes[i];
	    	var loc = gl.getAttribLocation(id, attr.name);
	    	if(loc !== -1) 
	    	{
	    		var sa = new gb.ShaderAttribute();
	    		sa.location = loc;
	    		sa.index = i;
	    		s.attributes[c] = sa;
	    		c++;
	    	}
	    }

	    for(var i = 0; i < s.num_uniforms; ++i)
	    {
	        var uniform = gl.getActiveUniform(id, i);
	        var su = new gb.ShaderUniform();
	        su.location = gl.getUniformLocation(id, uniform.name);
	        su.type = _t.shader_types[uniform.type];
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
	
	link_texture: function(t)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		ASSERT(t.id === 0, "Texture is already bound to id " + t.id);
		t.id = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, t.id);
		_t.update_texture(t);
		_t.set_sampler(t.sampler);
		t.linked = true;
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

		if(t.compressed === true)
		{
			gl.compressedTexImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.pixels);
		}
		else
		{
			gl.texImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.format, t.byte_size, t.pixels);
		}

		if(t.mipmaps > 1) 
			gl.generateMipmap(gl.TEXTURE_2D);

		t.dirty = false;
	},

	set_viewport: function(v)
	{
		var gl = gb.webgl.ctx;
		gl.viewport(v.x, v.y, v.width, v.height);
		gl.scissor(v.x, v.y, v.width, v.height);
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
			if(clear === true)
			{
				_t.ctx.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			}
		}
		else
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, rt.frame_buffer);
			if(rt.depth)
			{
				gl.enable(gl.DEPTH_TEST);
			}
			if(rt.render_buffer)
				gl.bindRenderbuffer(gl.RENDERBUFFER, rt.render_buffer);
			_t.set_viewport(rt.bounds);

			if(clear === true)
			{
				_t.clear(rt);
			}
		}
	},

	set_render_target_attachment: function(rt, attachment, t)
	{
		var gl = gb.webgl.ctx;
		gl.bindTexture(gl.TEXTURE_2D, t.id);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, t.id, 0);
	},

	new_render_buffer: function(width, height)
	{
		var gl = gb.webgl.ctx;
		var rb = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
		return rb;
	},

	link_render_target: function(rt)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		rt.frame_buffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, rt.frame_buffer);

		if(rt.color)
		{
			_t.set_render_target_attachment(rt, gl.COLOR_ATTACHMENT0, rt.color);
		}
		if(rt.depth)
		{
			_t.set_render_target_attachment(rt, gl.DEPTH_ATTACHMENT, rt.depth);
		}
		else
		{
			rt.render_buffer = _t.new_render_buffer(rt.bounds.width, rt.bounds.height);
		}

		//DEBUG
		gb.debug.verify_render_target(gl);
		//END

		rt.linked = true;
	},

	clear: function(rt)
	{
		var gl = gb.webgl.ctx;
		var mode = 0;
		if(rt.color) mode |= gl.COLOR_BUFFER_BIT;
		if(rt.depth) mode |= gl.DEPTH_BUFFER_BIT;
		gl.clear(mode);
	},

	draw_mesh_elements: function(mesh)
	{
		var gl = gb.webgl.ctx;
        ASSERT(mesh.indices !== null, "Mesh has no index buffer");
    	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
        gl.drawElements(mesh.layout, mesh.index_count, gl.UNSIGNED_INT, 0);
	},

	draw_mesh_arrays: function(mesh)
	{
		gb.webgl.ctx.drawArrays(mesh.layout, 0, mesh.vertex_count);
	},
	
	link_attributes: function(shader, mesh)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var vb = mesh.vertex_buffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, vb.id);

		var stride = 0;
		var index = 1;
		for(var i = 0; i < 5; ++i)
		{
			var mr = (index & vb.mask) === index;
			_t.m_offsets[i] = stride;
			stride += mr * (gb.vertex_attributes[i].size * 4);
			index *= 2;
		}

		var offset = 0;
		for(var i = 0; i < shader.num_attributes; ++i)
		{
			var sa = shader.attributes[i];
			var attr = gb.vertex_attributes[sa.index]; 
			gl.enableVertexAttribArray(sa.location);
			gl.vertexAttribPointer(sa.location, attr.size, gl.FLOAT, attr.normalized, stride, _t.m_offsets[sa.index]);
		}
	},

	set_uniforms: function(shader, uniforms)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var sampler_index = 0;
		for(var key in uniforms)
		{
			var uniform = shader.uniforms[key];
			var loc = uniform.location;
			var val = uniforms[key];
			switch(uniform.type)
			{
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
		        //case 'INT_VEC2':
		        //case 'INT_VEC3':
		        //case 'INT_VEC4':
		        case 'BOOL':
		        {
		        	break;
		        }
		        //case 'BOOL_VEC2':
		        //case 'BOOL_VEC3':
		        //case 'BOOL_VEC4':
		        //case 'FLOAT_MAT2':
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
		        	if(val.dirty === true)
		        	{
		        		_t.update_texture(val);
		        	}
					gl.bindTexture(gl.TEXTURE_2D, val.id);
					gl.activeTexture(gl.TEXTURE0 + sampler_index);
					gl.uniform1i(loc, val.id);
					sampler_index++;
					break;
				}
		        //case 'SAMPLER_CUBE':
		        //case 'BYTE':
		        //case 'UNSIGNED_BYTE':
		        //case 'SHORT':
		        //case 'UNSIGNED_SHORT':
		        case 'INT':
		        {
					ctx.uniformi(loc, val);
					break;
				}
		        //case 'UNSIGNED_INT':
		        case 'FLOAT': 
		        {
					ctx.uniformf(loc, val);
					break;
				}
				default:
				{
					ASSERT(false, uniform.type + ' is an unsupported uniform type');
				}
			}
		}
	},

	render_draw_call: function (dc)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var mat = dc.material;
		var shader = mat.shader;
		var cam = dc.camera;
		//var lights = dc.lights;

		//TODO: obvs do this before draw call list
		gl.enable(gl.DEPTH_TEST);

		if(dc.target.linked === false)
		{
			_t.link_render_target(dc.target);
		}
		_t.set_render_target(dc.target, dc.clear);

		if(shader.linked === false) 
		{
			_t.link_shader(shader);
		}
		_t.use_shader(shader);

		if(shader.camera === true)
		{
			mat.uniforms.proj_matrix = cam.projection;
			mat.uniforms.view_matrix = cam.view;
			mat.uniforms.normal_matrix = cam.normal;
		}

		//if(shader.lights)
		
		var n = dc.entities.length;
		for(var i = 0; i < n; ++i)
		{
			var e = dc.entities[i];
			if(e.entity_type !== gb.EntityType.ENTITY) continue;
			if(!e.mesh) continue;
			if(e.mesh.linked === false) _t.link_mesh(e.mesh);
			if(e.mesh.dirty === true) _t.update_mesh(e.mesh);
			_t.link_attributes(shader, e.mesh);

			if(shader.mvp === true)
			{
				gb.mat4.mul(mat.uniforms.mvp, e.world_matrix, cam.view_projection);
			}
			else
			{
				mat.uniforms.model_matrix = e.world_matrix;
			}

			_t.set_uniforms(shader, mat.uniforms);

			if(e.mesh.index_buffer) _t.draw_mesh_elements(e.mesh);
			else _t.draw_mesh_arrays(e.mesh);
		}
	},

	render_post_call: function(pc)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;

		var mesh = pc.mesh;
		var mat = pc.material;
		var shader = mat.shader;

		if(shader.linked === false) _t.link_shader(shader);
		if(mesh.linked === false) _t.link_mesh(mesh);
		if(mesh.dirty === true) _t.update_mesh(mesh);

		gl.disable(gl.DEPTH_TEST);
		_t.set_render_target(null);
		_t.use_shader(shader);
		_t.link_attributes(shader, mesh);
		_t.set_uniforms(shader, mat.uniforms);
		_t.draw_mesh_elements(mesh);
	},

	world_to_screen: function(r, camera, world, view)
    {
    	var wp = gb.vec3.tmp(); 
        gb.mat4.mul_projection(wp, camera.view_projection, world);
        r[0] = ((wp[0] + 1.0) / 2.0) * view.width;
        r[1] = ((1.0 - wp[1]) / 2.0) * view.height;
    },

    screen_to_view: function(r, point, view)
    {
        r[0] = point[0] / view.width;
        r[1] = 1.0 - (point[1] / view.height);
        r[2] = point[2];
        return r;
    },

    screen_to_world: function(r, camera, point, view)
    {
        var t = gb.vec3.tmp();
        t[0] = 2.0 * point[0] / view.width - 1.0;
        t[1] = -2.0 * point[1] / view.height + 1.0;
        t[2] = point[2];
            
        var inv = gb.mat4.tmp();
        gb.mat4.inverse(inv, camera.view_projection);
        gb.mat4.mul_projection(r, inv, t);
    },
}
gb.Asset_Group = function()
{
    this.shaders = {};
    this.materials = {};
    this.animations = {};
    this.cameras = {};
    this.lamps = {};
    this.entities = {};
    this.meshes = {};
    this.textures = {};
    this.sounds = {};
}
gb.load_asset_group = function(url, asset_group, on_load, on_progress)
{
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = gb.on_asset_load;
    request.onprogress = on_progress;
    request.responseType = 'arraybuffer';
    request.upload.asset_group = asset_group;
    request.upload.callback = on_load;
    request.send();
}
gb.on_asset_load = function(e)
{
    // NOTE: asset data encoded in little endian (x86)
    if(e.target.status === 200)
    {
        var s = gb.serialize;
        var br = new gb.Binary_Reader(e.target.response);
        var ag = e.target.upload.asset_group;

        var header = s.r_i32_array(br, 3);
        var n_shaders = header[0];
        var n_textures = header[1];
        var n_scenes = header[2];

        //DEBUG
        LOG("Shaders: " + n_shaders);
        LOG("Textures: " + n_textures);
        LOG("Scenes: " + n_scenes);
        //END

        for(var i = 0; i < n_shaders; ++i)
        {
            var shader = s.r_shader(br);
            ag.shaders[shader.name] = shader;
            //DEBUG
            LOG("Loaded Shader: " + shader.name);
            //END
        }

        for(var i = 0; i < n_textures; ++i)
        {
            var name = s.r_string(br);
            var id = s.r_i32(br);
            if(id === 0 && gb.webgl.extensions.dxt !== null)
            {
                var t = s.r_dds(br);
                ag.textures[name] = t;
                //DEBUG
                console.log("Width: " + t.width);
                console.log("Height: " + t.height);
                console.log("Loaded DDS: " + name);
                //END
            }
            else if(id === 1 && gb.webgl.extensions.pvr !== null)
            {
                ag.textures[name] = s.r_pvr(br);
                //DEBUG
                console.log("Loaded PVR: " + name);
                //END
            }
        }

        for(var i = 0; i < n_scenes; ++i)
        {
            var name = s.r_string(br);
            LOG("Loading: " + name);

            var scene_complete = false;
            while(scene_complete === false)
            {
                var import_type = s.r_i32(br);
                switch(import_type)
                {
                    case 0:
                    {
                        var entity = new gb.Entity();
                        s.r_camera(entity, br, ag);
                        ag.cameras[entity.name] = entity;
                        LOG("Loaded Camera: " + entity.name);
                        break;                        
                    }
                    case 1:
                    {
                        var entity = new gb.Entity();
                        s.r_lamp(entity, br, ag);
                        ag.lamps[entity.name] = entity;
                        LOG("Loaded Lamp: " + entity.name);
                        break;
                    }
                    case 2:
                    {
                        var mesh = s.r_mesh(br);
                        ag.meshes[mesh.name] = mesh;
                        LOG("Loaded Mesh: " + mesh.name);
                        break;
                    }
                    case 3:
                    {
                        var material = s.r_material(br, ag);
                        ag.materials[material.name] = material;
                        LOG("Loaded Material: " + material.name);
                        break;
                    }
                    case 4:
                    {
                        var action = s.r_action(br);
                        ag.animations[action.name] = action;
                        LOG("Loaded Action: " + action.name);
                        break;
                    }
                    case 5:
                    {
                        var entity = new gb.Entity();
                        s.r_entity(entity, br, ag);
                        entity.material = ag.materials[s.r_string(br)];
                        entity.mesh = ag.meshes[s.r_string(br)];
                        ag.entities[entity.name] = entity;
                        LOG("Loaded Entity: " + entity.name);
                        break;
                    }
                    case 6:
                    {
                        var empty = new gb.Entity();
                        s.r_entity(empty, br, ag);
                        ag.entities[empty.name] = empty;
                        LOG("Loaded Entity: " + empty.name);
                        break;
                    }
                    case -101: //FINISH
                    {
                        scene_complete = true;
                        LOG("Loaded Scene: " + name)
                        break;
                    }
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
gb.link_asset_group = function(asset_group, callback)
{
    for(var s in asset_group.shaders)
    {
        gb.webgl.link_shader(asset_group.shaders[s]);
    }
    for(var m in asset_group.meshes)
    {
        gb.webgl.link_mesh(asset_group.meshes[m]);
    }
    for(var t in asset_group.textures)
    {
        gb.webgl.link_texture(asset_group.textures[t]);
    }
    callback();
}
gb.Sprite = function()
{
	this.start;
	this.end;
	this.playing;
	this.speed;
	this.frame;
	this.loop_count;
	this.rows;
	this.cols;
	this.entity;
}

gb.sprite = 
{
	new: function(texture, w, h)
	{
		var s = new gb.Sprite();
		s.start = 0;
		s.end = 0;
		s.playing = false;
		s.speed = 0;
		s.frame = 0;
		s.loop_count = 0;
		s.rows = gb.math.round(texture.width / w);
		s.cols = gb.math.round(texture.height / h);
		s.frame_skip = 0;
		s.frame_width = 1 / (texture.width / w); 
		s.frame_height = 1 / (texture.height / h);

		var e = new gb.Entity();
		e.mesh = gb.mesh.generate.quad(1,1);
		e.mesh.vertex_buffer.update_mode = gb.webgl.ctx.DYNAMIC_DRAW;
		s.entity = e;
		return s;
	},
	set_animation: function(s, start, end, speed, loops)
	{
		s.start = start;
		s.frame = start;
		s.end = end;
		s.speed = speed;
		s.loops = loops;
	},
	play: function(s)
	{
		s.playing = true;
		s.frame_skip = s.speed;
		s.frame = s.start;
	},
	update: function(s, dt)
	{
		if(s.playing === false) return;

		s.frame_skip -=1;
		if(s.frame_skip == 0)
		{
			s.frame++;
			s.frame_skip = s.speed;

			if(s.frame === s.end)
			{
				s.loop_count -= 1;
				if(s.loop_count === 0) // -1 = continuous loop
					s.playing = false;

				s.frame = s.start;
			}

			var ix = s.frame % s.cols;
			var iy = gb.math.floor(s.frame / s.cols);

			var x = ix * s.frame_width;
			var y = iy * s.frame_height;
			var w = x + s.frame_width;
			var h = y + s.frame_height;

			var pos = gb.mesh.get_stride(s.entity.mesh, 2); //3
			var stride = gb.mesh.get_stride(s.entity.mesh); //5
			var vb = s.entity.mesh.vertex_buffer.data;

			var i = pos;
			vb[  i] = x;
			vb[i+1] = h;

			i += stride;
			vb[  i] = w;
			vb[i+1] = h;

			i += stride;
			vb[  i] = x;
			vb[i+1] = y;

			i += stride;
			vb[  i] = w;
			vb[i+1] = y;

			s.entity.mesh.dirty = true;
		}
	},
}
//DEBUG
gb.gl_draw = 
{
	entity: null,
	mesh: null,
	offset: null,
	color: null,
	matrix: null,
	draw_call: null,

	init: function(config)
	{
		var _t = gb.gl_draw;
		var wgl = gb.webgl;

		_t.draw_call = new gb.DrawCall();
		_t.draw_call.clear = false;
		_t.entity = gb.entity.new();
		_t.draw_call.entities.push(_t.entity);
		_t.matrix = _t.entity.world_matrix;

		_t.offset = 0;
		_t.color = gb.color.new(1,1,1,1);

		var m = new gb.Mesh();
		m.layout = wgl.ctx.LINES;
	    var vb = new gb.Vertex_Buffer();
	    vb.mask = 1 | 16;
	    vb.data = new Float32Array(config.buffer_size);
	    vb.update_mode = wgl.ctx.DYNAMIC_DRAW;
	    m.vertex_buffer = vb;
	    m.vertex_count = 0;
	    m.dirty = true;
	    _t.entity.mesh = m;
	    _t.mesh = m;

        _t.draw_call.material = gb.material.new(assets.shaders.debug); 
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
	/*
	draw: function(camera)
	{
		var _t = gb.gl_draw;
		var w = gb.webgl;
		w.set_shader(_t.shader);
		w.update_mesh(_t.mesh);
		w.link_attributes(_t.shader, _t.mesh);
		w.set_shader_mat4(_t.shader, "mvp", camera.view_projection);
		w.draw_mesh_arrays(_t.mesh);
	},
	*/
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
	wire_mesh: function(mesh, matrix)
	{
		var _t = gb.gl_draw;
		var v3 = gb.vec3;
		var mt = gb.mat4;
		m4.eq(_t.matrix, matrix);
		var stride = gb.mesh.get_stride(mesh);
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
gb.debug =
{
	get_context_info: function(gl)
	{
		console.log("AA Size: " + gl.getParameter(gl.SAMPLES));
		
		console.log("Shader High Float Precision: " + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT));

		console.log("Max Texture Size: " + gl.getParameter(gl.MAX_TEXTURE_SIZE) + "px");
		console.log("Max Cube Map Size: " + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE) + "px");
		console.log("Max Render Buffer Size: " + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) + "px");

		console.log("Max Vertex Shader Texture Units: " + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
		console.log("Max Fragment Shader Texture Units: " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
		console.log("Max Combined Texture Units: " + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));

		console.log("Max Vertex Shader Attributes: " + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));

		console.log("Max Vertex Uniform Vectors: " + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
		console.log("Max Frament Uniform Vectors: " + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));

		console.log("Max Varying Vectors: " + gl.getParameter(gl.MAX_VARYING_VECTORS));

		var supported_extensions = gl.getSupportedExtensions();
		for(var i = 0; i < supported_extensions.length; ++i)
		{
			console.log(supported_extensions[i]);
		}
	},
	verify_context: function(gl)
	{
		if(gl.isContextLost())
		{
			gl.error("Lost WebGL context");
		}
	},
	shader_compile_status: function(gl, s)
	{
	    var success = gl.getShaderParameter(s, gl.COMPILE_STATUS);
	    if(!success)
	    {
	        console.error("Shader Compile Error: " + gl.getShaderInfoLog(s));
	    }
	},
	shader_link_status: function(gl, p)
	{
	    var success = gl.getProgramParameter(p, gl.LINK_STATUS);
	    if(!success)
	    {
	        console.error("Shader Link Error: " + gl.getProgramInfoLog(p));
	    }
	},
	verify_render_target: function(gl)
	{
		var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if(status != gl.FRAMEBUFFER_COMPLETE)
		{
			console.error('Error creating framebuffer: ' +  status);
		}
	}
}
//END

gb.init = init;
gb.update = update;

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var rand = gb.random;
var math = gb.math;
var gl = gb.webgl;
var assets;
var assets_loaded;

var construct;
var camera;
var texture;
var render_target;
var sphere;
var anim;
var post;
var light_position; //change to enitity
var angle = 0;

var draw_call;
var post_call;

function init()
{
	assets_loaded = false;

	var k = gb.Keys;
	gb.input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.one, k.two, k.three, k.up, k.down, k.left, k.right],
	});

	gl.init(gb.dom.find('.container'),
	{
		width: 1024,
		height: 576,
		resolution: 1,
		alpha: false,
	    depth: true,
	    stencil: false,
	    antialias: true,
	    premultipliedAlpha: false,
	    preserveDrawingBuffer: false,
	    preferLowPowerToHighPerformance: false,
	    failIfMajorPerformanceCaveat: false
	});

	assets = new gb.Asset_Group();
	if(gl.extensions.dds !== null)
	{
		gb.load_asset_group("assets.gl", assets, load_complete, load_progress);
	}
}

function load_progress(e)
{
	var percent = e.loaded / e.total;
}
function load_complete(asset_group)
{
	gb.link_asset_group(asset_group, link_complete);	
}
function link_complete()
{
	//DEBUG
	//gb.gl_draw.init({buffer_size: 160000});
	//END

	render_target = gb.render_target.new(gl.view, 1 | 2);
	construct = gb.scene.new();
	gb.scene.load_asset_group(construct, assets);

	camera = gb.scene.find(construct, 'camera').camera;
	sphere = gb.scene.find(construct, 'cube');

	anim = assets.animations.move;
	anim.target = sphere;
	anim.is_playing = true;

	light_position = v3.new(3,3,3);

	// TODO: create draw calls automatically
	draw_call = new gb.DrawCall();
	draw_call.clear = true;
	draw_call.camera = camera;
	draw_call.entities = construct.entities;
	draw_call.target = render_target;
	draw_call.material = gb.material.new(assets.shaders.pbr);

	//gb.gl_draw.draw_call.camera = camera;
	//gb.gl_draw.draw_call.target = render_target;

	post_call = new gb.PostCall();
	post_call.mesh = gb.mesh.generate.quad(2,2);
	post_call.material = gb.material.new(assets.shaders.screen);
	assets_loaded = true;
}


function update(t)
{
	if(assets_loaded === false) return;

	var dt = gb.time.dt; 

	gb.scene.update(construct);

	gb.animation.update(anim, dt);

	//MODIFY MESH FOR LULZ
	if(gb.input.held(gb.Keys.left))
	{
		light_position[0] -= dt;
	}	
	else if(gb.input.held(gb.Keys.right))
	{
		light_position[0] += dt;
	}

	if(gb.input.held(gb.Keys.up))
	{
		light_position[1] += dt;
	}	
	else if(gb.input.held(gb.Keys.down))
	{
		light_position[1] -= dt;
	}

	if(gb.input.held(gb.Keys.z))
	{
		light_position[2] += dt;
	}	
	else if(gb.input.held(gb.Keys.x))
	{
		light_position[2] -= dt;
	}
	//gb.gl_draw.line(v3.tmp(0,0,0), light_position);
	//gb.gl_draw.wire_mesh(sphere.mesh, sphere.world_matrix);
	//angle += 10 * dt;
	//gb.entity.set_rotation(sphere, angle, 0,0);
	sphere.dirty = true;

	draw_call.material.uniforms.light_position = light_position;
	
	gb.webgl.render_draw_call(draw_call);
	//gb.webgl.render_draw_call(gb.gl_draw.draw_call);

	post_call.material.uniforms.tex = render_target.color;
	gl.render_post_call(post_call);
}

