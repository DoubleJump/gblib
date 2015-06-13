gb.Canvas2D = function()
{
	this.view = null;
	this.ctx = null;
}
gb.new_canvas = function(container, config)
{
	var c = new gb.Canvas2D();
    var canvas = gb.dom.insert('canvas', container);
	var width = container.offsetWidth;
    var height = container.offsetHeight;
	c.view = new gb.Rect(0,0,width,height);
	c.ctx = canvas.getContext('2d');
	return c;
}

gb.canvas = 
{
	ctx: null,

	set_context: function(canvas)
	{
		this.ctx = canvas.ctx;
	},

	clear: function(color)
	{

	},

	fill: function(color)
	{
		this.ctx.fillStyle = color;
		this.ctx.fill();
	},

	stroke: function(color, thickness)
	{
		this.ctx.lineWidth = thickness;
		this.ctx.strokeStyle = color;
		this.ctx.stroke();
	},

	rect: function(r, color)
	{
		this.ctx.fillStyle = color;
		this.ctx.fillRect(r.x, r.y, r.width, r.height);
	},
	line: function(start, end, width, color)
	{
		this.ctx.fillStyle = color;
		this.ctx.moveTo(start.x, start.y);
		this.ctx.lineTo(end.x, end.y);
	},
	polygon: function(points)
	{
		var n = points.length;
		var p = points[0];
		this.ctx.beginPath();
		this.ctx.moveTo(p.x, p.y);
		for(var i = 1; i < n; ++i)
		{
			p = points[i];
		    this.ctx.lineTo(p.x, p.y);
		}
	},
	circle: function(pos, radius)
	{
		this.ctx.arc(pos.x, pos.y, radius, 0, 360 * gb.math.DEG2RAD, true);
	},
	arc: function(pos, radius, start, end, cw)
	{
		this.ctx.arc(pos.x, pos.y, radius, start * gb.math.DEG2RAD, end * gb.math.RAD2DEG, cw);
	},
	curve: function()
	{

	},
	rounded_rect: function(r, radius)
	{
		this.ctx.beginPath();
		this.ctx.moveTo(r.x, r.y + radius);
		this.ctx.lineTo(r.x, r.y + r.height-radius);
		this.ctx.quadraticCurveTo(r.x, r.y + r.height, r.x + radius, r.y + r.height);
		this.ctx.lineTo(r.x + r.width - radius, r.y + r.height);
		this.ctx.quadraticCurveTo(r.x + r.width, r.y + r.height, r.x + r.width, r.y + r.height - radius);
		this.ctx.lineTo(r.x + r.width, r.y + radius);
		this.ctx.quadraticCurveTo(r.x + r.width, r.y, r.x + r.width-radius, r.y);
		this.ctx.lineTo(r.x + radius, r.y);
		this.ctx.quadraticCurveTo(r.x, r.y, r.x, r.y + radius);
	},
}