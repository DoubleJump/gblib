//INCLUDE projects/watts/js/gblib.js
//INCLUDE lib/js/dom.js
//INCLUDE lib/js/physics.js
//INCLUDE lib/js/gl/fps_camera.js
//INCLUDE lib/js/gl/mesh/cube.js

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var input = gb.input;
var scene = gb.scene;
var draw = gb.gl_draw;
var physics = gb.physics;
var dom = gb.dom;
var assets;

var debug_view;
var drain_slider;

var frame;
var construct;
var camera;

var energy_display;
var energy_counter;
var energy_max_value;
var energy_value;
var energy_drain_rate;
var energy_ball;

var car;
var car_body;

function init()
{
	gb.init(
	{
		config:
		{
			frame_skip: false,
			update: update, 
			render: render,
		},
		gl:
		{
			antialias: true,
			width: 375,
			height: 667,
		}
	});

	gb.assets.load("assets/assets.gl", load_complete);
}

function load_complete(asset_group)
{
	debug_view = gb.debug_view.new(document.body);

	gl.set_clear_color(0.431,0.76,0.76,1.0);

	// UI
	
	frame = dom.get('.frame');
	energy_display = dom.get('.energy-display');
	energy_counter = dom.get('.energy-display .counter');
	
	energy_max_value = 18000;
	energy_drain_rate = 36000;
	energy_value = energy_max_value;

	assets = asset_group;

	construct = scene.new(null, true);
	
	// CAMERA

	camera = gb.camera.new();
	v3.set(camera.entity.position, 1.0, 0.8, 2.0);

	scene.add(camera);

	// ENERGY BALL

	energy_ball = gb.entity.mesh(gb.mesh.quad(0.3,0.3), gb.material.new(asset_group.shaders.surface));
	v3.set(energy_ball.position, 0,1,0);
	scene.add(energy_ball);

	// CAR

	//car = gb.entity.mesh(asset_group.meshes.car, gb.material.new(asset_group.shaders.surface));
	car = gb.entity.mesh(asset_group.meshes.car, gb.material.new(asset_group.shaders.vertex));
	v3.set(car.material.light, 1.0,3.0,3.0);
	car.material.eye = camera.entity.position;


	scene.add(car);
	car_body = physics.new_body(1500);
	//body.position[1] = 1.0;

	qt.look_at(camera.entity.rotation, car.position, camera.entity.position, v3.tmp(0,0,1));

	// DEBUG

	//gb.debug_view.watch(debug_view, 'V', body, 'velocity', 1);
	//gb.debug_view.watch(debug_view, 'Time', gb.time, 'elapsed');
	drain_slider = gb.debug_view.control(debug_view, 'Rate', 1000, 36000, 100, 1000);

	gb.allow_update = true;
}

function update(dt)
{
	gb.debug_view.update(debug_view);
	gb.camera.fly(camera, dt, 80);



	//follow mouse
	var energy_pos = v3.tmp();
	gb.projections.world_to_screen(energy_pos, camera.view_projection, energy_ball.position, gl.view);
	energy_display.style.transform = 'translate(' + energy_pos[0] + 'px, ' + energy_pos[1] + 'px)';
	
	physics.add_force_f(car_body, 0, -9.81, 0, true);

	energy_drain_rate = drain_slider.value;

	var inv_dt = 1.0 / dt;

	var pressing = input.held(gb.Keys.z) || input.touches[0].is_touching === true;
	if(pressing)
	{
		energy_value -= energy_drain_rate * dt;
		if(energy_value > 0)
			//physics.add_force_f(body, energy_drain_rate, 0, 0, false);
			physics.add_force_f(car_body, 0, energy_drain_rate, 0, false);
	}

	if(energy_value < 0) energy_value = 0;
	energy_counter.innerText = gb.math.round(energy_value);

	physics.integrate_euler(car_body, dt);

	if(car_body.position[1] < 0)
	{
		energy_value = energy_max_value;
		car_body.position[1] = 0;
		if(car_body.velocity[1] < -2.0) car_body.velocity[1] = -car_body.velocity[1] * 0.25;
		else if(car_body.velocity[1] < 0.0) car_body.velocity[1] = 0;
	}
	v3.eq(car.position, car_body.position);

	//draw.line(v3.tmp(1,0,0), body.position);
	//draw.set_position_f(body.position);
	//draw.circle(0.3, 32);
}


function render()
{
	gl.set_render_target(null, true);
	//gl.render_scene(construct, camera, null);
	gl.render_entity(car, camera, null);
	//gl.render_post_call(fxaa_pass);
	//draw.render(camera, null);
}

window.addEventListener('load', init, false);

