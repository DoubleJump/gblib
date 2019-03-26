function Debug_FPS()
{
	var r = {};
	var container = div('div', 'debug-fps ns hidden');
	container.innerHTML =
	`
	<canvas></canvas>
 	<p>30 fps</p>
 	<div data-fps='default' class='btn'>rAF</div>
 	<div data-fps='60' class='btn'>60</div>
 	<div data-fps='30' class='btn'>30</div>
 	<div data-fps='24' class='btn'>24</div>
 	<div data-fps='15' class='btn'>15</div>
	`;
	r.container = container;

	r.frame_count = 75;
	var canvas = container.querySelector('canvas');
	canvas.width = r.frame_count;
	canvas.height = 75;
	r.canvas = canvas;

	var buttons = container.querySelectorAll('.btn');
	for(var i = 0; i < buttons.length; ++i)
	{
		buttons[i].addEventListener('click', on_fps_click);
	}

	r.ctx = canvas.getContext('2d');

	r.frames = new Int32Array(r.frame_count);
	r.fps = container.querySelector('p');

	return r;
}

function update_debug_fps()
{
	var r = app.debug_tools.fps;
	var fps = round_to(1/app.ticker.advance, 0);

	var f = r.frames;
	var n = r.frame_count - 1;
	for(var i = 0; i < n; ++i)
	{
		f[i] = f[i+1];
	}
	f[n] = fps;

	var ctx = r.ctx;
	var w = r.canvas.width;
	var h = r.canvas.height;
	ctx.fillStyle = '#000000';
	ctx.fillRect(0,0,w,h);

	var px = 0;
	//var py = 0;
	var step = 1;//(w / r.frame_count) | 0;

	ctx.fillStyle = '#FFFFFF';
	

	for(var i = 0; i < r.frame_count; ++i)
	{
		var dt = (f[i] * 0.5) | 0;
		ctx.fillRect(px, h-dt, step, 1);
		px += step;
	}

	r.fps.innerHTML = fps + ' fps';
}

function on_fps_click(e)
{
	var fps = e.target.getAttribute('data-fps');

	if(fps === 'default')
	{
		app.ticker.fixed_update = false;
	}
	else
	{
	 	fps = fps | 0;
		app.ticker.fixed_update = true;
		app.ticker.fixed_dt = 1/fps;
	}
}