'use strict';

///INCLUDE demos/wgl_dev.js
///INCLUDE demos/fluid_sim.js
///INCLUDE demos/particles.js
///INCLUDE demos/gravity.js
///INCLUDE demos/impulse.js
///INCLUDE demos/lines.js
///INCLUDE demos/lines2.js
///INCLUDE demos/lines3.js
//DEBUG
function ASSERT(expr, message)
{
    if(expr === false) console.error(message);
}
//END

var gb = 
{
	focus: true,
	init: function(){},
	update: function(t){},

	focus: function(e)
	{
		gb.focus = true;
		//DEBUG
		console.log('focus');
		//END
	},
	blur: function(e)
	{
		gb.focus = false;
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
		if(gb.time.paused || gb.focus === false)
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
}
window.addEventListener('load', gb._init, false);
window.onfocus = gb.focus;
window.onblur = gb.blur;
//DEBUG
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
		r[0] = x;
		r[1] = y;
		r[2] = z;
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
gb.Canvas2D = function()
{
	this.element = null;
	this.view = null;
	this.ctx = null;
}

gb.canvas = 
{
	element: null,
	ctx: null,
	view: null,
	_dash_vals:[5,5],

	new: function(container, config)
	{
		var c = new gb.Canvas2D();
	    var canvas = gb.dom.insert('canvas', container);
		var width = container.offsetWidth;
	    var height = container.offsetHeight;
	    canvas.width = width;
	    canvas.height = height;
		c.view = new gb.rect.new(0,0,width,height);
		c.ctx = canvas.getContext('2d');
		c.element = canvas;
		gb.canvas.set_context(c);
		return c;
	},

	set_context: function(canvas)
	{
		gb.canvas.element = canvas.element;
		gb.canvas.ctx = canvas.ctx;
		gb.canvas.view = canvas.view;
	},

	clear: function()
	{
		var ctx = gb.canvas.ctx;
		var v = gb.canvas.view;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(v.x, v.y, v.width, v.height);
		//ctx.restore();
	},

	blend_alpha: function(a)
	{
		gb.canvas.ctx.globalAlpha = a;
	},
	blend_mode: function(m)
	{
		gb.canvas.ctx.globalCompositeOperation = m;
	},

	rect: function(x,y,w,h)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x+w, y);
		ctx.lineTo(x+w, y+h);
		ctx.lineTo(x, y+h);
		return gb.canvas;
	},
	rect_t: function(r)
	{
		return gb.canvas.rect(r.x, r.y, r.width, r.height);
	},

	box: function(x,y,w,h)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		var hw = w / 2;
		var hh = h / 2;
		ctx.moveTo(x-hw, y-hh);
		ctx.lineTo(x-hw, y+hh);
		ctx.lineTo(x+hw, y+hh);
		ctx.lineTo(x+hw, y-hh);
		return gb.canvas;
	},

	circle: function(x,y,r)
	{
		gb.canvas.ctx.beginPath();
		gb.canvas.ctx.arc(x, y, r, 0, 360 * gb.math.DEG2RAD, true);
		return gb.canvas;
	},
	circle_t: function(p,r)
	{
		return gb.canvas.circle(p[0], p[1], r);
	},

	begin_path: function(x,y)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(x, y);
		return gb.canvas;
	},
	add_vertex: function(x,y)
	{
		gb.canvas.ctx.lineTo(x,y);
	},
	end_path: function()
	{
		gb.canvas.ctx.closePath();
	},

	line: function(a,b,x,y)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(a, b);
		ctx.lineTo(x, y);
		return gb.canvas;
	},
	line_t: function(a,b)
	{
		return gb.canvas.line(a[0], a[1], b[0], b[1]);
	},

	point: function(x,y, length)
	{
		gb.canvas.line(x - length, y, x + length, y).stroke();
		gb.canvas.line(x, y - length, x, y + length).stroke();
		return gb.canvas;
	},
	point_t: function(p, length)
	{
		return gb.canvas.point(p[0], p[1], length);
	},
	
	arc: function(x,y, radius, start, end, cw)
	{
		gb.canvas.ctx.beginPath();
		gb.canvas.ctx.arc(x, y, radius, start * gb.math.DEG2RAD, end * gb.math.DEG2RAD, cw);
		return gb.canvas;
	},
	arc_t: function(pos, radius, start, end, cw)
	{
		return gb.canvas.arc(pos[0], pos[1], radius, start, end, cw);
	},

	polygon: function(points)
	{
		var ctx = gb.canvas.ctx;
		var n = points.length;
		var p = points[0];
		ctx.beginPath();
		ctx.moveTo(p[0], p[1]);
		for(var i = 1; i < n; ++i)
		{
			p = points[i];
		    ctx.lineTo(p[0], p[1]);
		}
		return gb.canvas;
	},


	bezier_t: function(b)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(b.a[0], b.a[1]);
		ctx.bezierCurveTo(b.b[0],b.b[1],b.c[0],b.c[1],b.d[0],b.d[1]);
		return gb.canvas;
	},

	quadratic_t: function(a,b, cp)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(a[0], a[1]);
		ctx.quadraticCurveTo(cp[0], cp[1], b[0], b[1]);
		return gb.canvas;
	},
	curve_through_points: function(points)
	{
		var ctx = gb.canvas.ctx;
		var n = points.length;
		ctx.beginPath();
		ctx.moveTo(points[0], points[1]);
		for(var i = 0; i < n; i+=2)
		{
		    ctx.quadraticCurveTo(points[i], points[i-1]);
		}
		return gb.canvas;
	},

	font: function(family, size)
	{
		gb.canvas.ctx.font = size + "px " + family;
	},
	text: function(t, x,y)
	{
		gb.canvas.ctx.fillText(t, x,y);
	},

	fill_col: function(s)
	{
		gb.canvas.ctx.fillStyle = s;
	},
	fill_rgb: function(r,g,b,a)
	{
		gb.canvas.ctx.fillStyle = gb.canvas.rgba(r,g,b,a);
	},
	fill_c: function(c)
	{
		gb.canvas.ctx.fillStyle = gb.canvas.rgba(c[0], c[1], c[2], c[3]);
	},
	fill: function()
	{
		gb.canvas.ctx.fill();
	},

	stroke_s: function(s)
	{
		gb.canvas.ctx.strokeStyle = s;
	},
	stroke_t: function(c)
	{
		gb.canvas.ctx.strokeStyle = gb.canvas.rgba(c[0], c[1], c[2], c[3]);
	},
	stroke_rgb: function(r,g,b,a)
	{
		gb.canvas.ctx.strokeStyle = gb.canvas.rgba(r,g,b,a);
	},
	stroke_width: function(t)
	{
		gb.canvas.ctx.lineWidth = t;
	},
	join: function(j)
	{
		gb.canvas.ctx.lineJoin = j;
		return gb.canvas;
	},
	cap: function(c)
	{
		gb.canvas.ctx.lineCap = c;
		return gb.canvas;
	},
	dash: function(line, gap)
	{
		var _t = gb.canvas;
		_t._dash_vals[0] = line;
		_t._dash_vals[1] = gap;
		_t.ctx.setLineDash(_t._dash_vals);
		return _t;
	},
	stroke: function()
	{
		gb.canvas.ctx.stroke();
	},

	clear_rgb: function(r,g,b,a)
	{
		gb.canvas.element.style.background = gb.canvas.rgba(r,g,b,a);
	},
	clear_t: function(c)
	{
		gb.canvas.element.style.background = gb.canvas.rgba(c[0], c[1], c[2], c[3]);
	},
	clear_s: function(s)
	{
		gb.canvas.element.style.background = s;
	},

	// omfg, strings for colors - really?
	rgba: function(r,g,b,a)
	{
		var ir = gb.math.floor(r * 255);
		var ig = gb.math.floor(g * 255);
		var ib = gb.math.floor(b * 255);
		return "rgba(" + ir + "," + ig + "," + ib + "," + a + ")";
	},

	screen_shot: function(path, callback)
	{
		var img = gb.canvas.ctx.toDataURL('png');
		gb.ajax.save_file(path, 'text', data, callback);
	},
}
//DEBUG
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
		_t.color = gb.color.new(1,1,1,1);
		_t.matrix = gb.mat4.new();

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

        _t.shader = gb.shader.new(v_src, f_src);
        wgl.link_shader(_t.shader);
	    _t.mesh = m;
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
		gb.mat4.eq(_t.matrix, matrix);
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
		gb.mat4.identity(_t.matrix);
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
//END
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
gb.Keyframe = function()
{
	this.value;
	this.curve;
	this.t;
}
gb.Tween = function()
{
	this.frames;
	this.frame;
	this.current; 
	this.t;
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

var focus = true;

gb.init = init;
gb.update = update;

var v2 = gb.vec2;
var v3 = gb.vec3;
var rand = gb.random;
var draw = gb.canvas;
var input = gb.input;
var time = 1;
var curve_x;
var curve_y;


var Trace = function()
{
	this.x;
	this.y;
	this.r;
	this.t;
	this.col;
}
var traces = [];

function init()
{
	var k = gb.Keys;
	gb.input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.one, k.two, k.three, k.up, k.down, k.left, k.right],
	});
	var c = draw.new(gb.dom.find('.container'));

	draw.clear_rgb(0.2,0.2,0.22,1);
	//var r = rand.float(0.12, 0.2);
	//var g = rand.float(0.12, 0.8);
	//var b = rand.float(0.95, 1.0);
	//draw.clear_rgb(r,g,b,1);
	//draw.blend_alpha();
	draw.blend_mode("screen");
	//draw.blend_mode("overlay");
	//draw.blend_mode("multiply");

	curve_x = gb.bezier.free(0,1, 0.33,0.25, 0.66,0.1, 1,0.1);
	curve_y = gb.bezier.free(0,0.7, 0.33,0.25, 0.66,0.1, 1,0.1);

	new_trace(0.2,0.4,0.95,1);
	//new_trace(0.1,0.4,0.95,1);
	//new_trace(0.2,0.45,0.2,1);
	//new_trace(0.2,0.8,0.95,1);


}

function update(t)
{
	var dt = gb.time.dt;
	var ctx = gb.canvas.ctx;
	var view = gb.canvas.view;

	var m_pos = input.mouse_position;
	var m_held = input.held(gb.Keys.mouse_left);
	var m_up = input.up(gb.Keys.mouse_left);
	var m_delta = input.mouse_delta;

	//draw.clear();

	if(input.held(gb.Keys.left))
	{
		gb.time.scale -= 0.1;
	}
	else if(input.held(gb.Keys.left))
	{
		gb.time.scale += 0.1;
	}
	gb.time.scale = gb.math.clamp(gb.time.scale, 0,4);

	var w = view.width;
	var h = view.height;
	var n = traces.length;
	for(var i = 0; i < n; ++i)
	{	
		draw_trace(traces[i], 2, dt);
	}
}

function new_trace(r,g,b,a)
{
	var t = new Trace();
	t.x = new Float32Array(4);
	t.y = new Float32Array(4);
	t.x[0] = rand.float(gb.canvas.view.width * 0.25, gb.canvas.view.width * 0.75);
	t.y[0] = rand.float(gb.canvas.view.width * 0.25, gb.canvas.view.height * 0.75);
	t.x[3] = t.x[0];
	t.y[3] = t.y[0]
	t.r = rand.float(50,1000);
	t.t = rand.float(0,1);
	t.col = gb.color.new(r,g,b,a);
	traces.push(t);
	return t;
}

function draw_trace(l, n, dt)
{
	l.t -= dt;
	if(l.t < 0) l.t += 0.707;
	draw.blend_alpha(rand.float(0,1));

	draw.stroke_t(l.col);

	var w = gb.canvas.view.width;
	var h = gb.canvas.view.height;

	var pos = gb.vec2.tmp();
	for(var i = 1; i < 3; ++i)
	{	
		var x = rand.float(-1,1);
		var y = rand.float(-1,1);
		var len = 1 / gb.math.sqrt(x * x + y * y);
		x *= len;
		y *= len;

		var rad_x = gb.bezier.eval_f(curve_x, rand.float(0,1));
		var rad_y = gb.bezier.eval_f(curve_x, rand.float(0,1));
		//var rad_x = 1;
		//var rad_y = 1;

		x *= l.r * rad_x;
		y *= l.r * rad_y;
		x += l.x[0];
		y += l.y[0];

		l.x[i] = x;
		l.y[i] = y;		
	}

	/*
	for(var i = 0; i < 3; ++i)
	{
		draw.line(l.x[i], l.y[i], l.x[i+1], l.y[i+1]).stroke();
	}
	*/
	var ctx = gb.canvas.ctx;
	ctx.beginPath();
	ctx.moveTo(l.x[0], l.y[0]);
	ctx.bezierCurveTo(l.x[1],l.y[1],l.x[2],l.x[2],l.x[3],l.y[3]);
	draw.stroke();
}





