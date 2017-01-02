function Curve(dimension, data)
{
	var r = {};
	r.data = data;
	r.dimension = dimension;
	r.stride = dimension * 3;
	return r;
}

function eval_time_curve(r, curve, t)
{
	var n = curve.dimension;
	var d = curve.data;
	var len = d.length;

	var t_start = d[n];
	var t_end = d[len-(n*2)];

	if(t < t_start) t = t_start;
	else if(t > t_end) t = t_end;

	//LOG(t_start);
	//LOG(t_end);

	for(var i = 0; i < len;)
	{
		var t_start = d[i+n];
		var t_end = d[i+(n*4)];
		if(t >= t_start && t <= t_end)
		{
			t = (t - t_start) / (t_end - t_start); 
			eval_curve(r, curve, t, i+n);
			return;
		}
		i += curve.stride;
	}
}

function eval_curve(r, curve, t, offset)
{
	var tt = t * t;
	var ttt = tt * t;

	var u = 1.0 - t;
	var uu = u * u;
	var uuu = uu * u;

	var n = curve.dimension;
	var d = curve.data;

	for(var i = 0; i < n; ++i)
	{
		var o = i + offset;
		r[i] = uuu * d[o] +
		   	   3 * uu * t * d[o+(n*1)] + 
		   	   3 * tt * u * d[o+(n*2)] + 
		   	   ttt * d[o+(n*3)];
	}
}

function eval_curve_f(curve, t)
{
	var r = _Vec3();
	eval_curve(r, curve, t, 0);
	vec3_stack.index--;
	return r[1];
}

function read_curve()
{
    var is_2d = read_boolean(br);
    var num_points = read_i32();
    var points;
    if(is_2d === true) points = read_f32(num_points * 6);
    else points = read_f32(num_points * 9);
    return points;
}