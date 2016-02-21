//INCLUDE projects/magnet/js/gblib.js
//INCLUDE lib/js/gl/fps_camera.js
//INCLUDE lib/js/gl/mesh/cube.js
//INCLUDE lib/js/physics.js

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var draw = gb.gl_draw;
var physics = gb.physics;
var input = gb.input;
var scene = gb.scene;
var debug_view;

var construct;
var camera;
var magnets = [];

function init()
{
	gb.init(
	{
		config:
		{
			frame_skip: false,
			update: update, 
			render: render,
		}
	});

	gb.assets.load("assets/assets.gl", load_complete);
}

function load_complete(ag)
{
	debug_view = gb.debug_view.new(document.body);

	construct = scene.new(null, true);

	camera = gb.camera.new();
	camera.entity.position[2] = 3.0;
	scene.add(camera);

	var magnet = create_magnet(-0.5,0,0, 0.2);
	magnets.push(magnet);

	gb.allow_update = true;
}

function update(dt)
{
	gb.debug_view.update(debug_view);
	gb.camera.fly(camera, dt, 80);
	
	var m = magnets[0];
	physics.force(m.body, v3.tmp(0,1,0), m.positive, false);
	update_magnet(m, dt);
}

function render()
{
	draw_magnet(magnets[0]);
	draw.render(camera, null);
}

function create_magnet(x,y,z, r)
{
	var entity = gb.entity.new();
	v3.set(entity.position, x,y,z);
	entity.body = physics.new_body(1.0, 1.0);
	entity.radius = r;
	entity.positive = v3.new(0,0,0);
	entity.negative = v3.new(0,0,0);
	return entity;
}

function update_magnet(m, dt)
{
	var index = gb.stack.index;

	physics.integrate_euler(m.body, dt);
	physics.sync_transform(m.body, m);
	gb.entity.update(m, construct);

	var pos = v3.tmp(m.radius, 0,0);
	var neg = v3.tmp(-m.radius, 0,0);
	m4.mul_point(m.positive, m.world_matrix, pos);
	m4.mul_point(m.negative, m.world_matrix, neg);

	gb.stack.index = index;
}

function draw_magnet(m)
{
	draw.set_color(1,0,0,1);
	draw.line(m.position, m.positive);
	draw.set_position(m.positive);
	draw.circle(m.radius, 12);

	draw.set_position_f(0,0,0);

	draw.set_color(0,0,1,1);
	draw.line(m.position, m.negative);
	draw.set_position(m.negative);
	draw.circle(m.radius, 12);
}

window.addEventListener('load', init, false);

