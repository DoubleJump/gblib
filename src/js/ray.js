gb.Ray = function()
{
	this.point = new gb.Vec3();
	this.dir = new gb.Vec3();
}
gb.ray = 
{
	stack: new gb.Stack(gb.Ray, 5),

	tmp: function(point, dir)
	{
		var v = gb.ray.stack.get();
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