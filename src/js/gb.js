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
	config:
	{
		frame_skip: false,
		update: null,
		render: null,
		gl:
		{
			container: document.querySelector('.webgl'),
			width: 512,
			height: 512,
		},
		gl_draw:
		{
			buffer_size: 160000,
		},
		input:
		{
			root: document,
			keycodes: ['mouse_left', 'up', 'down', 'left', 'right'],
		},
	},

	loading: true,
	has_focus: true,
	do_skip_this_frame: false,

	update: function(t){},
	render: function(){},

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
	init: function(config)
	{
		for(var config_key in config)
			gb.config[config_key] = config[config_key];

		/*
		for(var config_key in config.gl)
			gb.config.gl[config_key] = config.gl[config_key];

		for(var config_key in config.input)
			gb.config.input[config_key] = config.input[config_key];

		//DEBUG
		for(var config_key in config.gl_draw)
			gb.config.gl_draw[config_key] = config.gl_draw[config_key];
		//END
		*/

		gb.input.init(gb.config.input);
		gb.webgl.init(gb.config.gl);
		//DEBUG
		gb.gl_draw.init(gb.config.gl_draw);
		//END

		if(gb.config.update) gb.update = config.update;
		if(gb.config.render) gb.render = config.render;

		window.onfocus = gb.focus;
		window.onblur = gb.blur;

		requestAnimationFrame(gb._init_time);
	},
	_init_time: function(t)
	{
		gb.time.init(t);
		requestAnimationFrame(gb._update);
	},
	_update: function(t)
	{
		if(gb.config.frame_skip === true)
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
		if(gb.time.paused || gb.has_focus === false || gb.loading === true)
		{
			gb.input.update();
			requestAnimationFrame(gb._update);
			return;
		}
		gb.stack.clear_all();
		//DEBUG
		gb.gl_draw.clear();
		//END
		//gb.scene.update(gb.scene.current, gb.time.dt);
		gb.update(gb.time.dt);
		//DEBUG
		gb.gl_draw.update();
		//END
		gb.input.update();
		gb.render();
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
