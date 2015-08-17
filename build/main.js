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
///INCLUDE demos/pbr.js
//DEBUG
function ASSERT(expr, message)
{
    if(expr === false) console.error(message);
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
	    var width = config.width || container.offsetWidth;
	    var height = config.height || container.offsetHieght;
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

	translate: function(x,y)
	{
		gb.canvas.ctx.translate(x,y);
	},

	rotate: function(angle)
	{
		gb.canvas.ctx.rotate(angle * gb.math.DEG2RAD);
	},

	scale: function(x,y)
	{
		gb.canvas.ctx.scale(x,y);
	},

	set_transform: function(tx,ty,sx,sy,r)
	{
		var ctx = gb.canvas.ctx;
		/*
		var theta = r * gb.math.DEG2RAD;
		var sin_t = gb.math.sin(theta);
		var cos_t = gb.math.cos(theta);
		gb.canvas.ctx.setTransform(cos_t * sx, -sin_t, sin_t, cos_t * sy, tx, ty);
		*/
		ctx.setTransform(1,0,0,1,0,0);
		ctx.rotate(r * gb.math.DEG2RAD);
		ctx.scale(sx, sy)
		ctx.translate(tx, ty);
	},
	set_transform_t: function(m)
	{
		gb.canvas.ctx.setTransform(m[0], m[3], m[1], m[4], m[2], m[5]);
	},

	clear_transform: function()
	{
		gb.canvas.ctx.setTransform(1,0,0,1,0,0);
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
		ctx.lineTo(x, y);
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
	fill_t: function(c)
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
gb.Entity = function()
{
	this.parent;
	this.children;
	this.active;
	this.layer;
	this.dirty;
	this.local_matrix;
	this.world_matrix;
}
gb.entity = 
{
	new: function()
	{
		var e = new gb.Entity();
		e.parent = null;
		e.children = [];
		e.active = true;
		e.layer = 0;
		e.dirty = true;
		e.local_matrix = gb.mat3.new();
		e.world_matrix = gb.mat3.new();
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
}


gb.Scene = function()
{
	this.matrix;
	this.num_entities;
	//this.num_cameras;
	this.entities;
	//this.cameras;
}
gb.scene = 
{
	new: function()
	{
		var s = new gb.Scene();
		s.matrix = gb.mat3.new();
		s.num_entities = 0;
		s.entities = [];
		return s;
	},
	add_entity: function(s, e)
	{
		s.entities.push(e);
		s.num_entities++;
	},
	
	/*
	add_camera: function(s, c)
	{
		s.cameras.push(c);
		s.entities.push(c.entity);
		s.num_entities++;
		s.num_cameras++;
    	//gb.camera.update_projection(c, gb.webgl.view);
	},

	add_sprite: function(s, spr)
	{
		s.sprites.push(spr);
		s.entities.push(spr.entity);
		s.num_entities++;
		s.num_sprites++;
	},
	*/

	/*
	update_camera: function(c)
	{
		ASSERT(c.entity != null, "Camera has no transform!");
		if(c.dirty === true)
		{
			gb.camera.update_projection(c);
		}
		gb.mat4.inverse(c.view, c.entity.world_matrix);
		gb.mat4.mul(c.view_projection, c.view, c.projection);
		gb.mat3.from_mat4(c.normal, c.view);
		gb.mat3.inverse(c.normal, c.normal);
		gb.mat3.transposed(c.normal, c.normal);
	},
	*/

	update_entity: function(s, e)
	{
		if(e.active === false || e.dirty === false) return;
		var m3 = gb.mat3;

		m3.eq(e.world_matrix, e.local_matrix);
		if(e.parent !== null)
		{
			m3.mul(e.world_matrix, e.world_matrix, e.parent.world_matrix);
		}
		for(var i = 0; i < e.num_children; ++i)
		{
			gb.scene.update_entity(e.children[i]);
		}
		m3.mul(e.world_matrix, e.world_matrix, s.matrix);
	},

	update: function(s)
	{
		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			gb.scene.update_entity(s, s.entities[i]);
		}
		/*
		n = s.num_cameras;
		for(var i = 0; i < n; ++i)
		{
			gb.scene.update_camera(s.cameras[i]);
		}
		n = s.num_sprites;
		for(var i = 0; i < n; ++i)
		{
			gb.sprite.update(s.sprites[i]);
		}
		*/
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

gb.init = init;
gb.update = update;

var v2 = gb.vec2;
var v3 = gb.vec3;
var m3 = gb.mat3;
var rand = gb.random;
var draw = gb.canvas;
var input = gb.input;
var scene = gb.scene;

var Player = function()
{
	this.x;
	this.y;
	this.rotation;
	this.w;
	this.h;
	this.vx;
	this.vy;
	this.dir;
	this.entity;	
}
var player;
var construct;

function init()
{
	var k = gb.Keys;
	input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.up, k.down, k.left, k.right],
	});

	var c = draw.new(gb.dom.find('.container'), {width:1136, height:640});
	draw.set_context(c);
	draw.clear_rgb(1,1,1,1);

	player = new Player();
	player.x = 100;
	player.y = 100;
	player.w = 15;
	player.h = 15;
	player.vx = 0;
	player.vy = 0;
	player.rotation = 0;
	player.dir = 0;
	player.entity = gb.entity.new();

	construct = scene.new();
	//m3.compose(construct.matrix, draw.view.width/2, draw.view.height/2, 1,1, 45);
	m3.compose(construct.matrix, 110, 110, 1,1, 0);


	scene.add_entity(construct, player.entity);
}

function update(t)
{
	var dt = gb.time.dt;
	var ctx = gb.canvas.ctx;
	var view = gb.canvas.view;

	/*
	if(input.up(gb.Keys.left))
	{
		if(player.dir === 0) //right
		{
			player.dir = 3; //up
			player.vy = -player.vx;
			player.vx = 0;
			player.rotation = 0;
		}
		else if(player.dir === 1) //down
		{
			player.dir = 0;
			player.vx = player.vy;
			player.vy = 0;
			player.rotation = 270;
		}
		else if(player.dir === 2) //left
		{
			player.dir = 1;
			player.vy = -player.vx;
			player.vx = 0;
			player.rotation = 180;
		}
		else //up
		{
			player.dir = 2;
			player.vx = player.vy;
			player.vy = 0;
			player.rotation = 90;
		}
	}
	else if(input.up(gb.Keys.right))
	{
		if(player.dir === 0) //right
		{
			player.dir = 1; //up
			player.vy = player.vx;
			player.vx = 0;
			player.rotation = 180;
		}
		else if(player.dir === 1) //down
		{
			player.dir = 2;
			player.vx = -player.vy;
			player.vy = 0;
			player.rotation = 90;
		}
		else if(player.dir === 2) //left
		{
			player.dir = 3;
			player.vy = player.vx;
			player.vx = 0;
			player.rotation = 0;
		}
		else //up
		{
			player.dir = 0;
			player.vx = -player.vy;
			player.vy = 0;
			player.rotation = 270;
		}
	}
	*/

	player.rotation += 10 * dt;
	//player.x += player.vx * dt;
	//player.y += player.vy * dt;
	m3.compose(player.entity.local_matrix, player.x, player.y, 1,1, player.rotation);
		
	scene.update(construct);

	draw.clear();
	draw_player(player);
}

function draw_player(p)
{
	var ctx = draw.ctx;
	//draw.set_transform_t(p.entity.local_matrix);
	draw.set_transform(p.x, p.y, 1, 1, p.rotation);
	/*
	ctx.beginPath();
	ctx.moveTo(0,-p.w);
	ctx.lineTo(p.w, p.w);
	ctx.lineTo(-p.w,p.w);
	ctx.lineTo(0,-p.w);
	*/
	draw.fill_rgb(0,0,0,1);
	draw.box(p.x,p.y,p.w,p.h);
	draw.fill();
}

function draw_box(x,y,w,h)
{
	draw.fill_rgb(0.8,0.2,0.3,1.0);
	draw.box(x,y,w,h);
	draw.fill();
}

