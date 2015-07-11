gb.Ray = function()
{
	this.point = gb.vec3.new();
	this.dir = gb.vec3.new();
}
gb.ray = 
{
	stack: new gb.Stack(gb.Ray, 5),

	new: function()
	{
		return new gb.Ray();
	},
	tmp: function(point, dir)
	{
		var r = gb.stack.get(gb.ray.stack);
		gb.ray.set(v, point,dir);
		return v;
	},
	set: function(r, point, dir)
	{
		gb.vec3.eq(r.point, point);
		gb.vec3.eq(r.dir, dir);
	},
	eq: function(a,b)
	{
		gb.ray.set(a, b.point, b.dir);
	},
}