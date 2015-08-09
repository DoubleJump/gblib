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
//INCLUDE physics.js

var focus = true;

gb.init = init;
gb.update = update;

var v2 = gb.vec2;
var v3 = gb.vec3;
var rand = gb.random;
var draw = gb.canvas;
var input = gb.input;
var physics = gb.physics;


var Orb = function()
{
	this.body;
	this.radius;
}

var player;
var orb_count = 3;
var orbs = [];
var bounds;

function new_orb(x,y, vx,vy, mass, radius)
{
	var o = new Orb();
	o.body = physics.new_body(mass);
	o.radius = radius;
	v3.set(o.body.position, x,y,0);
	v3.set(o.body.velocity, vx, vy,0);
	return o;
}

function collide_bounds(orb, b)
{
	var p = orb.body.position;
	var v = orb.body.velocity;
	if((p[0] - orb.radius) < b.x || (p[0] + orb.radius) > (b.x + b.width))
	{
		v[0] = -v[0];
	}
	if((p[1] - orb.radius) < b.y || (p[1] + orb.radius) > (b.y + b.height))
	{
		v[1] = -v[1];
	}
}

function draw_player(p)
{
	draw.fill_rgb(0.7,0.65,0.82,1.0);
	draw.circle(p.body.position[0], p.body.position[1], p.radius).fill();
}

function draw_orb(orb)
{
	draw.fill_rgb(0.2,0.5,0.8,1.0);
	draw.circle(orb.body.position[0], orb.body.position[1], orb.radius).fill();
}

function init()
{
	var k = gb.Keys;
	gb.input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.one, k.two, k.three, k.up, k.down, k.left, k.right],
	});
	var c = draw.new(gb.dom.find('.container'));

	draw.clear_rgb(0.2,0.2,0.22,1);

	bounds = gb.rect.new();
	bounds.x = 30;
	bounds.y = 30;
	bounds.width = draw.view.width * 0.8;
	bounds.height = draw.view.height * 0.8;

	player = new_orb(50,50, 100, 100, 10.0, 30);

	var orb_r = 20;
	for(var i = 0; i < orb_count; ++i)
	{
		var x = rand.float(bounds.x + orb_r, (bounds.x + bounds.width)-orb_r);
		var y = rand.float(bounds.y + orb_r, (bounds.y + bounds.width)-orb_r);
		var vx = rand.float(20, 100);
		var vy = rand.float(20, 100);
		var mass = 10;
		orbs.push(new_orb(x,y,vx,vy,mass,orb_r));
	}
}

function update(t)
{
	var dt = gb.time.dt;
	var ctx = gb.canvas.ctx;
	var view = gb.canvas.view;

	draw.clear();
	
	
	physics.integrate_euler(player.body, dt);
	for(var i = 0; i < orb_count; ++i)
	{
		physics.integrate_euler(orbs[i].body, dt);
	}

	collide_bounds(player, bounds);
	for(var i = 0; i < orb_count; ++i)
	{
		collide_bounds(orbs[i], bounds);
	}

	draw_player(player);
	for(var i = 0; i < orb_count; ++i)
	{
		draw_orb(orbs[i]);
	}

	// draw bounds
	draw.stroke_rgb(0.3,0.3,0.3,1.0);
	draw.stroke_width(1);
	draw.rect(bounds.x, bounds.y, bounds.width, bounds.height).stroke();

}
