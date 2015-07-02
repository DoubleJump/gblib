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
    canvas.width = width;
    canvas.height = height;
	c.view = new gb.Rect(0,0,width,height);
	c.ctx = canvas.getContext('2d');
	return c;
}

gb.canvas = 
{
	ctx: null,
	view: null,

	set_context: function(canvas)
	{
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

	fill: function(color)
	{
		var ctx = gb.canvas.ctx;
		ctx.fillStyle = color;
		ctx.fill();
	},

	stroke: function(color, thickness)
	{
		var ctx = gb.canvas.ctx;
		ctx.lineWidth = thickness;
		ctx.strokeStyle = color;
		ctx.stroke();
	},

	rect: function(r, color)
	{
		var ctx = gb.canvas.ctx;
		ctx.fillStyle = color;
		ctx.fillRect(r.x, r.y, r.width, r.height);
	},
	rectf: function(x,y,w,h, color)
	{
		var ctx = gb.canvas.ctx;
		ctx.fillStyle = color;
		ctx.fillRect(x, y, w, h);	
	},
	line: function(start, end, width, color)
	{
		var ctx = gb.canvas.ctx;
		ctx.fillStyle = color;
		ctx.moveTo(start[0], start[1]);
		ctx.lineTo(end[0], end[1]);
	},
	polygon: function(points)
	{
		var ctx = gb.canvas.ctx;
		var n = points.length;
		var p = points[0];
		ctx.beginPath();
		ctx.moveTo(p[0], p[1]);
		for(var i = 1; i < n; ++i)
		{
			p = points[i];
		    ctx.lineTo(p[0], p[1]);
		}
	},
	circle: function(pos, radius)
	{
		gb.canvas.ctx.arc(pos[0], pos[1], radius, 0, 360 * gb.math.DEG2RAD, true);
	},
	arc: function(pos, radius, start, end, cw)
	{
		gb.canvas.ctx.arc(pos[0], pos[1], radius, start * gb.math.DEG2RAD, end * gb.math.RAD2DEG, cw);
	},
	curve: function()
	{

	},
	rounded_rect: function(r, radius)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(r.x, r.y + radius);
		ctx.lineTo(r.x, r.y + r.height-radius);
		ctx.quadraticCurveTo(r.x, r.y + r.height, r.x + radius, r.y + r.height);
		ctx.lineTo(r.x + r.width - radius, r.y + r.height);
		ctx.quadraticCurveTo(r.x + r.width, r.y + r.height, r.x + r.width, r.y + r.height - radius);
		ctx.lineTo(r.x + r.width, r.y + radius);
		ctx.quadraticCurveTo(r.x + r.width, r.y, r.x + r.width-radius, r.y);
		ctx.lineTo(r.x + radius, r.y);
		ctx.quadraticCurveTo(r.x, r.y, r.x, r.y + radius);
	},
}