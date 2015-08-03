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
var curve_x;
var curve_y;


var Trace = function()
{
	this.x;
	this.y;
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

	curve_x = gb.bezier.free(0,1, 0.33,0.25, 0.66,0.1, 1,0.1);
	curve_y = gb.bezier.free(0,0.7, 0.33,0.25, 0.66,0.1, 1,0.1);

	new_trace(0.2,0.4,0.95,1);
	//new_trace(0.1,0.4,0.95,1);
	//new_trace(0.2,0.45,0.2,1);
	//new_trace(0.2,0.8,0.95,1);


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

	var w = view.width;
	var h = view.height;
	var n = traces.length;
	for(var i = 0; i < n; ++i)
	{	
		draw_trace(traces[i], 2, dt);
	}
}

function new_trace(r,g,b,a)
{
	var t = new Trace();
	t.x = new Float32Array(4);
	t.y = new Float32Array(4);
	t.x[0] = rand.float(gb.canvas.view.width * 0.25, gb.canvas.view.width * 0.75);
	t.y[0] = rand.float(gb.canvas.view.width * 0.25, gb.canvas.view.height * 0.75);
	t.x[3] = t.x[0];
	t.y[3] = t.y[0]
	t.r = rand.float(50,1000);
	t.t = rand.float(0,1);
	t.col = gb.color.new(r,g,b,a);
	traces.push(t);
	return t;
}

function draw_trace(l, n, dt)
{
	l.t -= dt;
	if(l.t < 0) l.t += 0.707;
	draw.blend_alpha(rand.float(0,1));

	draw.stroke_t(l.col);

	var w = gb.canvas.view.width;
	var h = gb.canvas.view.height;

	var pos = gb.vec2.tmp();
	for(var i = 1; i < 3; ++i)
	{	
		var x = rand.float(-1,1);
		var y = rand.float(-1,1);
		var len = 1 / gb.math.sqrt(x * x + y * y);
		x *= len;
		y *= len;

		var rad_x = gb.bezier.eval_f(curve_x, rand.float(0,1));
		var rad_y = gb.bezier.eval_f(curve_x, rand.float(0,1));
		//var rad_x = 1;
		//var rad_y = 1;

		x *= l.r * rad_x;
		y *= l.r * rad_y;
		x += l.x[0];
		y += l.y[0];

		l.x[i] = x;
		l.y[i] = y;		
	}

	/*
	for(var i = 0; i < 3; ++i)
	{
		draw.line(l.x[i], l.y[i], l.x[i+1], l.y[i+1]).stroke();
	}
	*/
	var ctx = gb.canvas.ctx;
	ctx.beginPath();
	ctx.moveTo(l.x[0], l.y[0]);
	ctx.bezierCurveTo(l.x[1],l.y[1],l.x[2],l.x[2],l.x[3],l.y[3]);
	draw.stroke();
}

