gb.random = 
{
	int: function(min, max)
	{
    	return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	sign: function()
	{
		var sign = gb.random.int(0,1);
		if(sign === 0) return -1.0;
		return 1.0;
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
	fill: function(r, min, max)
	{
		var n = r.length;
		for(var i = 0; i < n; ++i)
			r[i] = Math.random() * (max - min) + min;
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