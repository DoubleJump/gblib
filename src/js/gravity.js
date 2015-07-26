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

var curve;
var bodies = [];
var ship;
var planet;
var selected_body = null;
var edit_mode = false;

var Body = function(x,y, vx,vy, mass, radius)
{
	this.position = v2.new(x,y);
	this.velocity = v2.new(vx,vy);
	this.acceleration = v2.new(0,0);
	this.mass = mass;
	this.inv_mass = 1 / mass;
	this.radius = radius;
}

var Planet = function()
{
	this.body;
	this.color;
}

var Ship = function()
{
	this.body;
	this.color;
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

	draw.clear_rgb(0.1,0.1,0.13,1);
	draw.font(16, 'Arial');

	ship = new Ship();
	ship.body = new Body(100,120, 0.8,0, 1, 10);
	ship.color = gb.color.new(0.5,0.5,0.5,1.0);
	bodies.push(ship.body);

	planet = new Planet();
	planet.body = new Body(300,300, 0,0, 10000, 100);
	planet.color = gb.color.new(0.6,0.4,0.3,1.0);
	bodies.push(planet.body);

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

	var at = gb.time.at;
	var dt = gb.time.dt;
	gb.stack.clear_all();

	var ctx = gb.canvas.ctx;
	var view = gb.canvas.view;

	var m_pos = gb.input.mouse_position;
	var m_held = gb.input.held(0);
	var m_up = gb.input.up(0);
	var m_down = gb.input.down(0);
	var m_delta = gb.input.mouse_delta;



	draw.clear();

	if(gb.input.down(gb.Keys.z))
	{
		edit_mode = !edit_mode;
	}
	if(gb.input.down(gb.Keys.x))
	{
		reset();
	}
	if(gb.input.held(gb.Keys.up))
	{
		var vn = v2.tmp();
		v2.normalized(vn, ship.body.velocity);
		add_force(ship.body, vn[0] * 10, vn[1] * 10);		
	}
	else if(gb.input.held(gb.Keys.down))
	{
		var vn = v2.tmp();
		v2.normalized(vn, ship.body.velocity);
		add_force(ship.body, -vn[0] * 10, -vn[1] * 10);	
	}

	var nb = bodies.length;

	if(edit_mode === true)
	{
		// Mouse pick emitter

		var delta = v2.tmp();
		for(var i = 0; i < nb; ++i)
		{
			var b = bodies[i];
			var dist = v2.distance(m_pos, b.position);
			if(dist < b.radius)
			{
				draw.stroke_rgb(1.0,1.0,1.0,1.0);
				draw.stroke_width(1);
				draw.circle_t(b.position, b.radius * 1.05).stroke();

				if(m_down)
				{
					selected_body = b;
					break;
				}
			}
		}

		if(selected_body)
		{
			draw.fill_rgb(1,1,1,1);
			draw.text("Mass: " + selected_body.mass, 10,20);
			draw.text("Radius: " + selected_body.radius, 10,40);
			draw.text("Velocity: " + gb.math.round_to(selected_body.velocity[0], 2) + ", " + gb.math.round_to(selected_body.velocity[1], 2), 10, 60);
			//draw.text("Velocity: " + selected_body.velocity[0] + ", " + selected_body.velocity[1], 10, 60);

			draw.stroke_rgb(0.8,0.8,1.0,1-at);
			draw.stroke_width(1);
			draw.circle_t(selected_body.position, selected_body.radius * (1.0 + (0.5 * at))).stroke();
			
			var dist = v2.distance(m_pos, selected_body.position);
			if(dist > b.radius)
			{
				if(m_down)
				{
					selected_body = null;
				}
			}
			if(m_held)
			{
				selected_body.position[0] -= m_delta[0];
				selected_body.position[1] -= m_delta[1]; 
			}
		}

	}


	for(var i = 0; i < nb; ++i)
	{
		var b = bodies[i];

		for(var j = 0; j < nb; ++j)
		{
			if(i === j) continue;

			var bo = bodies[j];
			gravitional_force(b, bo);
		}
	}

	for(var i = 0; i < nb; ++i)
	{
		var b = bodies[i];
		integrate(b, dt);
	}

	draw.fill_c(ship.color);
	draw.circle_t(ship.body.position, ship.body.radius).fill();

	draw.fill_c(planet.color);
	draw.circle_t(planet.body.position, planet.body.radius).fill();

	gb.input.update();

	requestAnimationFrame(update);
}

function new_planet()
{

}
function new_ship()
{

}

function reset()
{
	v2.set(ship.body.position, 100,100);
	v2.set(ship.body.velocity, 1,0);

	v2.set(planet.body.position, 300,300);
	v2.set(planet.body.velocity, 0,0);
}

function integrate(b, dt)
{
	b.velocity[0] += 0.5 * b.acceleration[0] * (dt * dt);
	b.velocity[1] += 0.5 * b.acceleration[1] * (dt * dt); 
	b.position[0] += b.velocity[0];
	b.position[1] += b.velocity[1];
	b.acceleration[0] = 0;
	b.acceleration[1] = 0;
}

function add_force(b, x, y)
{
	b.acceleration[0] += x * b.inv_mass;
	b.acceleration[1] += y * b.inv_mass; 
}

function gravitional_force(a,b)
{
	var dx = b.position[0] - a.position[0];
	var dy = b.position[1] - a.position[1];
	var dist = dx * dx + dy * dy;
	var id = 1 / dist;
	var f = id * ((9.81 * a.mass * b.mass) / dist);
	f *= 1000;

	add_force(a, dx * f, dy * f);
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