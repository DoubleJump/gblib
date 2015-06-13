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
	vec3: function(min_x, max_x, min_y, max_y, min_z, max_z)
	{
		var x = Math.random() * (max_x - min_x) + min_x;
		var y = Math.random() * (max_y - min_x) + min_y;
		var z = Math.random() * (max_z - min_x) + min_z;
		return gb.vec3.tmp(x,y,z);
	},
	rotation: function(min_x, max_x, min_y, max_y, min_z, max_z)
	{
		var x = Math.random() * (max_x - min_x) + min_x;
		var y = Math.random() * (max_y - min_x) + min_y;
		var z = Math.random() * (max_z - min_x) + min_z;
		return gb.quat.euler(x,y,z);
	},
	color: function(min_r, max_r, min_g, max_g, min_b, max_b, min_a, max_a)
	{
		var r = Math.random() * (max_r - min_r) + min_r;
		var g = Math.random() * (max_g - min_g) + min_g;
		var b = Math.random() * (max_b - min_b) + min_b;
		var a = Math.random() * (max_a - min_a) + min_a;
		return gb.color.tmp(r,g,b,a);
	},
}