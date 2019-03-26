function rand_int(min, max)
{
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function rand_sign()
{
	var sign = rand_int(0,1);
	if(sign === 0) return -1.0;
	return 1.0;
}

function rand_float(min, max)
{
	return Math.random() * (max - min) + min;
}

function rand_float_fuzzy(f, fuzz)
{
	return rand_float(f-fuzz, f+fuzz);
}

function rand_vec(r, min, max)
{
	var n = r.length;
	for(var i = 0; i < n; ++i) r[i] = Math.random() * (max - min) + min;
}

function unit_circle(r, radius)
{
	var x = rand_float(-1,1);
	var y = rand_float(-1,1);
	var l = 1 / Math.sqrt(x * x + y * y);
	r[0] = (x * l) * radius;
	r[1] = (y * l) * radius;
}

function unit_sphere(r, radius)
{
	var x = rand_float(-1,1);
	var y = rand_float(-1,1);
	var z = rand_float(-1,1);
	var l = 1 / Math.sqrt(x * x + y * y + z * z);
	r[0] = (x * l) * radius;
	r[1] = (y * l) * radius;
	r[2] = (z * l) * radius;
}

function random_from_object(obj, min, max)
{
	var keys = Object.keys(obj);
	min = min || 0;
	max = max || keys.length-1;
	var index = rand_int(min, max);
	var k = keys[index];
	return obj[k];
}