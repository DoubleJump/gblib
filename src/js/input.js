var KeyState =
{
	RELEASED: 0,
	UP: 1,
	DOWN: 2,
	HELD: 3,
};

var Keys =
{
	MOUSE_LEFT: 0,
	MOUSE_RIGHT: 1,
	BACKSPACE: 8,
	TAB: 9,
	ENTER: 13,
	SHIFT: 16,
	CTRL: 17,
	ALT: 18,
	CAPS: 20,
	ESC: 27,
	SPACE: 32,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	ZERO: 48,
	ONE: 49,
	TWO: 50,
	THREE: 51,
	FOUR: 52,
	FIVE: 53,
	SIX: 54,
	SEVEN: 55,
	EIGHT: 56,
	NINE: 57,
	A: 65,
	B: 66,
	C: 67,
	D: 68,
	E: 69,
	F: 70,
	G: 71,
	H: 72,
	I: 73,
	J: 74,
	K: 75,
	L: 76,
	M: 77,
	N: 78,
	O: 79,
	P: 80,
	Q: 81,
	R: 82,
	S: 83,
	T: 84,
	U: 85,
	V: 86,
	W: 87,
	X: 88,
	Y: 89,
	Z: 90,
};

function Mouse()
{
	var m = {};
	m.position = Vec3();
	m.initial = Vec3();
	m.last_position = Vec3();
	m.delta = Vec3();
	m.scroll = 0;
	m.has_scrolled = false;
	m.dy = 0;
	m.ldy = 0;
	return m;
}
/*
function Gyro()
{
	var g = {};
	g.acceleration = Vec3();
	g.angular_acceleration = Vec3();
	g.rotation = Vec4();
	g.euler = Vec3();
	g.updated = false;
	return g;
}
*/
function Touch ()
{
	var t = {};
	t.id = -1;
	t.is_touching = false;
	t.position = Vec3();
	t.initial = Vec3();
	t.last_position = Vec3();
	t.delta = Vec3();
	t.updated = false;
	t.state = KeyState.RELEASED;
	return t;
}
/*
function GamePad()
{
	var g = {};
	return g;
}
*/

var input;
function Input(root)
{
	var r = {};
	r.mouse = Mouse();
	r.keys = new Uint8Array(256);
	r.touches = new Array(5);
	r.touch_count = 0;
	//r.gyro = Gyro();
	r.is_touch_device = is_touch_device();
	r.scrolled = false;
	r.scroll_lock = true;

	if(!root) root = window;

	r.MAX_TOUCHES = 5;
	for(var i = 0; i < r.MAX_TOUCHES; ++i) r.touches[i] = Touch();

	root.addEventListener("touchstart",  on_touch_start, false);
  	root.addEventListener("touchmove", on_touch_move, false);
  	root.addEventListener("touchend", on_touch_end, false);

	//window.addEventListener('devicemotion', on_device_motion);
	//window.addEventListener('deviceorientation', on_device_rotation);

	window.addEventListener('keydown', on_key_down);
	window.addEventListener('keyup', on_key_up);
	root.addEventListener('mouseup', on_mouse_up);
	root.addEventListener('mousedown', on_mouse_down);
	root.addEventListener('mousemove', on_mouse_move);
	root.addEventListener('wheel', on_mouse_wheel);
	root.addEventListener('scroll', on_scroll);

	input = r;
	return r;
}

function is_touch_device()
{
	return (('ontouchstart' in window)
		|| (navigator.MaxTouchPoints > 0)
    	|| (navigator.msMaxTouchPoints > 0));
}

function update_input()
{
	var mouse = input.mouse;

	input.touch_count = 0;
	
	if(input.is_touch_device)
	{
		var t;
		for(var i = 0; i < input.MAX_TOUCHES; ++i)
		{
			t = input.touches[i];
			if(t.is_touching) input.touch_count++;
			vec_sub(t.delta, t.position, t.last_position);
			vec_eq(t.last_position, t.position);
		}

		t = input.touches[0];
		mouse.position[0] = t.position[0] * app.res;
		mouse.position[1] = t.position[1] * app.res;
		vec_eq(mouse.delta, t.delta);
	}
	else
	{
		vec_sub(mouse.delta, mouse.position, mouse.last_position);
	}

	mouse.scroll = 0;
	if(mouse.has_scrolled === true)
	{
		if(mouse.dy > 0) mouse.scroll = 1; 
		else if(mouse.dy < 0) mouse.scroll = -1;
		mouse.has_scrolled = false;
	}

	input.scrolled = false;

	vec_eq(mouse.last_position, mouse.position);
}

function update_key_states()
{
	if(input.is_touch_device)
	{
		for(var i = 0; i < input.MAX_TOUCHES; ++i)
		{
			var t = input.touches[i];
			if(t.state === KeyState.DOWN) t.state = KeyState.HELD;
			else if(t.state === KeyState.UP) t.state = KeyState.RELEASED;
		}
	}

	for(var i = 0; i < 256; ++i)
	{
		if(input.keys[i] === KeyState.DOWN) input.keys[i] = KeyState.HELD;
		else if(input.keys[i] === KeyState.UP) input.keys[i] = KeyState.RELEASED;
	}
}

function key_up(code)
{
	return input.keys[code] === KeyState.UP;
}
function key_down(code)
{
	return input.keys[code] === KeyState.DOWN;
}
function key_held(code)
{
	return input.keys[code] === KeyState.HELD || input.keys[code] === KeyState.DOWN;
}
function key_released(code)
{
	return input.keys[code] === KeyState.RELEASED || input.keys[code] === KeyState.UP;
}

function on_key_down(e)
{
	var kc = e.keyCode || e.button;
	if(input.keys[kc] != KeyState.HELD) input.keys[kc] = KeyState.DOWN;
}
function on_key_up(e)
{
	var kc = e.keyCode || e.button;
	if(input.keys[kc] != KeyState.RELEASED) input.keys[kc] = KeyState.UP;
}
function on_mouse_move(e)
{
	set_vec3(input.mouse.position, e.clientX * app.res, e.clientY * app.res, 0);
}
function on_mouse_down(e)
{
	var x = e.clientX * app.res;
	var y = e.clientY * app.res;
	set_vec3(input.mouse.position, x,y,0);
	set_vec3(input.mouse.initial, x,y,0);
	input.keys[Keys.MOUSE_LEFT] = KeyState.DOWN;
}
function on_mouse_up(e)
{
	var x = e.clientX * app.res;
	var y = e.clientY * app.res;
	set_vec3(input.mouse.position, x,y,0);
	input.keys[Keys.MOUSE_LEFT] = KeyState.UP;
}

function on_mouse_wheel(e)
{
	input.mouse.has_scrolled = true;
	var dy = e.wheelDeltaY || e.deltaY * -1;
	input.mouse.dy = dy;
	if(input.scroll_lock === true) e.preventDefault();
}
function on_scroll(e)
{
	input.scrolled = true;
}
/*
function on_device_motion(e)
{
	var l = e.acceleration;
	var a = e.rotationRate;
	set_vec3(input.gyro.acceleration, l.x, l.y, l.z);
	set_vec3(input.gyro.angular_acceleration, a.beta, a.gamma, a.alpha);
	input.gyro.updated = true;
}
function on_device_rotation(e)
{
	quat_set_euler_f(input.gyro.rotation, e.beta, e.gamma, e.alpha);
	set_vec3(input.gyro.euler, e.beta, e.gamma, e.alpha);

	input.gyro.updated = true;
}
*/
function on_touch_start(e)
{
	var n = e.changedTouches.length;
	for(var i = 0; i < n; ++i)
	{
		var it = e.changedTouches[i];

		for(var j = 0; j < input.MAX_TOUCHES; ++j)
		{
			var t = input.touches[j];
			if(t.is_touching === true) continue;
			t.state = KeyState.DOWN;
			var x = it.clientX;
			var y = it.clientY;
			set_vec3(t.position, x,y,0);
			set_vec3(t.last_position, x,y,0);
			set_vec3(t.delta, 0,0,0);
			set_vec3(t.initial, x,y,0);
			t.is_touching = true;
			t.id = it.identifier;
			t.updated = true;
			break;
		}
	}
	if(input.scroll_lock === true) e.preventDefault();
}

function on_touch_move(e)
{
	var n = e.changedTouches.length;

	for(var i = 0; i < n; ++i)
	{
		var it = e.changedTouches[i];

		for(var j = 0; j < input.MAX_TOUCHES; ++j)
		{
			var t = input.touches[j];
			if(it.identifier === t.id)
			{
				t.is_touching = true;
				var x = it.clientX;
				var y = it.clientY;
				set_vec3(t.position, x, y, 0);
				t.updated = true;
				break;
			}
		}
	}
	if(input.scroll_lock === true) e.preventDefault();
}

function on_touch_end(e)
{
	var n = e.changedTouches.length;
	for(var i = 0; i < n; ++i)
	{
		var id = e.changedTouches[i].identifier;
		for(var j = 0; j < input.MAX_TOUCHES; ++j)
		{
			var t = input.touches[j];
			if(id === t.id)
			{
				t.is_touching = false;
				t.id = -1;
				t.updated = true;
				t.state = KeyState.UP;
				var x = it.clientX;
				var y = it.clientY;
				set_vec3(t.position, x, y, 0);
				set_vec3(t.last_position, x,y,0);
				set_vec3(t.delta, 0,0,0);
				break;
			}
		}
	}
	if(input.scroll_lock === true) e.preventDefault();
}