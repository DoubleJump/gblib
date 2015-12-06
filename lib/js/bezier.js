gb.Bezier = function()
{
	this.a = gb.vec3.new(0,0,0);
	this.b = gb.vec3.new(0,0,0);
	this.c = gb.vec3.new(0,0,0);
	this.d = gb.vec3.new(0,0,0);
}
gb.bezier = 
{
	stack: new gb.Stack(gb.Bezier, 5),

	new: function()
	{
		return new gb.Bezier();
	},
	free: function(ax,ay, bx,by, cx,cy, dx,dy)
	{
		var curve = new gb.Bezier();
		curve.a[0] = ax;
		curve.a[1] = ay;
		curve.b[0] = bx;
		curve.b[1] = by;
		curve.c[0] = cx;
		curve.c[1] = cy;
		curve.d[0] = dx;
		curve.d[1] = dy;
		return curve;
	},
	clamped: function(a,b,c,d)
	{
		var curve = new gb.Bezier();
		curve.b[0] = a;
		curve.b[1] = b;
		curve.c[0] = c;
		curve.c[1] = d;
		curve.d[0] = 1;
		curve.d[1] = 1;
		return curve;
	},
	tmp: function()
	{
		var _t = gb.bezier;
		var r = gb.stack.get(_t.stack);
		return r;
	},
	eval: function(r, b, t)
	{
		var u = 1.0 - t;
		var tt = t * t;
		var uu = u * u;
		var uuu = uu * u;
		var ttt = tt * t;

		for(var i = 0; i < 3; ++i)
			r[i] = (uuu * b.a[i]) + 
				   (3 * uu * t * b.b[i]) + 
				   (3 * u * tt * b.c[i]) + 
				   (ttt * b.d[i]);
	},
	eval_f: function(b, t)
	{
		var u = 1.0 - t;
		var tt = t * t;
		var uu = u * u;
		var uuu = uu * u;
		var ttt = tt * t;

		return (uuu * b.a[1]) + 
			   (3 * uu * t * b.b[1]) + 
			   (3 * u * tt * b.c[1]) + 
			   (ttt * b.d[1]);
	}
}