//DEBUG
function ASSERT(expr, message)
{
    if(expr === false) console.error(message);
}
function LOG(message)
{
	console.log(message);
}
//END

var gb = 
{
	has_focus: true,
	frame_skip: false,
	do_skip_this_frame: false,

	init: function(){},
	update: function(t){},

	focus: function(e)
	{
		gb.has_focus = true;
		//DEBUG
		console.log('focus');
		//END
	},
	blur: function(e)
	{
		gb.has_focus = false;
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
		if(gb.frame_skip === true)
		{
			if(gb.do_skip_this_frame === true)
			{
				gb.do_skip_this_frame = false;
				requestAnimationFrame(gb._update);
				return;
			}
			gb.do_skip_this_frame = true;
		}
		
		gb.time.update(t);
		if(gb.time.paused || gb.has_focus === false)
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

	has_flag_set: function(mask, flag)
	{
	    return (flag & mask) === flag;
	},
}
window.addEventListener('load', gb._init, false);
window.onfocus = gb.focus;
window.onblur = gb.blur;