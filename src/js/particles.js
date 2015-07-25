//INCLUDE gb.js
//DEBUG
//INCLUDE debug.js
//END
//INCLUDE dom.js
//INCLUDE stack.js
//INCLUDE math.js
//INCLUDE vector.js
//INCLUDE quaternion.js
//INCLUDE rect.js
//INCLUDE bezier.js
//INCLUDE color.js
//INCLUDE time.js
//INCLUDE canvas.js
//DEBUG
//INCLUDE gl_draw.js
//END
//INCLUDE input.js
//INCLUDE random.js
//INCLUDE animate.js

var focus = true;

window.addEventListener('load', init, false);

var v2 = gb.vec2;
var v3 = gb.vec3;
var rand = gb.random;
var draw = gb.canvas;

var colors;
var curve;
var particles;
var emitter;
var effectors;
var active_effector = null;
var edit_mode = false;

var Particle = function()
{
	this.position;
	this.radius;
	this.color;
	this.life_time;
	this.speed;
}

var Emitter = function()
{
	this.position;
	this.radius;
	this.particles;
	this.active;
	this.total;
}

var Effector = function()
{
	this.position;
	this.radius;
	this.strength;
	this.state;
	this.type;
	this.t;
}

function init()
{
	var k = gb.Keys;

	gb.time.init();
	gb.input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.one, k.two, k.three, k.up, k.down],
	});
	var c = draw.new(gb.dom.find('.container'));
	draw.set_context(c);
	
	window.onfocus = on_focus;
	window.onblur = on_blur;

	curve = gb.bezier.clamped(0.0,1.0,1.0,1.0);
	curve.d[0] = 0;
	curve.d[1] = 0;

	colors = [];
	for(var i = 0; i < 10; ++i)
	{
		var r = rand.float(0.95, 1.0);
		var g = rand.float(0.12, 0.8);
		var b = rand.float(0.12, 0.2);
		var a = rand.float(0.9, 1.0);
		colors.push(gb.color.new(r,g,b,a));
	}

	emitter = new Emitter();
	emitter.particles = [];
	emitter.position = v2.new(draw.view.width / 2, draw.view.height / 2);
	emitter.active = 1;
	emitter.total = 50;
	emitter.radius = 50;

	for(var i = 0; i < emitter.total; ++i)
	{
		new_particle(emitter);
	}

	effectors = [];
	for(var i = 0; i < 1; ++i)
	{
		new_effector(100, 100, 50, 10);
	}

	draw.clear_rgb(0.1,0.1,0.13,1);

	requestAnimationFrame(update);
}


function update(t)
{
	gb.time.update(t);
	if(gb.time.paused || focus === false)
	{
		requestAnimationFrame(update);
		return;
	}

	var dt = gb.time.dt;
	gb.stack.clear_all();

	var ctx = gb.canvas.ctx;
	var view = gb.canvas.view;

	var m_pos = gb.input.mouse_position;
	var m_held = gb.input.held(0);
	var m_up = gb.input.up(0);
	var m_delta = gb.input.mouse_delta;
	var delta = v2.tmp();

	draw.clear();

	if(gb.input.down(gb.Keys.z))
	{
		edit_mode = !edit_mode;
	}
	if(gb.input.down(gb.Keys.up))
	{
		//new_particle(emitter);
		emitter.active++;
		if(emitter.active > emitter.total) emitter.active = emitter.total;
	}
	else if(gb.input.down(gb.Keys.down))
	{
		emitter.active--;
		if(emitter.active < 1) emitter.acitve = 1;
		var p = emitter.particles[emitter.active];
		p.life_time = 0;
	}

	var n = effectors.length;
	for(var i = 0; i < n; ++i)
	{
		var e = effectors[i];
		if(e.state === -1) continue;
		e.t += dt * 0.3;
		if(e.t > 1.0)
		{
			e.t = 0.0;
		}
	}

	if(edit_mode === true)
	{

		// Draw emitters

		draw.fill_rgb(0.3,0.3,0.3,1.0);
		draw.stroke_rgb(0.3,0.3,0.3,1.0);
		draw.stroke_width(1);
		draw.point_t(emitter.position, 15);
		draw.circle_t(emitter.position, emitter.radius).stroke();

		// Add / Remove effectors

		if(gb.input.down(gb.Keys.one))
		{
			new_effector(m_pos[0], m_pos[1], 50, 10, 1);
		}
		else if(gb.input.down(gb.Keys.two))
		{
			new_effector(m_pos[0], m_pos[1], 50, 10, 2);
		}
		else if(gb.input.down(gb.Keys.three))
		{
			new_effector(m_pos[0], m_pos[1], 50, 10, 3);
		}

		// Reset effectors

		var n = effectors.length;

		for(var i = 0; i < n; ++i)
		{
			var e = effectors[i];
			if(e.state === -1) continue;
			if(e.selected === true) continue;
			e.state = 0;
		}

		// Mouse pick effector

		if(active_effector === null)
		{
			for(var i = 0; i < n; ++i)
			{
				var e = effectors[i];
				if(e.state === -1) continue;

				delta[0] = m_pos[0] - e.position[0];
				delta[1] = m_pos[1] - e.position[1];
				var mag = v2.length(delta);

				var hover = (mag < e.radius);
				var hover_edge = (mag < (e.radius + 10) && mag > e.radius - 10);
				var hover_center = (mag < 30);

				if(hover_edge) 
				{
					e.state = 3;
					if(m_held)
					{
						e.state = 4;
						e.selected = true;
						active_effector = e;
					}
					break;
				}
				else if(hover_center)
				{
					e.state = 5;
					if(m_held)
					{
						active_effector = e;
						e.selected = true;
						e.state = 6;
					}
					break;	
				} 
				else if(hover) 
				{
					e.state = 1;
					if(m_held)
					{
						e.state = 2;
						e.selected = true;
						active_effector = e;
					}
					break;
				}
			}
		}
		else
		{
			if(m_up)
			{
				active_effector.selected = false;
				active_effector.state = 0;
				active_effector = null;
			}
			else
			{
				delta[0] = m_pos[0] - active_effector.position[0];
				delta[1] = m_pos[1] - active_effector.position[1];
				var mag = v2.length(delta);

				if(active_effector.state === 2)
				{
					active_effector.position[0] -= m_delta[0];
					active_effector.position[1] -= m_delta[1];
				}
				else if(active_effector.state === 4)
				{
					var m_mag = v2.length(m_delta);
					active_effector.radius = gb.math.clamp(mag, 50, 400);
				}
				else if(active_effector.state === 6)
				{
					active_effector.strength = gb.math.clamp(mag, 10, 400);
				}
			}
		}

		for(var i = 0; i < n; ++i)
		{
			var e = effectors[i];
			if(e.state === -1) continue;

			draw.stroke_width(1);
			draw.stroke_rgb(0.2,0.2,0.2,0.55);
			draw.circle_t(e.position, e.radius * e.t).stroke();

			if(e.state === 0)
			{
				draw.stroke_rgb(0.2,0.2,0.2,1);
				draw.stroke_width(1);
				draw.point_t(e.position, e.strength);
				draw.circle_t(e.position, e.radius).stroke();
			}
			else if(e.state === 1) // hover
			{
				draw.stroke_rgb(0.4,0.4,0.4,1);
				draw.stroke_width(1);
				draw.point_t(e.position, e.strength);
				draw.circle_t(e.position, e.radius).stroke();
			}
			else if(e.state === 2) // reposition
			{
				draw.stroke_rgb(0.4,0.4,0.4,1);
				draw.stroke_width(1);
				draw.point_t(e.position, e.strength);
				draw.circle_t(e.position, e.radius).stroke();
			}
			else if(e.state === 3) // hover edge
			{
				draw.stroke_rgb(0.4,0.4,0.6,1);
				draw.stroke_width(1);
				draw.point_t(e.position, e.strength);
				draw.stroke_width(4);
				draw.stroke_rgb(1.0,1.0,1.0,1);
				draw.circle_t(e.position, e.radius).stroke();
			}
			else if(e.state === 4) // resize
			{
				draw.stroke_rgb(0.4,0.4,0.6,1);
				draw.stroke_width(1);
				draw.point_t(e.position, e.strength);
				draw.stroke_width(4);
				draw.stroke_rgb(1.0,1.0,1.0,1);
				draw.circle_t(e.position, e.radius).stroke();
			}
			else if(e.state === 5) // hover center
			{
				draw.stroke_rgb(1,1,1,1);
				draw.stroke_width(4);
				draw.point_t(e.position, e.strength);

				draw.stroke_rgb(0.4,0.4,0.6,1);
				draw.stroke_width(1);
				draw.circle_t(e.position, e.radius).stroke();
			}
			else if(e.state === 6) // change strength
			{
				draw.stroke_rgb(1,1,1,1);
				draw.stroke_width(4);
				draw.point_t(e.position, e.strength);

				draw.stroke_rgb(0.4,0.4,0.6,1);
				draw.stroke_width(1);
				draw.circle_t(e.position, e.radius).stroke();
			}
		}
	}

	var ne = effectors.length;
	for(var i = 0; i < emitter.active; ++i)
	{
		var p = emitter.particles[i];

		p.life_time += 0.01 * p.speed * dt;
		if(p.life_time > 1.0)
		{
			p.life_time = 0;
			var x = emitter.position[0];
			var y = emitter.position[1];
			rand.vec2_fuzzy(p.position, x,y, 50);
		}

		//p.position[0] += 10 * dt;
		p.position[1] -= p.speed * dt;

		for(var j = 0; j < ne; ++j)
		{
			var e = effectors[j];
			delta[0] = p.position[0] - e.position[0];
			delta[1] = p.position[1] - e.position[1];

			var inv_radius = e.radius / 100;
			var dist = v2.length(delta);
			var str = e.strength * gb.bezier.eval_f(curve, e.t);

			var force = (1 / (dist * dist)) * inv_radius * (str * 1000);

			p.position[0] += delta[0] * force * dt;
			p.position[1] += delta[1] * force * dt;
		}

		var scale = gb.bezier.eval_f(curve, p.life_time);

		draw.fill_c(p.color);
		draw.circle_t(p.position, p.radius * scale).fill();
	}

	gb.input.update();

	requestAnimationFrame(update);
}

function new_particle(e)
{
	var p = new Particle();
	p.position = v2.new(0,0);
	var x = e.position[0];
	var y = e.position[1];
	rand.vec2_fuzzy(p.position, x,y, 50);
	p.radius = rand.float(30,60);
	p.color = colors[rand.int(0,9)];
	p.life_time = rand.float(0,0.5);
	p.speed = rand.float(50,100);
	e.particles.push(p);
	return p;
}

function new_effector(x, y, radius, strength, type)
{
	var e = new Effector();
	e.position = v2.new(x,y);
	e.radius = radius;
	e.strength = strength;
	e.state = 0;
	e.type = type;
	e.t = rand.float(0,0.5);
	effectors.push(e);
	return e;
}


function on_focus(e)
{
	console.log('focus');
	focus = true;
}
function on_blur(e)
{
	console.log('blur');
	focus = false;
}