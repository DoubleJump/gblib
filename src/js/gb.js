//DEBUG
function ASSERT(expr, message)
{
    if(expr === false) console.error(message);
}
//END

var gb = 
{
	focus: true,
	init: function(){},
	update: function(t){},

	focus: function(e)
	{
		gb.focus = true;
		//DEBUG
		console.log('focus');
		//END
	},
	blur: function(e)
	{
		gb.focus = false;
		//DEBUG
		console.log('blur');
		//END
	},
	_init: function(e)
	{
		if(gb.init) gb.init();
		gb.time.init();
		if(gb.update) requestAnimationFrame(gb._update);
	},
	_update: function(t)
	{
		gb.time.update(t);
		if(gb.time.paused || gb.focus === false)
		{
			gb.input.update();
			requestAnimationFrame(gb._update);
			return;
		}
		gb.stack.clear_all();
		gb.update(t);
		gb.input.update();
		requestAnimationFrame(gb._update);
	},
}
window.addEventListener('load', gb._init, false);
window.onfocus = gb.focus;
window.onblur = gb.blur;