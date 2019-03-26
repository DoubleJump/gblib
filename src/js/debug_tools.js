function Debug_Tools()
{
	var r = {};
	r.mode = 'console';

	var container = div('div', 'debug-tools', document.body);
	container.innerHTML =
	`<div class='debug-icons'>
		<div data-option='console' class='debug-option btn'>
			<svg viewBox='0 0 40 40'><path fill="white" d="M17.9,22.6l-1.2,1.2l-5-5l5-5l1.2,1.2L14,18.8L17.9,22.6z M22.1,22.6l3.9-3.8l-3.9-3.8l1.2-1.2l5,5l-5,5
		L22.1,22.6z"/></svg>
		</div>
	 	<div data-option='fps' class='debug-option btn'>
			<svg viewBox='0 0 40 40'><path fill="white" d="M13.3,25.4v-6.7h3.4v6.7H13.3z M18.3,25.4V12.1h3.4v13.4H18.3z M23.3,16.3h3.4v9.2h-3.4V16.3z"/></svg>
	 	</div>
	 	<div data-option='sizes' class='debug-option btn'>
			<svg viewBox='0 0 40 40'><path fill="white" d="M12.5,12.9c0-0.4,0.2-0.8,0.5-1.2c0.3-0.3,0.7-0.5,1.2-0.5h3.3v1.7h-3.3v3.3h-1.7V12.9z M14.2,21.3v3.3h3.3
			v1.7h-3.3c-0.4,0-0.8-0.2-1.2-0.5c-0.3-0.3-0.5-0.7-0.5-1.2v-3.3H14.2z M25.8,11.3c0.4,0,0.8,0.2,1.2,0.5c0.3,0.3,0.5,0.7,0.5,1.2
			v3.3h-1.7v-3.3h-3.3v-1.7H25.8z M25.8,24.6v-3.3h1.7v3.3c0,0.4-0.2,0.8-0.5,1.2c-0.3,0.3-0.7,0.5-1.2,0.5h-3.3v-1.7H25.8z"/></svg>
	 	</div>
	 	<div data-option='options' class='debug-option btn'>
			<svg viewBox='0 0 40 40'><path fill="white"  d="M26.2,19.9l1.8,1.4c0.2,0.1,0.2,0.3,0.1,0.5l-1.7,2.9c-0.1,0.2-0.3,0.2-0.5,0.2l-2.1-0.8
			c-0.5,0.4-1,0.7-1.4,0.8l-0.3,2.2c-0.1,0.2-0.2,0.4-0.4,0.4h-3.4c-0.2,0-0.3-0.1-0.4-0.4l-0.3-2.2c-0.5-0.2-1-0.5-1.4-0.8
			l-2.1,0.8c-0.2,0.1-0.4,0-0.5-0.2L12,21.9c-0.1-0.2-0.1-0.4,0.1-0.5l1.8-1.4c0-0.2,0-0.5,0-0.8c0-0.4,0-0.6,0-0.8L12,16.9
			c-0.2-0.1-0.2-0.3-0.1-0.5l1.7-2.9c0.1-0.2,0.3-0.2,0.5-0.2l2.1,0.8c0.5-0.4,1-0.7,1.4-0.8l0.3-2.2c0.1-0.2,0.2-0.4,0.4-0.4h3.4
			c0.2,0,0.3,0.1,0.4,0.4l0.3,2.2c0.5,0.2,1,0.5,1.4,0.8l2.1-0.8c0.2-0.1,0.4,0,0.5,0.2l1.7,2.9c0.1,0.2,0.1,0.4-0.1,0.5l-1.8,1.4
			c0,0.2,0,0.5,0,0.8C26.2,19.5,26.2,19.8,26.2,19.9z M17.9,21.2c0.6,0.6,1.3,0.9,2.1,0.9c0.8,0,1.5-0.3,2.1-0.9
			c0.6-0.6,0.9-1.3,0.9-2.1c0-0.8-0.3-1.5-0.9-2.1c-0.6-0.6-1.3-0.9-2.1-0.9c-0.8,0-1.5,0.3-2.1,0.9c-0.6,0.6-0.9,1.3-0.9,2.1
			C17.1,19.9,17.4,20.6,17.9,21.2z"/></svg>
	 	</div>
	 	<div data-option='info' class='debug-option btn'>
			<svg viewBox='0 0 40 40'><path fill="white" d="M25.8,12.1c0.4,0,0.8,0.2,1.2,0.5c0.3,0.3,0.5,0.7,0.5,1.2v11.6c0,0.4-0.2,0.8-0.5,1.2
			c-0.3,0.3-0.7,0.5-1.2,0.5H14.2c-0.4,0-0.8-0.2-1.2-0.5c-0.3-0.3-0.5-0.7-0.5-1.2V13.7c0-0.4,0.2-0.8,0.5-1.2
			c0.3-0.3,0.7-0.5,1.2-0.5h3.5c0.2-0.5,0.5-0.9,0.9-1.2c0.4-0.3,0.9-0.5,1.4-0.5s1,0.2,1.4,0.5c0.4,0.3,0.7,0.7,0.9,1.2H25.8z
			 M24.2,17.1v-1.7h-8.4v1.7H24.2z M24.2,20.4v-1.6h-8.4v1.6H24.2z M21.7,23.7v-1.7h-5.9v1.7H21.7z M20.6,12.3
			c-0.2-0.2-0.4-0.2-0.6-0.2s-0.4,0.1-0.6,0.2s-0.2,0.4-0.2,0.6s0.1,0.4,0.2,0.6c0.2,0.2,0.4,0.3,0.6,0.3s0.4-0.1,0.6-0.3
			c0.2-0.2,0.2-0.4,0.2-0.6S20.7,12.4,20.6,12.3z"/></svg>
	 	</div>
	 </div>`;

	// Console

	r.console = Debug_Console();
	container.appendChild(r.console.container);
	find('div[data-option=console]').addEventListener('click', function()
	{
		r.mode = 'console';
		dom_hide(r.screen_sizes.container);
		dom_hide(r.options.container);
		dom_hide(r.fps.container);
		dom_hide(r.info.container);

		dom_show(r.console.container);
	});

	// Fps

	r.fps = Debug_FPS();
	container.appendChild(r.fps.container);
	find('div[data-option=fps]').addEventListener('click', function()
	{
		r.mode = 'fps';
		dom_hide(r.screen_sizes.container);
		dom_hide(r.options.container);
		dom_hide(r.console.container);
		dom_hide(r.info.container);

		dom_show(r.fps.container);

	});

	// Screen sizes
	r.screen_sizes = Debug_Screen_Sizes();
	container.appendChild(r.screen_sizes.container);
	find('div[data-option=sizes]').addEventListener('click', function()
	{
		r.mode = 'sizes';
		dom_hide(r.console.container);
		dom_hide(r.options.container);
		dom_hide(r.fps.container);
		dom_hide(r.info.container);
		
		dom_show(r.screen_sizes.container);
	});

	// Options

	r.options = Debug_Options();
	container.appendChild(r.options.container);
	find('div[data-option=options]').addEventListener('click', function()
	{
		r.mode = 'options';
		dom_hide(r.console.container);
		dom_hide(r.screen_sizes.container);
		dom_hide(r.fps.container);
		dom_hide(r.info.container);

		dom_show(r.options.container);
	});

	// Info

	r.info = Debug_GPU();
	container.appendChild(r.info.container);
	find('div[data-option=info]').addEventListener('click', function()
	{
		r.mode = 'info';
		dom_hide(r.console.container);
		dom_hide(r.screen_sizes.container);
		dom_hide(r.fps.container);
		dom_hide(r.options.container);

		dom_show(r.info.container);

	});

	return r;
}