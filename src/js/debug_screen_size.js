function Debug_Screen_Sizes(sizes)
{
	var r = {};
	var sizes = 
	[
		0,0, 100,
		360,640, 17.69,
		375,667, 13.62,
		375,812, 5.79,
		360,740, 4.84,
		1920,1080, 4.75,
		412,846, 4.6,
		414,736, 4.33,
		1366,768, 4.3,
		360,720, 3.65,
		412,732, 2.4,
		320,568, 1.99,
		1440,900, 1.9,
		414,869, 1.57,
		1536,864, 1.48,
		412,869, 1.39,
		1280,800, 1.13,
		1600,900, 1.1,
		360,780, 1.0,
		360,760, 0.98,
		1280,720, 0.95,
		768,1024, 0.89,
		393,786, 0.83,
		1680,1050, 0.8,
		320,570, 0.68,
		412,823, 0.65,
		412,892, 0.65,
	];
	r.sizes = sizes;

	var container = div('div', 'debug-screen-list hidden');
	var n = sizes.length;
	for(var i = 0; i < n; i+=3)
	{
		var item = div('p', 'btn ns', container);
		item.setAttribute('data-w', sizes[i]);
		item.setAttribute('data-h', sizes[i+1]);
		item.innerHTML = sizes[i] + ' x ' + sizes[i+1];
		item.addEventListener('click', on_screen_size_click);
		item.addEventListener('mouseover', on_screen_size_hover);
		container.appendChild(item); 
	}

	r.container = container;
	return r;
}

function draw_screen_sizes(camera)
{
	set_viewport(camera.view)

	var ctx = app.gl_draw;
	var sizes = app.debug_tools.screen_sizes.sizes;

	var w = app.view[2];
	var h = app.view[3];
	var x = 0;
	var y = 0;
	var cx = w/2;
	var cy = h/2;

	var v3 = vec3_stack.index;
	var a = _Vec3();
	var b = _Vec3();
	var c = _Vec3();
	var d = _Vec3();

	var n = sizes.length-1;
	for(var i = n; i > 0; i-=3)
	{
		x = (sizes[i-2]) / 2;
		y = (sizes[i-1]) / 2;
		var t = (sizes[i] * 4) / 100;

		if(i === 2) set_vec4(ctx.color, 1,0,1,1);
		else set_vec4(ctx.color, 1,1,1,t);

		set_vec3(a, cx - x, cy - y, 0.0);
		set_vec3(b, cx + x, cy - y, 0.0);
		set_vec3(c, cx + x, cy + y, 0.0);
		set_vec3(d, cx - x, cy + y, 0.0);

		draw_line(ctx, a,b);
		draw_line(ctx, b,c);
		draw_line(ctx, c,d);
		draw_line(ctx, d,a);
	}

	render_gl_draw(ctx, camera);
	vec3_stack.index = v3;
}

function on_screen_size_click(e)
{
	var item = e.target;
	var w = item.getAttribute('data-w') / app.res;
	var h = item.getAttribute('data-h') / app.res;
	
	var container = find('.canvas-container');
	container.style.width = w + 'px';
	container.style.height = h + 'px';

	app.do_resize = true;
}

function on_screen_size_hover(e)
{
	var item = e.target;
	var w = item.getAttribute('data-w');
	var h = item.getAttribute('data-h');

	var sizes = app.debug_tools.screen_sizes.sizes;
	sizes[0] = w;
	sizes[1] = h;
}