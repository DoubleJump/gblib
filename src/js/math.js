var E = 2.71828182845904523536028747135266250;
var PI = 3.1415926535897932;
var TAU = 6.28318530718;
var DEG2RAD = 0.01745329251;
var RAD2DEG = 57.2957795;
var PI_OVER_360 = 0.00872664625;
var PI_OVER_TWO = PI / 2;
var PI_OVER_FOUR = PI / 4;
var TWO_PI = 2 * PI;
var FOUR_PI = 4 * PI;
var EPSILON = 2.2204460492503131e-16;


function radians(v)
{
	return v * DEG2RAD;
}

function degrees(v)
{
	return v * RAD2DEG;
}

function min(a, b)
{
	if(a < b) return a; return b;
}

function max (a, b)
{
	if(a > b) return a; return b;
}

function round_to(a, f)
{
	return a.toFixed(f);
}

function clamp(a, min, max)
{
	if(a < min) return min;
	else if(a > max) return max;
	else return a;
}

function lerp(a,b,t)
{
	return (1-t) * a + t * b;
}

function distance(ax, ay, bx, by)
{
	var dx = bx - ax;
	var dy = by - ay;
	return Math.sqrt((dx * dx) + (dy * dy));
}

function angle(x,y)
{
	return Math.atan2(y,x) * RAD2DEG + 180;
}

function snap_angle(angle, target)
{
	return Math.floor((angle % 360 + target / 2) / target) * target;
}

function sigmoid(input, t)
{
	return 1 / (1 + Math.exp(-input + t));
}

function smoothstep(min, max, val) 
{
	var x = Math.max(0, Math.min(1, (val-min) / (max-min)));
	return x * x * (3 - 2 * x);
}
/*
function compare_normal(N, R, rotation) 
{ 
	var index = vec3_stack.index;

    var rN = _Vec3();
    quat_mul_vec(rN, rotation, N);
    var result = vec_dot(rN, R) * RAD2DEG;

    vec3_stack.index = index;
    return result;
}
*/
function move_towards(val, target, rate)
{
	var result = val;
	if(target > val)
	{
		result += rate;
		if(result > target) return target;
	}
	else 
	{
		result -= rate;
		if(result < target) return target;
	}
	return result;
}

function smooth_float_towards(val, target, rate, epsilon)
{
	var E = epsilon || 0.0001;
	var result = val;
	var delta = (target - val);
	delta = clamp(delta, -rate, rate);
	if(Math.abs(delta) < E) return target;
	result += delta * rate;
	return result;
}

function smooth_angle_towards(val, target, rate, epsilon)
{
	var E = epsilon || 0.0001;

	var delta = (target - val);
	if(Math.abs(delta) > 0.5)
	{
		if(target < val) target += 1;
		else val += 1;
	}
	delta = (target - val);
	
	var result = val;
	delta = clamp(delta, -rate, rate);
	if(Math.abs(delta) < E) return target;
	result += delta * rate;
	return result;
	//return wrap_value(result, 0,1);
}

function smooth_vec_towards(val, target, rate, epsilon)
{
	var n = val.length;
	for(var i = 0; i < n; ++i)
	{
		val[i] = smooth_float_towards(val[i], target[i], rate, epsilon);
	}
}

function lazy_ease(now, end, speed) 
{
	return now + (end - now) / speed;
}

function wrap_value(value, min, max)
{
	if(value > max) return value - max;
	if(value < min) return value + max;
	return value;
}
function wrap_angle(value)
{
	return wrap_value(value, 0,360);
}
function wrap_normal(value)
{
	return wrap_value(value, 0,1);
}

function wave_t(t)
{
	// 1 -> -1 -> 1 over 1 second
	return Math.sin(t) / TAU;
}

function pulse_t(t)
{
	// 1 -> 0 -> 1 over 1 second
	return ((Math.sin(t) / TAU) + 1.0) * 0.5;
}