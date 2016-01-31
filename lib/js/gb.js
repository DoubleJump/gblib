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
		debug_update: null,
		render: null,
		gl:
		{
			container: document.querySelector('.webgl'),
			width: 512,
			height: 512,
			antialias: false,
		},
		gl_draw:
		{
			buffer_size: 4096,
		},
		input:
		{
			root: document,
			keycodes: ['mouse_left', 'up', 'down', 'left', 'right', 'w', 'a', 's', 'd', 'f', 'h', 'q', 'e'],
		},
	},

	allow_update: false,
	has_focus: true,
	do_skip_this_frame: false,

	update: function(t){},
	debug_update: function(t){},
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
		for(var k in config.config)
			gb.config[k] = config.config[k];

		for(var k in config.gl)
			gb.config.gl[k] = config.gl[k];

		for(var k in config.input)
			gb.config.input[k] = config.input[k];

		//DEBUG
		for(var k in config.gl_draw)
			gb.config.gl_draw[k] = config.gl_draw[k];
		//END

		gb.input.init(gb.config.input);
		gb.webgl.init(gb.config.gl);
		//DEBUG
		gb.gl_draw.init(gb.config.gl_draw);
		//END

		if(gb.config.update) gb.update = config.config.update;
		if(gb.config.debug_update) gb.debug_update = config.config.debug_update;
		if(gb.config.render) gb.render = config.config.render;

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
		if(gb.time.paused || gb.has_focus === false || gb.allow_update === false)
		{
			gb.input.update();
			requestAnimationFrame(gb._update);
			return;
		}
		gb.stack.clear_all();
		
		var dt = gb.time.dt;
		gb.update(dt);
		gb.scene.update(dt);
		//DEBUG
		gb.debug_update(dt);
		//END
		gb.input.update();
		//DEBUG
		gb.webgl.verify_context();
		//END
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
//DEBUG
gb.debug = {};
//END