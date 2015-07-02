//INCLUDE gb.js
//DEBUG
//INCLUDE debug.js
//END
//INCLUDE dom.js
//INCLUDE stack.js
//INCLUDE math.js
//INCLUDE vector.js
//INCLUDE quaternion.js
//INCLUDE matrix.js
//INCLUDE rect.js
//INCLUDE aabb.js
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
var flow_dir;
var flow_speed;
var dash_count;
var dash_spread;
var dashes;
var dash_color;
var dash_length;

window.addEventListener('load', init, false);

var Dash = function()
{
	this.pos;
	this.speed;
	this.color;
	this.depth;
}

function init()
{
	gb.time.init();
	gb.input.init(document,
	{
		keycodes: [0,1],
	});
	var canvas = gb.new_canvas(gb.dom.find('.container'));
	gb.canvas.set_context(canvas);
	
	window.onfocus = on_focus;
	window.onblur = on_blur;

	var view = gb.canvas.view;

	flow_dir = new gb.Vec2(0.707,0.707);
	flow_speed = 50;
	dash_count = 10;
	dash_spread = 600;
	dash_length = 300; //view / 3;
	dash_color = "#ffffff";

	dashes = [];
	for(var i = 0; i < dash_count; ++i)
	{
		var d = new Dash();
		d.pos = new gb.Vec2(0,0);
		gb.random.vec2(d.pos, 0, dash_spread, 0, dash_spread);
		d.depth = gb.random.float(1,4);
		dashes.push(d);
	}

	requestAnimationFrame(upA);
}

function on_focus(e)
{
	console.log('focus');
	focus = true;
}
function on_blur(e)
{
	console.log('blur');
	focus = false;
}



function update(timestamp)
{
	var dt = gb.time.dt;
	gb.stack.clear_all();

	var ctx = gb.canvas.ctx;
	ctx.lineCap = "round";

	var view = gb.canvas.view;

	gb.canvas.clear();

	var end = gb.vec2.tmp();
	for(var i = 0; i < dash_count; ++i)
	{
		var d = dashes[i];
		var inv_depth = 1 / d.depth;
		d.pos[0] += flow_dir[0] * flow_speed * inv_depth * dt;
		d.pos[1] += flow_dir[1] * flow_speed * inv_depth * dt;
		end[0] = d.pos[0] + flow_dir[0] * dash_length;
		end[1] = d.pos[1] + flow_dir[1] * dash_length;
		
		ctx.fillStyle = "#ffffff";//d.color;
		ctx.beginPath();
		ctx.lineWidth = 30 * inv_depth;
		ctx.moveTo(d.pos[0], d.pos[1]);
		ctx.lineTo(end[0], end[1]);
		ctx.stroke();

		if(d.pos[0] > view.width || d.pos[1] > view.height) 
		{
			gb.random.vec2(d.pos, 0, dash_spread, 0, dash_spread);
		}

	}

	/*
	ctx.fillStyle = "#ffffff";
	ctx.beginPath();
	ctx.lineWidth = 10;
	ctx.moveTo(0, 0);
	ctx.lineTo(50,50);
	ctx.stroke();
	*/

	gb.input.update();
}


function upA(t)
{
	gb.time.update(t);
	if(gb.time.paused || focus === false)
	{
		requestAnimationFrame(upA);
		return;
	}

	update(t);
	requestAnimationFrame(upB);
}


function upB(t)
{
	gb.time.update(t);
	if(gb.time.paused || focus === false)
	{
		requestAnimationFrame(upB);
		return;
	}

	update(t);
	requestAnimationFrame(upA);
}