//INCLUDE gb.js
//DEBUG
//INCLUDE debug.js
//END
//INCLUDE dom.js
//INCLUDE stack.js
//INCLUDE math.js
//INCLUDE vector.js
//INCLUDE quaternion.js
//INCLUDE rect.js
//INCLUDE bezier.js
//INCLUDE color.js
//INCLUDE time.js
//INCLUDE canvas.js
//DEBUG
//INCLUDE gl_draw.js
//END
//INCLUDE input.js
//INCLUDE random.js
//INCLUDE animate.js

var focus = true;

gb.init = init;
gb.update = update;

var v2 = gb.vec2;
var v3 = gb.vec3;
var rand = gb.random;
var draw = gb.canvas;
var input = gb.input;
var time = 1;

var Trace = function()
{
	this.x;
	this.y;
	this.dx;
	this.dy;
	this.cx;
	this.cy;
	this.r;
	this.t;
	this.col;
}
var traces = [];

function init()
{
	var k = gb.Keys;
	gb.input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.one, k.two, k.three, k.up, k.down, k.left, k.right],
	});
	var c = draw.new(gb.dom.find('.container'));

	draw.clear_rgb(0.2,0.2,0.22,1);
	//var r = rand.float(0.12, 0.2);
	//var g = rand.float(0.12, 0.8);
	//var b = rand.float(0.95, 1.0);
	//draw.clear_rgb(r,g,b,1);
	//draw.blend_alpha();
	draw.blend_mode("screen");
	//draw.blend_mode("overlay");
	//draw.blend_mode("multiply");

	new_trace(0.2,0.4,0.95,1);
	new_trace(0.2,0.5,0.95,1);
	new_trace(0.3,0.6,1,1);
	new_trace(0.1,0.2,1,1);

	new_trace(0.2,0.4,0.95,1);
	new_trace(0.2,0.5,0.95,1);
	new_trace(0.3,0.6,1,1);
	new_trace(0.1,0.2,1,1);

	new_trace(0.2,0.4,0.95,1);
	new_trace(0.2,0.5,0.95,1);
	new_trace(0.3,0.6,1,1);
	new_trace(0.1,0.2,1,1);
}

function update(t)
{
	var dt = gb.time.dt;
	var ctx = gb.canvas.ctx;
	var view = gb.canvas.view;

	var m_pos = input.mouse_position;
	var m_held = input.held(gb.Keys.mouse_left);
	var m_up = input.up(gb.Keys.mouse_left);
	var m_delta = input.mouse_delta;

	//draw.clear();

	if(input.held(gb.Keys.left))
	{
		gb.time.scale -= 0.1;
	}
	else if(input.held(gb.Keys.left))
	{
		gb.time.scale += 0.1;
	}
	gb.time.scale = gb.math.clamp(gb.time.scale, 0,4);

	//draw.text("Time: " + gb.time.scale, 30, 30);

	var w = view.width;
	var h = view.height;
	var n = traces.length;
	for(var i = 0; i < n; ++i)
	{	
		draw_trace(traces[i], 10, dt);
	}
}

function new_trace(r,g,b,a)
{
	var t = new Trace();
	t.x = rand.float(0, gb.canvas.view.width);
	t.y = rand.float(0, gb.canvas.view.height);
	t.cx = t.x;
	t.cy = t.y;
	t.dx = 0.707;
	t.dy = 0.707;
	t.r = rand.float(50,200);
	t.t = rand.float(0,1);
	t.col = gb.color.new(r,g,b,a);
	traces.push(t);
	return t;
}

function draw_trace(l, n, dt)
{
	l.t -= dt;
	if(l.t < 0) l.t += 0.707;
	draw.blend_alpha(0.5);

	var w = gb.canvas.view.width;
	var h = gb.canvas.view.height;

	for(var i = 0; i < n; ++i)
	{	
		var dir_change = rand.int(0,3);
		if(dir_change !== 0)
		{
			var dir = rand.int(0,3);
			if(dir === 0)
			{
				l.dx = 0.707;
				l.dy = 0.707;
			}
			else if(dir === 1)
			{
				l.dx = -0.707;
				l.dy = 0.707;
			}
			else if(dir === 2)
			{
				l.dx = 0.707;
				l.dy = -0.707;
			}
			else
			{
				l.dx = -0.707;
				l.dy = -0.707;
			}
		}
		var len = rand.float(1,20);
		var ax = l.x + (l.dx * len);
		var ay = l.y + (l.dy * len);

		var dx = ax - l.cx;
		var dy = ay - l.cy;
		var dist = dx * dx + dy * dy;
		if(dist > l.r * l.r)
		{
			l.dx = -l.dx;
			l.dy = -l.dy;
			ax = l.x + (l.dx * len);
			ay = l.y + (l.dy * len);
		}

		if(ax < 0 || ax > w) 
		{
			l.dx = -l.dx;
			ax = l.x + l.dx * len;
		}
		if(ay < 0 || ay > h)
		{
			l.dy = -l.dy;
			ay = l.y + l.dy * len;
		}

		/*
		var r = l.dx / 2 + 0.5;
		var g = l.dy / 2 + 0.5;
		var b = l.t / 2 + 0.5;
		draw.stroke_rgb(r,g,b,1);
		*/
		draw.stroke_t(l.col);
		draw.line(l.x, l.y, ax, ay).stroke(); 

		l.x = ax;
		l.y = ay;
	}
}

