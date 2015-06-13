gb.Touch = function()
{
	this.touching = false;
	this.position = new gb.Vec3();
}

gb.KeyState = 
{
	UP: 1,
	DOWN: 2,
	HELD: 3,
	RELEASED: 4,
}

gb.input = 
{
	mouse_position: new gb.Vec3(),
	mouse_scroll: 0,

	touches: [null, null, null, null, null],
	acceleration: new gb.Vec3(),
	angular_acceleration: new gb.Vec3(),
	rotation: new gb.Quat(),

	keys: new Uint8Array(256),

	init: function(root, config)
	{
		var _t = gb.input;
		root.onkeydown 	 = _t.key_down;
		root.onkeyup 	 = _t.key_up;
		root.onmousedown = _t.key_down;
		root.onmouseup   = _t.key_up;
		root.onmousemove = _t.mouse_move;

		root.addEventListener("wheel", _t.mouse_wheel, false);

		for(var i = 0; i < 256; ++i)
		{
			_t.keys[i] = 0;
		}

		var keycodes = config.keycodes;
		var n = keycodes.length;
		for(var i = 0; i < n; ++i)
		{
			_t.keys[keycodes[i]] = gb.KeyState.RELEASED;
		}

		for(var i = 0; i < 5; ++i)
		{
			_t.touches[i] = new gb.Touch();
		}

		window.addEventListener('devicemotion', _t.device_motion);
		window.addEventListener('deviceorientation', _t.device_rotation);

		window.addEventListener("touchstart", _t.touch_start, false);
	  	window.addEventListener("touchmove", _t.touch_move, false);
	  	window.addEventListener("touchend", _t.touch_end, false);
	},

	update: function()
	{
		var _t = gb.input;
		for(var i = 0; i < 256; ++i)
		{
			var k = _t.keys[i];
			if(k === gb.KeyState.DOWN) _t.keys[k] = gb.KeyState.HELD;
			else if(_t.keys[k] === gb.KeyState.UP) _t.keys[k] = gb.KeyState.RELEASED;
		}
	},

	up: function(code)
	{
		return gb.input.keys[code] === gb.KeyState.UP;
	},
	down: function(code)
	{
		return gb.input.keys[code] === gb.KeyState.DOWN;
	},
	held: function(code)
	{
		return gb.input.keys[code] === gb.KeyState.HELD;
	},
	released: function(code)
	{
		return gb.input.keys[code] === gb.KeyState.RELEASED;
	},

	key_down: function(e)
	{
		var _t = gb.input;
		var kc = e.keyCode;
		if(_t.keys[kc] === 0) return;

		if(_t.keys[kc] != gb.KeyState.HELD) 
			_t.keys[kc] = gb.KeyState.DOWN;

		e.preventDefault();
	},
	key_up: function(e)
	{
		var _t = gb.input;
		var kc = e.keyCode;
		if(_t.keys[kc] === 0) return;

		if(_t.keys[kc] != gb.KeyState.RELEASED) 
			_t.keys[kc] = gb.KeyState.UP;

		e.preventDefault();
	},

	mouse_move: function(e)
	{
		gb.vec3.set(gb.input.mouse_position, e.clientX, e.clientY, 0);
	},
	mouse_wheel: function(e)
	{
		gb.input.mouse_scroll = e.deltaY;
	},

	device_motion: function(e)
	{
		var _t = gb.input;
		var v3 = gb.vec3;
		var l = e.acceleration;
		var a = e.rotationRate;
		v3.set(_t.acceleration, l.x, l.y, l.z);
		v3.set(_t.angular_acceleration, a.beta, a.gamma, a.alpha);
	},

	device_rotation: function(e)
	{
		gb.quat.euler(gb.input.rotation, e.beta, e.gamma, e.alpha);
	},

	touch_start: function(e)
	{
		var n = e.touches.length;
		for(var i = 0; i < n; ++i)
		{
			var it = e.touches[i];
			var t = gb.input.touches[i];
			gb.vec3.set(t.position, it.screenX, it.screenY, 0);
			t.touching = true;
		}
		e.preventDefault();
	},
	touch_move: function(e)
	{
		var n = e.touches.length;
		for(var i = 0; i < n; ++i)
		{
			var it = e.touches[i];
			var t = gb.input.touches[i];
			gb.vec3.set(t.position, it.screenX, it.screenY, 0);
		}
		e.preventDefault();
	},
	touch_end: function(e)
	{
		var n = e.touches.length;
		for(var i = 0; i < n; ++i)
		{
			gb.input.touches[i].touching = false;
		}
		e.preventDefault();
	},
	
}