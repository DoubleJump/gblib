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

	normalized: function(r, v) 
	{
		var _t = gb.quat;
		var l = _t.sqr_length(v);
		var x, y, z, w;
		if(l > gb.math.EPSILON)
		{
			var il = gb.math.sqrt(1/l);
			x = v[0] * il;
			y = v[1] * il;
			z = v[2] * il;
			w = v[3] * il;
		} 
		else
		{
			x = v[0];
			y = v[1]; 
			z = v[2];
			w = v[3];
		}
		_t.set(r,x,y,z,w);
	},

	conjugate:function(r, q) 
	{
		r[0] = -q[0];
		r[1] = -q[1];
		r[2] = -q[2];
		r[3] = q[3];
	},

	inverse:function(r, q)
	{
		var _t = gb.quat;
		var t = _t.tmp(0,0,0,1);
		_t.normalized(r, _t.conjugate(t,q));
	},

	euler: function(r, v)
	{
		gb.quat.euler_f(r, v[0], v[1], v[2]);
	},

	euler_f:function(r, x,y,z)
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

	look_at: function(r, from, to, forward)
	{
		var _t = gb.quat;
		var v3 = gb.vec3;
		var temp = v3.tmp();
		v3.sub(temp, from, to);
		v3.normalized(temp, temp);
		_t.from_to(r, forward, to);
	},

	lerp: function(r, a,b, t)
	{
		var it = 1-t;
		r[0] = it * a[0] + t * b[0];
		r[1] = it * a[1] + t * b[1];
		r[2] = it * a[2] + t * b[2];
		r[3] = it * a[3] + t * b[3];
	},

	slerp: function(r, a,b, t) 
	{
		var flip = 1;
		var cosine = a[3] * b[3] + a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
		
		if(cosine < 0) 
		{ 
			cosine = -cosine; 
			flip = -1;
		} 
		
		if((1 - cosine) < gb.math.EPSILON)
		{
			r[0] = (1-t) * a[0] + (t * flip) * b[0];
			r[1] = (1-t) * a[1] + (t * flip) * b[1];
			r[2] = (1-t) * a[2] + (t * flip) * b[2];
			r[3] = (1-t) * a[3] + (t * flip) * b[3];
			return;
		}
		
		var theta = gb.math.acos(cosine); 
		var sine = gb.math.sin(theta); 
		var beta = gb.math.sin((1 - t) * theta) / sine; 
		var alpha = gb.math.sin(t * theta) / sine * flip; 
		
		r[0] = a[0] * beta + b[0] * alpha;
		r[1] = a[1] * beta + b[1] * alpha;
		r[2] = a[2] * beta + b[2] * alpha;
		r[3] = a[3] * beta + b[3] * alpha;
	}, 
}