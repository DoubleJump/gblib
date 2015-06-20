gb.Color = function(r,g,b,a)
{
	var v = new Float32Array(4);
	v[0] = r;
	v[1] = g;
	v[2] = b;
	v[3] = a;
	return v;
}

gb.color = 
{
	stack: new gb.Stack(gb.Color, 10),

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
}