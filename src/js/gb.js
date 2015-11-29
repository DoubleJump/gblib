//DEBUG
function ASSERT(expr, message)
{
    if(expr === false) console.error(message);
}
function LOG(message)
{
	console.log(message);
}
function EXISTS(val)
{
	return val !== null && val !== undefined;
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
		LOG('focus');
	},
	blur: function(e)
	{
		gb.has_focus = false;
		LOG('blur');
	},
	_init: function(e)
	{
		if(gb.init) gb.init();
		requestAnimationFrame(gb._init_time);
	},
	_init_time: function(t)
	{
		gb.time.init(t);
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
		gb.update(gb.time.dt);
		gb.input.update();
		requestAnimationFrame(gb._update);
	},

	has_flag_set: function(mask, flag)
	{
	    return (flag & mask) === flag;
	},
	event_load_progress: function(e)
	{
		var percent = e.loaded / e.total;
		LOG('Loaded: ' + e.loaded + ' / ' + e.total + ' bytes');
	},
}
window.addEventListener('load', gb._init, false);
window.onfocus = gb.focus;
window.onblur = gb.blur;