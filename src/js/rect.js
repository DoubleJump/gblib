gb.Rect = function(x,y,w,h)
{
	this.x = x || 0;
	this.y = y || 0;
	this.width = w || 0;
	this.height = h || 0;
}
gb.rect = 
{
	stack: new gb.Stack(gb.Rect, 20),

	set: function(r, x,y,w,h)
	{
		r.x = x;
		r.y = y;
		r.width = w;
		r.height = h;
	},
	eq: function(a,b)
	{
		a.x = b.x;
		a.y = b.y;
		a.width = b.width;
		a.height = b.height;
	},
	tmp: function(x,y,w,h)
	{
		var r = gb.rect.stack.get();
		gb.rect.set(r, x || 0, y || 0, w || 0, h || 0);
		return r;
	},
}