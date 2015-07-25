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

window.addEventListener('load', init, false);

var Fluid = function(size)
{
	this.size = size;
	this.velocity = new Float32Array(size);
	this.pressure = new Float32Array(size);
	this.dye = new Float32Array(size);
}

var sim_view;
var fluid;
var fluid_last;
var col = "";

function init()
{
	gb.time.init();
	gb.input.init(document,
	{
		keycodes: [0,1],
	});
	sim_view = gb.canvas.new(gb.dom.find('.container'));
	gb.canvas.set_context(sim_view);
	
	window.onfocus = on_focus;
	window.onblur = on_blur;

	fluid = new Fluid(50);
	fluid_last = new Fluid(50);

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

	if(gb.input.down(0))
	{
		fluid_last.dye[fluid.size / 2] = 1.0;
	}

	var ctx = gb.canvas.ctx;
	var view = gb.canvas.view;

	gb.canvas.clear();

	for(var i = 1; i < fluid.size - 1; ++i)
	{
		var vl = fluid_last.velocity[i-1];
		var vr = fluid_last.velocity[i+1];
		var pl = fluid_last.pressure[i-1];
		var pr = fluid_last.pressure[i+1];
		var dl = fluid_last.dye[i-1];
		var dr = fluid_last.dye[i+1];

		fluid.velocity[i] = (vl + vr) * 0.5;
		fluid.pressure[i] = (pl + pr) * 0.5;
		fluid.dye[i] = (dl + dr) * 0.5;

		col = gb.canvas.rgba(255,255,255, fluid.dye[i]);
		gb.canvas.rectf((i * 10), 0, 10, 30, col);
	}

	// Boundary conditions
	fluid.velocity[0] = -fluid_last.velocity[1];
	fluid.pressure[0] = 0
	fluid.dye[0] = 0;

	fluid.velocity[fluid.size - 1] = -fluid_last.velocity[fluid.size - 2];
	fluid.pressure[fluid.size - 1] = 0
	fluid.dye[fluid.size - 1] = 0;

	// Swap buffers
	var n = fluid.size;
	for(var i = 0; i < n; ++i)
	{
		fluid_last.velocity[i] = fluid.velocity[i];
		fluid_last.pressure[i] = fluid.pressure[i];
		fluid_last.dye[i] = fluid.dye[i];
	}

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