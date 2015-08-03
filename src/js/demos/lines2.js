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
var px;
var py;

var Trace = function()
{
	this.x;
	this.y;
	this.t;
	this.c_min;
	this.c_max;
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
	//draw.blend_mode("screen");
	//draw.blend_mode("overlay");
	draw.blend_mode("multiply");

	new_trace(0.12,0.12,0.95,1);
	new_trace(0.95,0.12,0.12,1);
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
		draw_trace(traces[i], 50, dt);
	}
}

function new_trace(r,g,b,a)
{
	var t = new Trace();
	t.x = rand.float(0, gb.canvas.view.width);
	t.y = rand.float(0, gb.canvas.view.height);
	t.t = rand.float(0,1);
	t.c_min = gb.color.new(0,0,0,0);
	t.c_min[0] = gb.math.clamp(rand.float_fuzzy(r, 0.2), 0, 1);
	t.c_min[1] = gb.math.clamp(rand.float_fuzzy(r, 0.2), 0, 1);
	t.c_min[2] = gb.math.clamp(rand.float_fuzzy(r, 0.2), 0, 1);
	t.c_min[3] = gb.math.clamp(rand.float_fuzzy(r, 0.2), 0, 1);

	t.c_max = gb.color.new(0,0,0,0);
	t.c_max[0] = gb.math.clamp(rand.float_fuzzy(1-r, 0.2), 0, 1);
	t.c_max[1] = gb.math.clamp(rand.float_fuzzy(1-r, 0.2), 0, 1);
	t.c_max[2] = gb.math.clamp(rand.float_fuzzy(1-r, 0.2), 0, 1);
	t.c_max[3] = gb.math.clamp(rand.float_fuzzy(1-r, 0.2), 0, 1);

	traces.push(t);
	return t;
}

function draw_trace(l, n, dt)
{
	l.t -= dt;
	if(l.t < 0) l.t += 1;
	draw.blend_alpha(l.t);

	var w = gb.canvas.view.width;
	var h = gb.canvas.view.height;

	for(var i = 0; i < n; ++i)
	{	
		var ax = 0;
		var ay = 0;

		ax = rand.float_fuzzy(l.x, rand.float(-10,1));
		ay = rand.float_fuzzy(l.y, rand.float(-10,1));

		if(ax < 0) ax = -ax;
		else if(ax > w) ax = w - (ax - w);

		if(ay < 0) ay = -ay;
		else if(ay > h) ay = h - (ay - h);

		/*
		var r = rand.float(l.c_min[0], l.c_max[0]);
		var g = rand.float(l.c_min[1], l.c_max[1]);
		var b = rand.float(l.c_min[2], l.c_max[2]);
		var a = rand.float(l.c_min[3], l.c_max[3]);
		*/

		var dx = ax - l.x;
		var dy = ay - l.y;
		var dist = 1 / gb.math.sqrt(dx * dx + dy * dy);


		var r = (dx * dist) / 2 + 0.5;
		var g = (dy * dist) / 2 + 0.5;
		var b = l.t / 2 + 0.5;
		var a = 1.0;

		var width = rand.float(1,2);

		draw.stroke_width(width);
		draw.stroke_rgb(r,g,b,a);
		draw.line(l.x,l.y,ax,ay).stroke();

		//draw.fill_rgb(r,g,b,a);
		//draw.circle(ax,ay,width).fill();

		l.x = ax;
		l.y = ay;
	}
}

