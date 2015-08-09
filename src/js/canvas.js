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
	_dash_vals:[5,5],

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
		gb.canvas.set_context(c);
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
		//ctx.restore();
	},

	blend_alpha: function(a)
	{
		gb.canvas.ctx.globalAlpha = a;
	},
	blend_mode: function(m)
	{
		gb.canvas.ctx.globalCompositeOperation = m;
	},

	rect: function(x,y,w,h)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(x+w, y);
		ctx.lineTo(x+w, y+h);
		ctx.lineTo(x, y+h);
		ctx.lineTo(x, y);
		return gb.canvas;
	},
	rect_t: function(r)
	{
		return gb.canvas.rect(r.x, r.y, r.width, r.height);
	},

	box: function(x,y,w,h)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		var hw = w / 2;
		var hh = h / 2;
		ctx.moveTo(x-hw, y-hh);
		ctx.lineTo(x-hw, y+hh);
		ctx.lineTo(x+hw, y+hh);
		ctx.lineTo(x+hw, y-hh);
		return gb.canvas;
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

	begin_path: function(x,y)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(x, y);
		return gb.canvas;
	},
	add_vertex: function(x,y)
	{
		gb.canvas.ctx.lineTo(x,y);
	},
	end_path: function()
	{
		gb.canvas.ctx.closePath();
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
		gb.canvas.line(x - length, y, x + length, y).stroke();
		gb.canvas.line(x, y - length, x, y + length).stroke();
		return gb.canvas;
	},
	point_t: function(p, length)
	{
		return gb.canvas.point(p[0], p[1], length);
	},
	
	arc: function(x,y, radius, start, end, cw)
	{
		gb.canvas.ctx.beginPath();
		gb.canvas.ctx.arc(x, y, radius, start * gb.math.DEG2RAD, end * gb.math.DEG2RAD, cw);
		return gb.canvas;
	},
	arc_t: function(pos, radius, start, end, cw)
	{
		return gb.canvas.arc(pos[0], pos[1], radius, start, end, cw);
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
		return gb.canvas;
	},


	bezier_t: function(b)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(b.a[0], b.a[1]);
		ctx.bezierCurveTo(b.b[0],b.b[1],b.c[0],b.c[1],b.d[0],b.d[1]);
		return gb.canvas;
	},

	quadratic_t: function(a,b, cp)
	{
		var ctx = gb.canvas.ctx;
		ctx.beginPath();
		ctx.moveTo(a[0], a[1]);
		ctx.quadraticCurveTo(cp[0], cp[1], b[0], b[1]);
		return gb.canvas;
	},
	curve_through_points: function(points)
	{
		var ctx = gb.canvas.ctx;
		var n = points.length;
		ctx.beginPath();
		ctx.moveTo(points[0], points[1]);
		for(var i = 0; i < n; i+=2)
		{
		    ctx.quadraticCurveTo(points[i], points[i-1]);
		}
		return gb.canvas;
	},

	font: function(family, size)
	{
		gb.canvas.ctx.font = size + "px " + family;
	},
	text: function(t, x,y)
	{
		gb.canvas.ctx.fillText(t, x,y);
	},

	fill_col: function(s)
	{
		gb.canvas.ctx.fillStyle = s;
	},
	fill_rgb: function(r,g,b,a)
	{
		gb.canvas.ctx.fillStyle = gb.canvas.rgba(r,g,b,a);
	},
	fill_t: function(c)
	{
		gb.canvas.ctx.fillStyle = gb.canvas.rgba(c[0], c[1], c[2], c[3]);
	},
	fill: function()
	{
		gb.canvas.ctx.fill();
	},

	stroke_s: function(s)
	{
		gb.canvas.ctx.strokeStyle = s;
	},
	stroke_t: function(c)
	{
		gb.canvas.ctx.strokeStyle = gb.canvas.rgba(c[0], c[1], c[2], c[3]);
	},
	stroke_rgb: function(r,g,b,a)
	{
		gb.canvas.ctx.strokeStyle = gb.canvas.rgba(r,g,b,a);
	},
	stroke_width: function(t)
	{
		gb.canvas.ctx.lineWidth = t;
	},
	join: function(j)
	{
		gb.canvas.ctx.lineJoin = j;
		return gb.canvas;
	},
	cap: function(c)
	{
		gb.canvas.ctx.lineCap = c;
		return gb.canvas;
	},
	dash: function(line, gap)
	{
		var _t = gb.canvas;
		_t._dash_vals[0] = line;
		_t._dash_vals[1] = gap;
		_t.ctx.setLineDash(_t._dash_vals);
		return _t;
	},
	stroke: function()
	{
		gb.canvas.ctx.stroke();
	},

	clear_rgb: function(r,g,b,a)
	{
		gb.canvas.element.style.background = gb.canvas.rgba(r,g,b,a);
	},
	clear_t: function(c)
	{
		gb.canvas.element.style.background = gb.canvas.rgba(c[0], c[1], c[2], c[3]);
	},
	clear_s: function(s)
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

	screen_shot: function(path, callback)
	{
		var img = gb.canvas.ctx.toDataURL('png');
		gb.ajax.save_file(path, 'text', data, callback);
	},
}