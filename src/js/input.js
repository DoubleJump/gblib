gb.Touch = function()
{
	this.id = -1;
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

	_mdy:0,
	_lmdy:0,
	mouse_scroll: 0,

	touches: [],
	MAX_TOUCHES: 5,
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

		for(var i = 0; i < _t.MAX_TOUCHES; ++i)
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
			if(_t.keys[i] === gb.KeyState.DOWN) _t.keys[i] = gb.KeyState.HELD;
			else if(_t.keys[i] === gb.KeyState.UP) _t.keys[i] = gb.KeyState.RELEASED;
		}

		if(_t._mdy === _t._ldy)
		{
			_t.mouse_scroll = 0;
		}
		else
		{
			_t.mouse_scroll = _t._mdy;
			_t._ldy = _t._mdy;
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
		gb.input._mdy = e.deltaY;
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
		var _t = gb.input;
		var n = e.changedTouches.length;
		for(var i = 0; i < n; ++i)
		{
			var it = e.changedTouches[i];

			for(var j = 0; j < _t.MAX_TOUCHES; ++j)
			{
				var t = _t.touches[j];
				if(t.touching === true) continue;
				gb.vec3.set(t.position, it.screenX, it.screenY, 0);
				t.touching = true;
				t.id = it.identifier;
				break;
			}
		}
		e.preventDefault();
	},
	touch_move: function(e)
	{
		var _t = gb.input;
		var n = e.changedTouches.length;
		for(var i = 0; i < n; ++i)
		{
			var it = e.changedTouches[i];

			for(var j = 0; j < _t.MAX_TOUCHES; ++j)
			{
				var t = gb.input.touches[j];
				if(it.identifier === t.id)
				{
					t.touching = true;
					gb.vec3.set(t.position, it.screenX, it.screenY, 0);
					break;
				}
			}
		}
		e.preventDefault();
	},
	touch_end: function(e)
	{
		var _t = gb.input;
		var n = e.changedTouches.length;
		for(var i = 0; i < n; ++i)
		{
			var id = e.changedTouches[i].identifier;
			for(var j = 0; j < _t.MAX_TOUCHES; ++j)
			{
				var t = gb.input.touches[j];
				if(id === t.id)
				{
					t.touching = false;
					t.id = -1;
					break;
				}
			}
		}
		e.preventDefault();
	},
	
}