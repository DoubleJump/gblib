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
var math = gb.math;
var draw = gb.canvas;
var input = gb.input;
var view;
var colors = [];

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

	view = draw.view;

	colors.push(gb.color.new(0.1,0.2,0.8, 1.0));
	colors.push(gb.color.new(0.1,0.3,0.85, 1.0));
	colors.push(gb.color.new(0.1,0.6,0.89, 1.0));
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

	var ax = rand.float(0, view.width);
	var ay = rand.float(0, view.height);
	var bx = rand.float(0, view.width);
	var by = rand.float(0, view.height);

	if(ax > bx)
	{
		var tx = ax;
		bx = ax;
		ax = tx;
	}
	if(ay > by)
	{
		var ty = ay;
		by = ay;
		ay = ty;
	}

	var width = bx - ax;
	var height = by - ay;

	var box_x = ax + width / 2;
	var box_y = ay + height / 2;

	var box_rad = 0;
	if(width < height) box_rad = width / 2;
	else box_rad = height / 2;

	var vert_count = rand.int(3,10);
	var step = 360 / vert_count;
	var rad = box_rad;

	var lx = box_x;
	var ly = box_y + rad;

	ctx.beginPath();
	ctx.moveTo(lx, ly);

	for(var i = 0; i < vert_count; ++i)
	{
		//var r_step = rand.float_fuzzy(step, step * 0.2);
		var r_step = step; 
		var angle = (r_step * i) * math.DEG2RAD;
		var radius = rand.float_fuzzy(rad, rad / 1.5);
		var x = math.cos(angle) * radius;
		var y = math.sin(angle) * radius;

		ctx.lineTo(box_x + x, box_y + y);

		lx = x;
		ly = y;
	}

	ctx.closePath();
	draw.fill();

	//draw.stroke_rgb(0.3,0.3,0.3,1.0);
	//draw.rect(ax,ay,bx,by).stroke();

	/*
	for(var i = 0; i < 1; ++i)
	{
		var pn = rand.int(3, 10);
		var step = 360 / pn;
		var i_rot = rand.float_fuzzy(step, 10);// * gb.math.DEG2RAD;
		var ir = rand.float(box_rad / 2, box_rad);

		for(var j = 0; j < pn; ++j)
		{
			var r = rand.float(box_rad / 2, box_rad);
			var n_rot = i_rot + rand.float_fuzzy(step, 10);// * gb.math.DEG2RAD;

			var pxa = (box_x + gb.math.cos(i_rot)) * ir;
			var pya = (box_y + gb.math.sin(i_rot)) * ir;

			var pxb = (box_x + gb.math.cos(n_rot)) * r;
			var pyb = (box_y + gb.math.sin(n_rot)) * r;

			draw.line(pxa, pya, pxb, pyb);
			draw.stroke_t(colors[i]);
			draw.stroke();

			i_rot = n_rot;
			ir = r;
		}
	}
	*/

}

