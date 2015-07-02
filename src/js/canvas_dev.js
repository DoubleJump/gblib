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
	gb.stack.clear_all();

	gb.canvas.clear("#220022");
	//gb.canvas.circle(gb.vec3.tmp(100,100), 50);
	//gb.canvas.stroke("#00ff00",5);
	gb.canvas.rectf(0,0,100,100, "#00ff00");

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