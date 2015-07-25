gb.Color = function(r,g,b,a)
{
	return new Float32Array(4);
}

gb.color = 
{
	stack: new gb.Stack(gb.Color, 10),

	new: function(r,g,b,a)
	{
		var v = new gb.Color();
		gb.color.set(v, r,g,b,a);
		return v;
	},
	set: function(v, r,g,b,a)
	{
		v[0] = r;
		v[1] = g;
		v[2] = b;
		v[3] = a;
	},
	eq: function(a,b)
	{
		a[0] = b[0];
		a[1] = b[1];
		a[2] = b[2];
		a[3] = b[3];
	},
	tmp: function(r,g,b,a)
	{
		var c = gb.stack.get(gb.color.stack);
		gb.color.set(c, r || 0, g || 0, b || 0, a || 0);
		return c;
	},
	lerp: function(r, a,b, t)
	{
		var it = 1-t;
		r[0] = it * a[0] + t * b[0];
		r[1] = it * a[1] + t * b[1];
		r[2] = it * a[2] + t * b[2];
		r[3] = it * a[3] + t * b[3];
	},
}