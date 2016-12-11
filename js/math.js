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

function compare_normal(N, R, rotation) 
{ 
	var index = vec3_stack.index;

    var rN = _Vec3();
    quat_mul_vec(rN, rotation, N);
    var result = vec_dot(rN, R) * RAD2DEG;

    vec3_stack.index = index;
    return result;
}
