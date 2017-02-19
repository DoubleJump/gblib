function Vec3(x,y,z)
{
	return new Float32Array([x || 0, y || 0, z || 0]);
}
function Vec4(x,y,z,w)
{
	return new Float32Array([x || 0, y || 0, z || 0, w || 1]);
}

var vec3_stack = new Stack(Vec3, 32);
var vec4_stack = new Stack(Vec4, 32);

function set_vec3(v, x,y,z)
{
	v[0] = x; v[1] = y; v[2] = z || 0;
}
function set_vec4(v, x,y,z,w)
{
	v[0] = x; v[1] = y; v[2] = z; v[3] = w;
}

function _Vec3(x,y,z)
{
	var r = vec3_stack.get();
	set_vec3(r, x || 0, y || 0, z || 0);
	return r;
}
function _Vec4(x,y,z,w)
{
	var r = vec4_stack.get();
	set_vec4(r, x || 0, y || 0, z || 0, w || 1);
	return r;
}

function vec_approx_equal(a,b)
{
	var n = a.length;
	for(var i = 0; i < n; ++i)
	{
		if(Math.abs(a[i] - b[i]) > EPSILON) return false;
	}
	return true;
}
function vec_add(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] + b[i];
}
function vec_add_f(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] + b;
}
function vec_sub(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] - b[i];	
}
function vec_sub_f(v,a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] - b;	
}
function vec_mul_f(v,a,f)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] * f;
}
function vec_div_f(v,a,f)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = a[i] / f;	
}
function vec_eq(a,b)
{
	var n = a.length;
	for(var i = 0; i < n; ++i) a[i] = b[i];	
}
function vec_inverse(v, a)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) v[i] = -a[i];	
}
function vec_sqr_length(v)
{
	var r = 0;
	var n = v.length;
	for(var i = 0; i < n; ++i) r += v[i] * v[i];	
	return r;
}
function vec_length(v) 
{
	return Math.sqrt(vec_sqr_length(v));
}
function vec_distance(a, b)
{
	return Math.sqrt(vec_sqr_distance(a,b));
}
function vec_sqr_distance(a, b)
{
	var r = 0;
	var n = a.length;
	for(var i = 0; i < n; ++i)
	{
		var d = b[i] - a[i];
		r += d * d;
	}	
	return r;
}
function vec_normalized(r, v)
{
	var n = v.length;
	var l = vec_sqr_length(v);
	if(l > EPSILON)
	{
		l = Math.sqrt(1 / l);
		for(var i = 0; i < n; ++i) r[i] = v[i] * l;
	}
	else vec_eq(r,v);
}
function vec_dot(a,b)
{
	var r = 0;
	var n = a.length;
	for(var i = 0; i < n; ++i) r += a[i] * b[i];
	return r;
}
function vec_perp(r, a)
{
	var x = -a[1];
	var y = a[0];
	r[0] = x; r[1] = y;
	vec_normalized(r,r);
}
function vec_angle_2D(v)
{
	return Math.atan2(v[1], v[0]);
}
function vec_min(r, a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) r[i] = Math.min(a[i], b[i]);
}
function vec_max(r, a,b)
{
	var n = v.length;
	for(var i = 0; i < n; ++i) r[i] = Math.max(a[i], b[i]);
}

function vec_lerp(r, a,b, t)
{
	var it = 1-t;
	var n = v.length;
	for(var i = 0; i < n; ++i) r[i] = it * a[i] + t * b[i];
}
function vec_clamp(r, min,max)
{
	var n = r.length;
	for(var i = 0; i < n; ++i)
	{
		if(r[i] < min[i]) r[i] = min[i];
		if(r[i] > max[i]) r[i] = max[i];
	}
}
function vec_clamp_f(r, min, max)
{
	var n = r.length;
	for(var i = 0; i < n; ++i)
	{
		if(r[i] < min) r[i] = min;
		if(r[i] > max) r[i] = max;
	}
}
function vec_reflect(r, a,n)
{
	vec_add(r, v,n);
	vec_mulf(r, -2.0 * vec_dot(v,n)); 
}
function vec_cross(r, a,b)
{
	var x = a[1] * b[2] - a[2] * b[1];
	var y = a[2] * b[0] - a[0] * b[2];
	var z = a[0] * b[1] - a[1] * b[0];
	set_vec3(r, x,y,z);
}
function vec_project(r, a,b)
{
	vec_mul_f(r, a, vec_dot(a,b));
	var sqr_l = vec_sqr_length(r);
	if(sqr_l < 1)
	{
		vec_div_f(r, Math.sqrt(sqr_l));
	}
}
function vec_tangent(r, a,b, plane)
{
	var t = _Vec3();
	vec_add(t, b,a);
	vec_normalized(t,t);
	vec_cross(r, t,plane);
}
function vec_rotate(r, v,q)
{
	var tx = (q[1] * v[2] - q[2] * v[1]) * 2;
	var ty = (q[2] * v[0] - q[0] * v[2]) * 2;
	var tz = (q[0] * v[1] - q[1] * v[0]) * 2;

	var cx = q[1] * tz - q[2] * ty;
	var cy = q[2] * tx - q[0] * tz;
	var cz = q[0] * ty - q[1] * tx;

	r[0] = v[0] + q[2] * tx + cx;
	r[1] = v[1] + q[2] * ty + cy;
	r[2] = v[2] + q[2] * tz + cz;
}

function vec_rotate_2D(r, v,a)
{
	var rad = a * DEG2RAD;
	var cr = Math.cos(rad);
	var sr = Math.sin(rad;)
	r[0] = v[0] * cr - v[1] * sr;
    r[1] = v[0] * sr + v[1] * cr;
}

function vec_lerp(r, a,b,t)
{
	var n = r.length;
	var it = 1-t;
	for(var i = 0; i < n; ++i) r[i] = it * a[i] + t * b[i];
}
function vec_to_string(v, digits)
{
	var str = '[';
	var n = v.length;
	for(var i = 0; i < n-1; ++i)
		str += Math.round_to(v[i], digits) + ', '
	str += Math.round_to(v[n-1], digits);
	str += ']';
	return str;
}