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

function init()
{
	var k = gb.Keys;
	gb.input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.one, k.two, k.three, k.up, k.down, k.left, k.right],
	});
	var c = draw.new(gb.dom.find('.container'));

	//draw.clear_rgb(0.9,0.9,0.9,1);
	draw.clear_rgb(0.1,0.1,0.1,1);
	//draw.blend_alpha();
	draw.blend_mode("screen");
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

	time -= dt * 10;
	if(time < 0)
	{
		time += 1;
		var edge = rand.int(0,3);
		var ax = 0;
		var ay = 0;
		var bx = 0;
		var by = 0;

		var w = view.width;
		var h = view.height;

		if(edge === 0) //left
		{
			ax = 0;
			ay = rand.float(0, h);

			edge = rand.int(0,2);
			if(edge === 0) //top
			{
				bx = rand.float(0,w);
				by = 0;
			}
			else if(edge === 1) //right
			{
				bx = w;
				by = rand.float(0,h);
			}
			else //bottom
			{
				bx = rand.float(0,w);
				by = h;
			}
		}
		else if(edge === 1) //right
		{
			ax = w;
			ay = rand.float(0, h);

			edge = rand.int(0,2);
			if(edge === 0) //top
			{
				bx = rand.float(0,w);
				by = 0;
			}
			else if(edge === 1) //left
			{
				bx = 0;
				by = rand.float(0,h);
			}
			else //bottom
			{
				bx = rand.float(0,w);
				by = h;
			}
		}
		else if(edge === 2) //top
		{
			ax = rand.float(0, w);
			ay = 0;

			edge = rand.int(0,2);
			if(edge === 0) //bottom
			{
				bx = rand.float(0,w);
				by = h;
			}
			else if(edge === 1) //right
			{
				bx = w;
				by = rand.float(0,h);
			}
			else //left
			{
				bx = 0;
				by = rand.float(0,h);
			}
		}
		else //bottom
		{
			ax = rand.float(0, w);
			ay = h;

			edge = rand.int(0,2);
			if(edge === 0) //top
			{
				bx = rand.float(0,w);
				by = 0;
			}
			else if(edge === 1) //right
			{
				bx = w;
				by = rand.float(0,h);
			}
			else //left
			{
				bx = 0;
				by = rand.float(0,h);
			}
		}

		var r = rand.float(0.5,0.7);
		var g = rand.float(0.5,0.7);
		var b = rand.float(0.5,0.7);

		draw.stroke_rgb(r,g,b,0.5);
		draw.line(ax,ay,bx,by).stroke();
	}


}
