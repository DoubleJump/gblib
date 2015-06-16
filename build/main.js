'use strict';

/*
TODO: 
- split input by devices
- fire and forget animations
- pvrtc
- defered rendering
- basic sound
- particles
*/

//DEBUG
function ASSERT(expr, message)
{
    if(expr === false) console.error(message);
}
//END

var gb = {}
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
}
gb.Stack = function(type, count)
{
	this.data = [];
	this.index = 0;
	this.count = count;

	for(var i = 0; i < count; ++i)
		this.data.push(new type());
}
gb.Stack.prototype.begin = function()
{
	return this.index;
}
gb.Stack.prototype.end = function(index)
{
	this.index = index;
}
gb.Stack.prototype.get = function()
{
	var r = this.data[this.index];
	this.index += 1;
	if(this.index === this.count)
	{
		console.error("Stack overflow");
	}
	return r;	
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

	min: function(a, b)
	{
		if(a < b) return a; else return b;
	},
	max: function(a, b)
	{
		if(a > b) return a; else return b;
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

/*
	r_wav: function(br)
	{
		var s = gb.Searalize;
        var n = s.r_string(br);
		var header = new Uint32Array(br.buffer, br.offset, 13);
		var sound = new gb.Sound();
		sound.data = 
	},
	r_ogg: function(br)
	{
		var s = gb.Searalize;
        var n = s.r_string(br);
		var header = new Uint32Array(br.buffer, br.offset, 13);
		var sound = new gb.Sound();
		sound.data = 

	},
	*/
gb.Vec2 = function(x,y)
{
	var v = new Float32Array(2);
	v[0] = x;
	v[1] = y;
	return v;
}
gb.Vec3 = function(x,y,z)
{
	var v = new Float32Array(3);
	v[0] = x;
	v[1] = y;
	v[2] = z;
	return v;
}

gb.vec2 = 
{
	stack: new gb.Stack(gb.Vec2, 20),

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
		var r = _t.stack.get();
		_t.set(r, x || 0, y || 0);
		return r;
	},
	add: function(r, a,b)
	{
		r[0] = a[0] + b[0];
		r[1] = a[1] + b[1];
	},
	sub: function(r, a,b)
	{
		r[0] = a[0] - b[0];
		r[1] = a[1] - b[1];
	},
	mulf: function(r, a,f)
	{
		r[0] = a[0] * f;
		r[1] = a[1] * f;
	},
	divf: function(r, a,f)
	{
		r[0] = a[0] / f;
		r[1] = a[1] / f;
	},
	inverse: function(r, a)
	{
		r[0] = -a[0];
		r[1] = -a[1];
	},
	sqr_length: function(v)
	{
		return gb.vec2.dot(v,v);
	},
	length: function(v) 
	{
		return gb.math.sqrt(gb.vec2.sqr_length(v));
	},
	normalized: function(r, a) 
	{
		var _t = gb.vec2;
		var l = _t.sqr_length(v);
		if(l > gb.math.EPSILON)
		{
			_t.mulf(r, a, 1 / l);
		} 
		else
		{
			_t.eq(r,a);
		}
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
}

gb.vec3 = 
{
	stack: new gb.Stack(gb.Vec3, 32),

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
		var r = _t.stack.get();
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
	inverse: function(r, a)
	{
		r[0] = -a[0];
		r[1] = -a[1];
		r[2] = -a[2];
	},
	sqr_length: function(v)
	{
		return gb.vec3.dot(v,v);
	},
	length: function(v) 
	{
		return gb.math.sqrt(gb.vec3.sqr_length(v));
	},
	normalized: function(r, a) 
	{
		var _t = gb.vec3;
		var l = _t.sqr_length(v);
		if(l > gb.math.EPSILON)
		{
			_t.mulf(r, a, 1 / l);
		} 
		else
		{
			_t.eq(r,a);
		}
	},
	dot: function(a, b)
	{
		return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
	},
	cross: function(v, a, b)
	{
		r[0] = a[1] * b[2] - a[2] * b[0];
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
}
gb.Quat = function(x,y,z,w)
{
	var v = new Float32Array(4);
	v[0] = x;
	v[1] = y;
	v[2] = z;
	v[3] = w;
	return v;
}
gb.quat = 
{
	stack: new gb.Stack(gb.Quat, 5),

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
		var r = _t.stack.get();
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
	}
}
gb.Mat3 = function()
{
	var m = new Float32Array(9);
	m[0] = 1;
	m[1] = 0;
	m[2] = 0;
	m[3] = 0;
	m[4] = 1;
	m[5] = 0;
	m[6] = 0;
	m[7] = 0;
	m[8] = 1;
	return m;
}
gb.Mat4 = function()
{
	var m = new Float32Array(16);
	m[0] = 1;
	m[1] = 0;
	m[2] = 0;
	m[3] = 0;
	m[4] = 0;
	m[5] = 1;
	m[6] = 0;
	m[7] = 0;
	m[8] = 0;
	m[9] = 0;
	m[10] = 1;
	m[11] = 0;
	m[12] = 0;
	m[13] = 0;
	m[14] = 0;
	m[15] = 1;
	return m;
}

gb.mat3 =
{
	stack: new gb.Stack(gb.Mat3, 5),

	eq: function(a,b)
	{
		for(var i = 0; i < 9; ++i)
			a[i] = b[i];
	},
	tmp: function()
	{
		var _t = gb.mat3;
		var t = _t.stack.get();
		_t.identity(t);
		return t;
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
		var t = this.tmp();

	    r[0] = m[4] * m[8] - m[5] * m[7];
	    r[1] = m[2] * m[7] - m[1] * m[8];
	    r[2] = m[1] * m[5] - m[2] * m[4];
	    r[3] = m[5] * m[6] - m[3] * m[8];
	    r[4] = m[0] * m[8] - m[2] * m[6];
	    r[5] = m[2] * m[3] - m[0] * m[5];
	    r[6] = m[3] * m[7] - m[4] * m[6];
	    r[7] = m[1] * m[6] - m[0] * m[7];
	    r[8] = m[0] * m[4] - m[1] * m[3];

	    var det = m[0] * r[0] + m[1] * r[3] + m[2] * r[6];
	    if(math.abs(det) <= math.EPSILON)
	    {
	    	_t.identity(r);
	    }

	   	var idet = 1 / det;
	   	for(var i = 0; i < 9; ++i)
	   		r[i] *= idet;
	},

	mul: function(r, a,b)
	{
		r[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
		r[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
		r[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];
		r[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
		r[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
		r[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];
		r[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
		r[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
		r[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];
	},

	transposed: function(r,m)
	{
		r[1] = m[3];
		r[2] = m[6]; 
		r[3] = m[1];
		r[5] = m[7]; 
		r[6] = m[2]; 
		r[7] = m[5];
		r[8] = m[0];		
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
	}
}

gb.mat4 =
{
	stack: new gb.Stack(gb.Mat4, 5),

	eq: function(a,b)
	{
		for(var i = 0; i < 16; ++i)
			a[i] = b[i];
	},
	tmp: function()
	{
		var _t = gb.mat4;
		var t = _t.stack.get();
		_t.identity(t);
		return t;
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
		r[ 0] = a[ 0] * b[0] + a[ 1] * b[4] + a[ 2] * b[ 8] + a[ 3] * b[12];
		r[ 1] = a[ 0] * b[1] + a[ 1] * b[5] + a[ 2] * b[ 9] + a[ 3] * b[13];
		r[ 2] = a[ 0] * b[2] + a[ 1] * b[6] + a[ 2] * b[10] + a[ 3] * b[14];
		r[ 3] = a[ 0] * b[3] + a[ 1] * b[7] + a[ 2] * b[11] + a[ 3] * b[15];
		r[ 4] = a[ 4] * b[0] + a[ 5] * b[4] + a[ 6] * b[ 8] + a[ 7] * b[12];
		r[ 5] = a[ 4] * b[1] + a[ 5] * b[5] + a[ 6] * b[ 9] + a[ 7] * b[13];
		r[ 6] = a[ 4] * b[2] + a[ 5] * b[6] + a[ 6] * b[10] + a[ 7] * b[14];
		r[ 7] = a[ 4] * b[3] + a[ 5] * b[7] + a[ 6] * b[11] + a[ 7] * b[15];	
		r[ 8] = a[ 8] * b[0] + a[ 9] * b[4] + a[10] * b[ 8] + a[11] * b[12];
		r[ 9] = a[ 8] * b[1] + a[ 9] * b[5] + a[10] * b[ 9] + a[11] * b[13];
		r[10] = a[ 8] * b[2] + a[ 9] * b[6] + a[10] * b[10] + a[11] * b[14];
		r[11] = a[ 8] * b[3] + a[ 9] * b[7] + a[10] * b[11] + a[11] * b[15];
		r[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[ 8] + a[15] * b[12];
		r[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[ 9] + a[15] * b[13];
		r[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
		r[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
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
gb.Rect = function(x,y,w,h)
{
	this.x = x || 0;
	this.y = y || 0;
	this.width = w || 0;
	this.height = h || 0;
}
gb.rect = 
{
	stack: new gb.Stack(gb.Rect, 20),

	set: function(r, x,y,w,h)
	{
		r.x = x;
		r.y = y;
		r.width = w;
		r.height = h;
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
		var r = gb.rect.stack.get();
		gb.rect.set(r, x || 0, y || 0, w || 0, h || 0);
		return r;
	},
}
gb.AABB = function()
{
    this.min = new gb.Vec3();
    this.max = new gb.Vec3();
}

gb.aabb = 
{
	stack: new gb.Stack(gb.AABB, 16),

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
		var v = _t.stack.get();
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
gb.Ray = function(point, dir)
{
	this.point = new gb.Vec3();
	this.dir = new gb.Vec3();
}
gb.Ray.prototype.set = function(point, dir)
{
	this.point.eq(point); 
	this.dir.eq(dir);
}
gb.ray = 
{
	stack: new gb.Stack(gb.Ray, 5),

	tmp: function(point, ray)
	{
		var v = gb.ray.stack.get();
		gb.ray.set(v, point,ray);
		return v;
	},
	set: function(r, point, ray)
	{
		gb.vec3.eq(r.point, point);
		gb.vec3.eq(r.ray, ray);
	},
	eq: function(a,b)
	{
		gb.ray.set(a, b.point, b.dir);
	},
}
gb.Hit = function()
{
	this.hit = false;
	this.point = new gb.Vec3();
	this.normal = new gb.Vec3();
	this.t = 0;
}


gb.intersect = 
{
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
		gb.vec3.add(h.end, r.point, v);
		h.hit = true;
		h.normal = null;
		h.t = t;
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
		var t = -(v3.dot(n,r.point) + v3.dot(n,a)) / v3.dot(n, r.dir);

		v3.mulf(e0, r.dir, t);
		v3.add(e1, r.point, dist);

		if(gb.intersect.point_triangle(e1, a,b,c))
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
}

gb.Color = function(r,g,b,a)
{
	var v = new Float32Array(4);
	v[0] = r;
	v[1] = g;
	v[2] = b;
	v[3] = a;
	return v;
}

gb.color = 
{
	stack: new gb.Stack(gb.Color, 10),

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
		var c = gb.color.stack.get();
		gb.color.set(c, r || 0, g || 0, b || 0, a || 0);
		return c;
	},
}
gb.Camera = function()
{
	this.projection_type = null;
	this.projection = new gb.Mat4();
	this.view = new gb.Mat4();
	this.view_projection = new gb.Mat4();
	this.mask;
	this.dirty;
	this.aspect;
	this.near;
	this.far;
	this.fov;
	this.entity;
}

gb.camera = 
{
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

gb.new_camera = function(projection, near, far, fov, mask)
{
    var c = new gb.Camera();
    c.projection_type = projection || gb.Projection.PERSPECTIVE;
    c.near = near || 0.1;
    c.far = far || 100;
    c.fov = fov || 60;
    c.mask = mask || 0;
    c.dirty = true;
    c.entity = new gb.Entity();
    return c;
}
gb.time = 
{
	began: 0,
    elapsed: 0,
    now: 0,
    last: 0,
    dt: 0,
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
    	_t.dt = (t - _t.last) / 1000;
    	_t.last = t;
    },
}
gb.Entity = function()
{
	this.parent = null;
	this.children = [];

	this.active = true;
	this.layer = 0;
	this.dirty = true;

	this.position = new gb.Vec3(0,0,0);
	this.scale = new gb.Vec3(1,1,1);
	this.rotation = new gb.Quat(0,0,0,1);

	this.local_matrix = new gb.Mat4();
	this.world_matrix = new gb.Mat4();
	this.bounds = new gb.AABB();

	this.mesh = null;
}
gb.entity = 
{
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
			e.parent.remove_child(e);
			e.parent = null;
		}
		else if (e.parent !== null && parent !== null) // swapping parent
		{
			e.parent.remove_child(e);
			e.parent = parent;
			e.parent.add_child(e);
		}
		else // setting new parent from null
		{
			e.parent = parent;
			e.parent.add_child(e);
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
gb.new_entity = function(mesh, scene)
{
	var e = new gb.Entity();
	e.mesh = mesh;
	gb.scene.add_entity(scene, e);
	return e;
}

gb.Scene = function()
{
	this.num_entities = 0;
	this.num_cameras = 0;
	this.entities = [];
	this.cameras = [];
	//this.render_groups: [],
}
gb.scene = 
{
	add_entity: function(s, e, rg)
	{
		s.entities.push(e);
		s.num_entities++;
	},
	
	add_camera: function(s, c)
	{
		s.cameras.push(c);
		s.entities.push(c.entity);
		s.num_cameras++;
    	gb.camera.update_projection(c, gb.webgl.view);
	},

	update_camera: function(c)
	{
		ASSERT(c.entity != null, "Camera has no transform!");
		if(c.dirty === true)
		{
			gb.camera.update_projection(c);
		}
		gb.mat4.inverse(c.view, c.entity.world_matrix);
		gb.mat4.mul(c.view_projection, c.view, c.projection);
	},

	update_entity: function(e)
	{
		if(e.active === false || e.dirty === false) return;
		gb.mat4.compose(e.world_matrix, e.position, e.scale, e.rotation);
		if(e.parent !== null)
		{
			gb.mat4.mul(e.world_matrix, e.parent.world_matrix);
		}
		for(var i = 0; i < e.num_children; ++i)
		{
			gb.scene.update_entity(e.children[i]);
		}
	},

	update: function(s)
	{
		var ne = s.num_entities;
		for(var i = 0; i < ne; ++i) 
		{
			gb.scene.update_entity(s.entities[i]);
		}
		var nc = s.num_cameras;
		for(var i = 0; i < nc; ++i)
		{
			gb.scene.update_camera(s.cameras[i]);
		}
	},
}
gb.Canvas2D = function()
{
	this.view = null;
	this.ctx = null;
}
gb.new_canvas = function(container, config)
{
	var c = new gb.Canvas2D();
    var canvas = gb.dom.insert('canvas', container);
	var width = container.offsetWidth;
    var height = container.offsetHeight;
	c.view = new gb.Rect(0,0,width,height);
	c.ctx = canvas.getContext('2d');
	return c;
}

gb.canvas = 
{
	ctx: null,

	set_context: function(canvas)
	{
		this.ctx = canvas.ctx;
	},

	clear: function(color)
	{

	},

	fill: function(color)
	{
		this.ctx.fillStyle = color;
		this.ctx.fill();
	},

	stroke: function(color, thickness)
	{
		this.ctx.lineWidth = thickness;
		this.ctx.strokeStyle = color;
		this.ctx.stroke();
	},

	rect: function(r, color)
	{
		this.ctx.fillStyle = color;
		this.ctx.fillRect(r.x, r.y, r.width, r.height);
	},
	line: function(start, end, width, color)
	{
		this.ctx.fillStyle = color;
		this.ctx.moveTo(start.x, start.y);
		this.ctx.lineTo(end.x, end.y);
	},
	polygon: function(points)
	{
		var n = points.length;
		var p = points[0];
		this.ctx.beginPath();
		this.ctx.moveTo(p.x, p.y);
		for(var i = 1; i < n; ++i)
		{
			p = points[i];
		    this.ctx.lineTo(p.x, p.y);
		}
	},
	circle: function(pos, radius)
	{
		this.ctx.arc(pos.x, pos.y, radius, 0, 360 * gb.math.DEG2RAD, true);
	},
	arc: function(pos, radius, start, end, cw)
	{
		this.ctx.arc(pos.x, pos.y, radius, start * gb.math.DEG2RAD, end * gb.math.RAD2DEG, cw);
	},
	curve: function()
	{

	},
	rounded_rect: function(r, radius)
	{
		this.ctx.beginPath();
		this.ctx.moveTo(r.x, r.y + radius);
		this.ctx.lineTo(r.x, r.y + r.height-radius);
		this.ctx.quadraticCurveTo(r.x, r.y + r.height, r.x + radius, r.y + r.height);
		this.ctx.lineTo(r.x + r.width - radius, r.y + r.height);
		this.ctx.quadraticCurveTo(r.x + r.width, r.y + r.height, r.x + r.width, r.y + r.height - radius);
		this.ctx.lineTo(r.x + r.width, r.y + radius);
		this.ctx.quadraticCurveTo(r.x + r.width, r.y, r.x + r.width-radius, r.y);
		this.ctx.lineTo(r.x + radius, r.y);
		this.ctx.quadraticCurveTo(r.x, r.y, r.x, r.y + radius);
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
	this.layout;
	this.vertex_buffer;
	this.vertex_count;
	this.index_buffer;
	this.index_count;
	this.dirty;
}
gb.new_mesh = function(vertex_count, vertices, mask, indices)
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
    m.dirty = true;
    return m;
}
gb.mesh = 
{
	get_stride: function(vb)
	{
		var stride = 0;
		var index = 1;
		for(var i = 0; i < 5; ++i)
		{
			var mr = (index & vb.mask) === index;
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

		var stride = gb.mesh.get_stride(m.vertex_buffer);
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
	var h = s.r_i32_array(br, 4);
	var vertices = s.r_f32_array(br, h[1]);
	var indices = s.r_u32_array(br, h[2]);
	return gb.new_mesh(h[0], vertices, h[3], indices);
}
gb.mesh_tools = 
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
	    return gb.new_mesh(4, data, mask, tris);
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
	    return gb.new_mesh(24, data, mask, tris);
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
}
gb.Sampler = function()
{
	this.x;
	this.y;
	this.up;
	this.down;
}
gb.new_sampler = function(x,y,up,down)
{
    var s = new gb.Sampler();
    s.x = x;
    s.y = y;
    s.up = up;
    s.down = down;
    return s;
}
gb.new_rgba_texture = function(width, height, pixels, sampler, mipmaps)
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
}
gb.new_depth_texture = function(width, height)
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

    if(h[2] & 0x20000) 
    {
        t.mipmaps = Math.max(1, h[7]);
    }
    br.offset += size;

    return t;
}
/*
gb.serialize.r_pvrtc = function(br)
{
	//https://developer.apple.com/library/ios/samplecode/PVRTextureLoader/Listings/Classes_PVRTexture_m.html#//apple_ref/doc/uid/DTS40008121-Classes_PVRTexture_m-DontLinkElementID_12

	typedef struct _PVRTexHeader
	{
	    uint32_t headerLength;
	    uint32_t height;
	    uint32_t width;
	    uint32_t numMipmaps;
	    uint32_t flags;
	    uint32_t dataLength;
	    uint32_t bpp;
	    uint32_t bitmaskRed;
	    uint32_t bitmaskGreen;
	    uint32_t bitmaskBlue;
	    uint32_t bitmaskAlpha;
	    uint32_t pvrTag;
	    uint32_t numSurfs;
	} PVRTexHeader;

	var s = gb.serialize;
	var pvr = gb.webgl.extensions.pvr;
	var n = s.r_string(br);
	var header = new Uint32Array(br.buffer, br.offset, 13);
	var version = header[4] & 0xff;

	var PVRTC_2 = 24;
	var PVRTC_4 = 25;
	ASSERT(version === PVRTC_2 || version === PVRTC_4, "Unsupported PVRTC format");

	var t = new gb.Texture();
	t.height = header[1]
	t.width = header[2];
	t.mipmaps = header[3];

	var data_length = header[5];
	var block_size = 0;
	if(version === PVRTC_2)
	{
		block_size = 16;
	}
	else
	{
		 block_size = 24;
	}

	var bpp = header[6];
	switch(bpp)
	{
		case :
			t.format = ;
			t.byte_size = ;
		break;
		case :
			t.format = ;
			t.byte_size = ;
		break;
	}
	 
	br.offset += header[0];
	var size = header[5];
    t.pixels = new Uint8Array(br.buffer, br.offset, size);
    br.offset += size * bpp;

	gb.renderer.link_texture(t, gb.default_sampler);
    gb.textures[n] = t;
    return t;
}
*/
gb.Shader_Attribute = function()
{
	this.location;
	this.index;
}
gb.Shader = function()
{
    this.id = 0;
    this.vertex_src;
    this.fragment_src;
    this.num_attributes;
    this.num_uniforms;
    this.attributes = [null, null, null, null, null];
    this.uniforms = {};
}
gb.new_shader = function(v_src, f_src)
{
    var s = new gb.Shader();
    s.vertex_src = v_src;
    s.fragment_src = f_src;
    return s;
}
gb.serialize.r_shader = function(br)
{
	var s = gb.serialize;
   	var vs = s.r_string(br);
   	var fs = s.r_string(br);
    return gb.new_shader(vs, fs);
}
gb.Render_Target = function()
{
	this.bounds;
	this.frame_buffer;
	this.render_buffer;
	this.color;
	this.depth;
	this.stencil;
}

gb.new_render_target = function(view, mask, color)
{
    var rt = new gb.Render_Target();
    rt.bounds = new gb.Rect();
    gb.rect.eq(rt.bounds, view);
    if((1 & mask) === 1) //color
    {
        rt.color = gb.new_rgba_texture(view.width, view.height, null, gb.webgl.default_sampler, 0);
        gb.webgl.link_texture(rt.color);
    }
    if((2 & mask) === 2) //depth
    {
        rt.depth = gb.new_depth_texture(view.width, view.height);
        gb.webgl.link_texture(rt.depth);
    }
    if((4 & mask) === 4)
    {
        //rt.stencil = this.new_stencil_texture(view.with, view.height);
    }
    gb.webgl.link_render_target(rt);
    return rt;
},

gb.webgl = 
{
	extensions: 
	{
		depth_texture: null,
		dxt: null,
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

		var width = container.offsetWidth * config.resolution;
        var height = container.offsetHeight * config.resolution;
        var canvas = gb.dom.insert('canvas', container);
        canvas.width = width;
        canvas.height = height;
        _t.view = new gb.Rect(0,0,width,height);

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
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); //works with premultiplied alpha
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL); 
    	gl.clearDepth(1.0);
		
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CCW);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(0,0, canvas.width, canvas.height);
		
        gl.viewport(0,0, canvas.width, canvas.height);
        gl.clearColor(0.0,0.0,0.0,0.0);
        //gl.colorMask(true, true, true, false);
    	//gl.clearStencil(0);
    	//gl.depthMask(true);
		//gl.depthRange(-100, 100); // znear zfar
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        _t.default_sampler = gb.new_sampler(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);

		var ex = _t.extensions;
		ex.depth_texture = gl.getExtension("WEBGL_depth_texture");
		ex.dxt = gl.getExtension("WEBGL_compressed_texture_s3tc"); //works on osx!
		ex.fp_texture = gl.getExtension("OES_texture_float");
		ex.uint = gl.getExtension("OES_element_index_uint");

		_t.screen_mesh = gb.mesh_tools.quad(2,2);
		_t.link_mesh(_t.screen_mesh);

        var v_src = "attribute vec3 position;\n attribute vec2 uv;\n varying vec2 _uv;\n void main()\n {\n _uv = uv;\n gl_Position = vec4(position, 1.0);\n }";
        var f_src = "precision mediump float;\n varying vec2 _uv;\n uniform sampler2D tex;\n void main()\n {\n gl_FragColor = texture2D(tex, _uv);\n }";

        _t.screen_shader = gb.new_shader(v_src, f_src);
        _t.link_shader(_t.screen_shader);
		_t.m_offsets = new Uint32Array(5);
	},

	link_mesh: function(m)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		m.vertex_buffer.id = gl.createBuffer();
		if(m.index_buffer)
			m.index_buffer.id = gl.createBuffer();
		_t.update_mesh(m);
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
		var gl = gb.webgl.ctx;
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
	    		var sa = new gb.Shader_Attribute();
	    		sa.location = loc;
	    		sa.index = i;
	    		s.attributes[c] = sa;
	    		c++;
	    	}
	    }

	    for(var i = 0; i < s.num_uniforms; ++i)
	    {
	        var uniform = gl.getActiveUniform(id, i);
	        var location = gl.getUniformLocation(id, uniform.name);
	        s.uniforms[uniform.name] = location;
	    }

	    return s;
	},

	set_shader: function(s)
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
		switch(t.format)
		{
			case _t.extensions.dxt.COMPRESSED_RGBA_S3TC_DXT1_EXT:
				gl.compressedTexImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.pixels);
			break;
			case _t.extensions.dxt.COMPRESSED_RGBA_S3TC_DXT5_EXT:
				gl.compressedTexImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.pixels);
			break;
			default:
				gl.texImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.format, t.byte_size, t.pixels);
			break;
		}

		if(t.mipmaps > 1) 
			gl.generateMipmap(gl.TEXTURE_2D);
	},

	set_viewport: function(v)
	{
		var gl = gb.webgl.ctx;
		gl.viewport(v.x, v.y, v.width, v.height);
		//scissor?
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
	},

	clear: function(rt)
	{
		var gl = gb.webgl.ctx;
		var mode = 0;
		if(rt.color) mode |= gl.COLOR_BUFFER_BIT;
		if(rt.depth) mode |= gl.DEPTH_BUFFER_BIT;
		gl.clear(mode);
	},

	/*
	render: function(draw_calls)
	{
		var i = 0;
		var n = 0;
		var r = gb.webgl;

		n = draw_calls.length;
		for(i = 0; i < n; ++i)
		{
			var dc = draw_calls[i];
			var s = dc.shader;

			gl.useProgram(s.id);

			//could annotate the shader code e.g #CAM_MATS #N_MATS #LIGHTING etc
			_t.link_camera(s, dc.camera);

			//TODO: LIGHTS

			_t.link_textures(s, dc.textures);

			var ne = dc.entities.length;
			for(var ii = 0; ii < ne; ++ii)
			{
				var e = dc.entities[ii];

				r.set_shader_mat4(s, "model", e.matrix);
				r.set_shader_mat4(s, "mv", model_view);
				r.set_shader_mat4(s, "mvp", model_view_projection);

				// TODO: NMATRIX

				var m = e.mesh;
				var na = s.num_attributes;
				for(var iii = 0; iii < na; ++iii)
		        {
		        	_t.link_attributes(s,m);
		        }

		        //TODO: if(m.index_buffer) else 
		    	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.index_buffer.id);
		        gl.drawElements(gl.TRIANGLES, m.index_count, gl.UNSIGNED_SHORT, 0);
			}
		}
	},
	*/
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

	set_shader_texture: function(shader, name, texture, index)
	{
		var gl = gb.webgl.ctx;
		gl.bindTexture(gl.TEXTURE_2D, texture.id);
		gl.activeTexture(gl.TEXTURE0 + index);
		gl.uniform1i(shader.uniforms[name], texture.id);
	},
	set_shader_mat4: function(shader, name, m)
	{
		gb.webgl.ctx.uniformMatrix4fv(shader.uniforms[name], false, m);
	},
	set_shader_mat3: function(shader, name, m)
	{
		gb.webgl.ctx.uniformMatrix3fv(shader.uniforms[name], false, m);
	},
	set_shader_quat: function(shader, name, q)
	{
		gb.webgl.ctx.uniform4f(shader.uniforms[name], false, q[0], q[1], q[2], q[3]);
	},
	set_shader_color: function(shader, name, c)
	{
		gb.webgl.ctx.uniform4f(shader.uniforms[name], false, c[0], c[1], c[2], c[3]);
	},
	set_shader_vec3: function(shader, name, v)
	{
		gb.webgl.ctx.uniform3f(shader.uniforms[name], false, v[0], v[1], v[2]);
	},
	set_shader_vec2: function(shader, name, v)
	{
		gb.webgl.ctx.uniform2f(shader.uniforms[name], false, v[0], v[1]);
	},
	set_shader_float: function(shader, name, f)
	{
		gb.webgl.ctx.uniformf(shader.uniforms[name], false, f);
	},
	set_shader_int: function(shader, name, i)
	{
		gb.webgl.ctx.uniformi(shader.uniforms[name], false, i);
	},

	world_to_screen: function(r, camera, world, view)
    {
    	var wp = gb.vec3.tmp(); 
        gb.mat4.mul_projection(wp, camera.view_projection, world);
        r[0] = ((wp[0] + 1.0) / 2.0) * view.width;
        r[1] = ((1.0 - wp[1]) / 2.0) * view.height;
    },

    screen_to_view: function(r, screen, view)
    {
        r[0] = screen[0] / view.width;
        r[0] = 1.0 - (screen[1] / view.height);
        r[2] = screen[2];
        return r;
    },

    screen_to_world: function(r, camera, sreen, view)
    {
        var t = gb.vec3.tmp();
        t[0] = 2.0 * screen[0] / view.width - 1.0;
        t[1] = -2.0 * screen[1] / view.height + 1.0;
        t[2] = screen[2];
            
        var inv = gb.mat4.tmp();
        gb.mat4.inverse(inv, camera.view_projection);
        gb.mat4.mul_projection(r, inv, t);
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
//END
gb.Sound = function()
{
	this.data;
	this.volume;
	//this.src;??
}

gb.audio = 
{
	ctx: null,
	decode_count: 0,
	//oscillator: null,
	//gain: null,

	init: function()
	{
		try 
		{
		    window.AudioContext = window.AudioContext || window.webkitAudioContext;
		    this.ctx = new AudioContext();
		}
		catch(e) 
		{
		    console.error('Web Audio API could not be initialised: ' + e);
		}
	},

	/*
	decode: function(sounds)
	{
		this.decode_count = sounds.length;
		for(var i = 0; i < this.decode_count; ++i)
		{
			this.ctx.decodeAudio(sounds[i].buffer, on_decode);
		}
	},

	on_decode: function(n, buffer)
	{
		this.decode_count--;
		if(this.decode_count === 0)
		{
			gb.load_complete(1);
		}
	}

	play: function(s)
	{
		var src = this.ctx.createBufferSource();
		src.buffer = s.buffer;
		src.connect(this.ctx.destination);
		src.start(0);
	},

	cross_face: function(s)
	{

	},
	*/
}
gb.Touch = function()
{
	this.touching = false;
	this.position = new gb.Vec3();
}

gb.KeyState = 
{
	UP: 1,
	DOWN: 2,
	HELD: 3,
	RELEASED: 4,
}

gb.input = 
{
	mouse_position: new gb.Vec3(),
	mouse_scroll: 0,

	touches: [null, null, null, null, null],
	acceleration: new gb.Vec3(),
	angular_acceleration: new gb.Vec3(),
	rotation: new gb.Quat(),

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

		for(var i = 0; i < 5; ++i)
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
			var k = _t.keys[i];
			if(k === gb.KeyState.DOWN) _t.keys[k] = gb.KeyState.HELD;
			else if(_t.keys[k] === gb.KeyState.UP) _t.keys[k] = gb.KeyState.RELEASED;
		}
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
		var kc = e.keyCode;
		if(_t.keys[kc] === 0) return;

		if(_t.keys[kc] != gb.KeyState.HELD) 
			_t.keys[kc] = gb.KeyState.DOWN;

		e.preventDefault();
	},
	key_up: function(e)
	{
		var _t = gb.input;
		var kc = e.keyCode;
		if(_t.keys[kc] === 0) return;

		if(_t.keys[kc] != gb.KeyState.RELEASED) 
			_t.keys[kc] = gb.KeyState.UP;

		e.preventDefault();
	},

	mouse_move: function(e)
	{
		gb.vec3.set(gb.input.mouse_position, e.clientX, e.clientY, 0);
	},
	mouse_wheel: function(e)
	{
		gb.input.mouse_scroll = e.deltaY;
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
		var n = e.touches.length;
		for(var i = 0; i < n; ++i)
		{
			var it = e.touches[i];
			var t = gb.input.touches[i];
			gb.vec3.set(t.position, it.screenX, it.screenY, 0);
			t.touching = true;
		}
		e.preventDefault();
	},
	touch_move: function(e)
	{
		var n = e.touches.length;
		for(var i = 0; i < n; ++i)
		{
			var it = e.touches[i];
			var t = gb.input.touches[i];
			gb.vec3.set(t.position, it.screenX, it.screenY, 0);
		}
		e.preventDefault();
	},
	touch_end: function(e)
	{
		var n = e.touches.length;
		for(var i = 0; i < n; ++i)
		{
			gb.input.touches[i].touching = false;
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
}
gb.Asset_Group = function()
{
    this.shaders = {};
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
    request.upload.asset_group = asset_group; //hack
    request.upload.callback = on_load;
    request.send();
    //console.log(request);
}
gb.on_asset_load = function(e)
{
	// NOTE: asset data encoded in little endian (x86)
    if(e.target.status === 200)
    {
        var s = gb.serialize;
        var br = new gb.Binary_Reader(e.target.response);
        var ag = e.target.upload.asset_group;

        //console.log(ag);

        var header = s.r_i32_array(br, 3);
        var n_shaders = header[0];
        var n_meshes = header[1];
        var n_textures = header[2];
        //var n_sounds = header[3];

        //DEBUG
        console.log("Shaders: " + n_shaders);
        console.log("Meshes: " + n_meshes);
        console.log("Textures: " + n_textures);
        //console.log("Sounds: " + n_sounds);
        //END

        for(var i = 0; i < n_shaders; ++i)
        {
        	var name = s.r_string(br);
            ag.shaders[name] = s.r_shader(br);
        }

        for(var i = 0; i < n_meshes; ++i)
        {
        	var name = s.r_string(br);
            ag.meshes[name] = s.r_mesh(br);
        }
        
        //test pvrtc / dds
        for(var i = 0; i < n_textures; ++i)
        {
        	var name = s.r_string(br);
            ag.textures[name] = s.r_dds(br);
        }


        /*
        //test wav / ogg
        for(var i = 0; i < n_sounds; ++i)
            s.r_wav(br);
        */
              
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
    //audio
    callback();
}

var focus = true;
var assets;
var alpha;
var camera;
var texture;
var shader;
var rotation;
var render_target;

var scene;
var bob;
var fred;
var bounds;

window.addEventListener('load', init, false);

var RenderGroup = function()
{
	//this.shader;
	//this.textures = [null,null,null,null,null,null,null,null];
	this.entities = [];
}
var render_group;


function init()
{
	gb.time.init();
	gb.input.init(document,
	{
		keycodes: [0,1],
	});
	/*
	var canvas = gb.new_canvas(gb.dom.find('.container'));
	gb.canvas.set_context(canvas);
	*/
	
	gb.audio.init();

	gb.webgl.init(gb.dom.find('.container'),
	{
		resolution: 1,
		alpha: false,
		depth: true,
		stencil: false,
		antialias: false,
		premultipliedAlpha: true,
		preserveDrawingBuffer: false,
	});

	//DEBUG
	gb.gl_draw.init({buffer_size: 4096});
	//END

	assets = new gb.Asset_Group();
	if(gb.webgl.extensions.dds !== null)
	{
		gb.load_asset_group("assets.gl", assets, load_complete, load_progress);
	}

	//document.body.addEventListener('touchmove', function(e) { e.preventDefault(); }, false); //scrolljack
	window.onfocus = on_focus;
	window.onblur = on_blur;

	//update_canvas(0);
}

function update_canvas(t)
{
	gb.canvas.circle(gb.vec3.tmp(100,100), 50);
	gb.canvas.stroke("#00ff00",5);
}

function on_focus(e)
{
	console.log('focus');
	focus = true;
}
function on_blur(e)
{
	console.log('blur');
	focus = false;
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
	scene = new gb.Scene();
	
	bob = gb.new_entity(assets.meshes.cube, scene);
	fred = gb.new_entity(assets.meshes.cube, scene);
	//bob.mesh.layout = gb.webgl.ctx.LINES;
	
	texture = assets.textures.dxt5;
	shader = assets.shaders.flat;

	camera = gb.new_camera();
	//camera.fov = 60;
	gb.scene.add_camera(scene, camera);

	render_group = new RenderGroup();
	render_group.entities.push(fred);
	render_group.entities.push(bob);

	rotation = 0;
	bounds = new gb.AABB();
	gb.mesh.get_bounds(bounds, bob.mesh);

	render_target = gb.new_render_target(gb.webgl.view, 1 | 2);
	requestAnimationFrame(upA);
}



function update(timestamp)
{
	// TODO register each stack to do this automatically
	gb.vec2.stack.index = 0;
	gb.vec3.stack.index = 0;
	gb.quat.stack.index = 0;
	gb.mat3.stack.index = 0;
	gb.mat4.stack.index = 0;
	gb.aabb.stack.index = 0;
	gb.color.stack.index = 0;
	gb.ray.stack.index = 0;
	gb.rect.stack.index = 0;

	/*
	var touch = gb.input.touches[0];
	if(touch.touching)
	{
		position.eq(gb.screen_to_world(camera, touch.position, gb.view));
	}
	*/

	rotation += 1.0 * gb.time.dt;

	gb.entity.set_position(bob, 0,0,-4.0);
	gb.entity.set_rotation(bob, rotation * 10, rotation * 30, rotation * 10);

	gb.entity.set_position(fred, 2.0,0,-2.0);
	gb.entity.set_rotation(fred, rotation * -10, rotation * -20, rotation * 10);

	gb.scene.update(scene);

	var t_bounds = gb.aabb.tmp();
	gb.aabb.eq(t_bounds, bounds);
	gb.aabb.transform(t_bounds, bob.world_matrix);

	gb.gl_draw.clear();
	gb.gl_draw.set_color(0.7,0.2,0.3,0.5);
	//gb.gl_draw.set_position(gb.vec3.tmp(0,0,-2.0));
	//gb.gl_draw.rect(gb.rect.tmp(-0.3,-0.3,0.6,0.6));
	//gb.gl_draw.line(gb.vec3.tmp(0,0,-2), gb.vec3.tmp(1,1,-2));
	//gb.gl_draw.circle(0.2, 32);
	//gb.gl_draw.transform(bob.world_matrix);
	//gb.gl_draw.set_position(bob.position);
	gb.gl_draw.bounds(t_bounds);
	//gb.gl_draw.sphere(0.2, 12,12);
	//gb.gl_draw.cube(1.36,0.5,1.0);
	//gb.gl_draw.cube(gb.aabb.width(t_bounds), gb.aabb.height(t_bounds), gb.aabb.depth(t_bounds));


	gb.input.update();

}


function upA(t)
{
	gb.time.update(t);
	if(gb.time.paused || focus === false)
	{
		requestAnimationFrame(upA);
		return;
	}

	update(t);
	render(t);
	
	requestAnimationFrame(display);
}

function draw_objects(group, shader, camera)
{
	gb.webgl.set_shader(shader);

	var mvp = gb.mat4.tmp();
	var ne = group.entities.length;
	for(var i = 0; i < ne; ++i)
	{
		var e = group.entities[i];
		gb.webgl.link_attributes(shader, e.mesh);
		gb.mat4.mul(mvp, e.world_matrix, camera.view_projection);
		gb.webgl.set_shader_mat4(shader, "mvp", mvp);
		//gb.webgl.draw_mesh_elements(e.mesh);
		gb.webgl.draw_mesh_arrays(e.mesh);
	}
}

function render(t)
{
	var r = gb.webgl;

	r.set_render_target(render_target, true);
	draw_objects(render_group, shader, camera);
	gb.gl_draw.draw(camera);
}

function display(t)
{
	var r = gb.webgl;
	var s = r.screen_shader;
	var m = r.screen_mesh;
	
	r.ctx.disable(r.ctx.DEPTH_TEST);
	r.set_render_target(null);
	r.set_shader(s);
	r.link_attributes(s, m);
	r.set_shader_texture(s, "tex", render_target.color, 0);
	r.draw_mesh_elements(m);

	requestAnimationFrame(upA);
}
