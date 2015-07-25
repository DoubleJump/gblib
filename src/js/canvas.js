gb.Canvas2D = function()
{
	this.element = null;
	this.view = null;
	this.ctx = null;
}

gb.canvas = 
{
	element: null,
	ctx: null,
	view: null,

	new: function(container, config)
	{
		var c = new gb.Canvas2D();
	    var canvas = gb.dom.insert('canvas', container);
		var width = container.offsetWidth;
	    var height = container.offsetHeight;
	    canvas.width = width;
	    canvas.height = height;
		c.view = new gb.rect.new(0,0,width,height);
		c.ctx = canvas.getContext('2d');
		c.element = canvas;
		return c;
	},

	set_context: function(canvas)
	{
		gb.canvas.element = canvas.element;
		gb.canvas.ctx = canvas.ctx;
		gb.canvas.view = canvas.view;
	},

	clear: function()
	{
		var ctx = gb.canvas.ctx;
		var v = gb.canvas.view;
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(v.x, v.y, v.width, v.height);
	},

	circle: function(x,y,r)
	{
		gb.canvas.ctx.beginPath();
		gb.canvas.ctx.arc(x, y, r, 0, 360 * gb.math.DEG2RAD, true);
		return gb.canvas;
	},
	circle_t: function(p,r)
	{
		return gb.canvas.circle(p[0], p[1], r);
	},

	line: function(a,b,x,y)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(a, b);
		ctx.lineTo(x, y);
		return gb.canvas;
	},
	line_t: function(a,b)
	{
		return gb.canvas.line(a[0], a[1], b[0], b[1]);
	},

	point: function(x,y, length)
	{
		gb.canvas.line(x - length, y, x + length, y);
		gb.canvas.stroke();
		gb.canvas.line(x, y - length, x, y + length);
		gb.canvas.stroke();
		return gb.canvas;
	},
	point_t: function(p, length)
	{
		return gb.canvas.point(p[0], p[1], length);
	},
	
	fill_col: function(s)
	{
		gb.canvas.ctx.fillStyle = s;
	},
	fill_rgb: function(r,g,b,a)
	{
		gb.canvas.ctx.fillStyle = gb.canvas.rgba(r,g,b,a);
	},
	fill_c: function(c)
	{
		gb.canvas.ctx.fillStyle = gb.canvas.rgba(c[0], c[1], c[2], c[3]);
	},
	fill: function()
	{
		gb.canvas.ctx.fill();
	},

	stroke_col: function(s)
	{
		gb.canvas.ctx.strokeStyle = s;
	},
	stroke_rgb: function(r,g,b,a)
	{
		gb.canvas.ctx.strokeStyle = gb.canvas.rgba(r,g,b,a);
	},
	stroke_width: function(t)
	{
		gb.canvas.ctx.lineWidth = t;
	},
	stroke: function()
	{
		gb.canvas.ctx.stroke();
	},

	clear_rgb: function(r,g,b,a)
	{
		gb.canvas.element.style.background = gb.canvas.rgba(r,g,b,a);
	},
	col: function(s)
	{
		gb.canvas.element.style.background = s;
	},

	// omfg, strings for colors - really?
	rgba: function(r,g,b,a)
	{
		var ir = gb.math.floor(r * 255);
		var ig = gb.math.floor(g * 255);
		var ib = gb.math.floor(b * 255);
		return "rgba(" + ir + "," + ig + "," + ib + "," + a + ")";
	},

}