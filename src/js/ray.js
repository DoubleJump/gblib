gb.Ray = function(point, dir)
{
	this.point = new gb.Vec3();
	this.dir = new gb.Vec3();
}
gb.Ray.prototype.set = function(point, dir)
{
	this.point.eq(point); 
	this.dir.eq(dir);
}
gb.ray = 
{
	stack: new gb.Stack(gb.Ray, 5),

	tmp: function(point, ray)
	{
		var v = gb.ray.stack.get();
		gb.ray.set(v, point,ray);
		return v;
	},
	set: function(r, point, ray)
	{
		gb.vec3.eq(r.point, point);
		gb.vec3.eq(r.ray, ray);
	},
	eq: function(a,b)
	{
		gb.ray.set(a, b.point, b.dir);
	},
}