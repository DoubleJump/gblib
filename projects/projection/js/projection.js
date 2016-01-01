//INCLUDE projects/projection/js/gblib.js
//INCLUDE lib/js/gl/fps_camera.js
//INCLUDE lib/js/socket.js

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var input = gb.input;
var scene = gb.scene;
var assets;

var construct;
var cube;
var camera;
var camera_pivot;
var surface_target;
var fxaa_pass;

var debug_view;
var x_warp;
var y_warp;

function init()
{
	gb.init(
	{
		config:
		{
			frame_skip: true,
			update: update,
			debug_update: debug_update,
			render: render,
		},
		gl:
		{
			antialias: true,
		},
		gl_draw:
		{
			buffer_size: 32000,
		},
	});

	gb.assets.load("assets/assets.gl", load_complete);
}

function load_complete(asset_group)
{
	assets = asset_group;
	construct = scene.new(null, true);

	cube = gb.entity.mesh(assets.meshes.map, gb.material.new(assets.shaders.sphere));
	cube.material.warp_x = 1.0;
	cube.spin = 0;
	scene.add(cube);

	camera = gb.camera.new();
	camera.entity.position[2] = 3.0;
	scene.add(camera);

	camera_pivot = gb.entity.new();
	camera_pivot.angle_x = 0;
	camera_pivot.angle_y = 0;
	camera_pivot.vx = 0;
	camera_pivot.vy = 0;
	gb.entity.set_parent(camera.entity, camera_pivot);
	scene.add(camera_pivot);

	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);

	//var connection = gb.socket.new('192.168.0.4:8080/sockets');

	//DEBUG
	debug_view = gb.debug_view.new(document.body);
	x_warp = gb.debug_view.control(debug_view, 'WarpX', 0, 1.0, 0.01, 1.0);
	//y_warp = gb.debug_view.control(debug_view, 'WarpY', 0, 1.0, 0.01, 1.0);

	gb.debug_view.watch(debug_view, 'AngleX', camera_pivot, 'angle_x');
	gb.debug_view.watch(debug_view, 'AngleY', camera_pivot, 'angle_y');
	//END

	gb.allow_update = true;
}

function update(dt)
{	
	//gb.camera.fly(camera, dt, 85);

	var ROTATE_SPEED = 1000 * dt;
	var VERTICAL_LIMIT = 70;
	var ax = 0;
	var ay = 0;
	if(input.held(gb.Keys.a))
	{
		ay -= ROTATE_SPEED * dt;
	}
	else if(input.held(gb.Keys.d))
	{
		ay += ROTATE_SPEED * dt;
	}
	if(input.held(gb.Keys.w))
	{
		ax -= ROTATE_SPEED * dt;
	}
	else if(input.held(gb.Keys.s))
	{
		ax += ROTATE_SPEED * dt;
	}

	for(var i = 0; i < input.MAX_TOUCHES; ++i)
	{
		if(input.touches[i].is_touching === true)
		{
			ay -= input.touches[0].delta[0] * 2 * dt;
			ax -= input.touches[0].delta[1] * 2 * dt;
			break;
		}
	}

	camera_pivot.vx *= 0.90;
	camera_pivot.vy *= 0.90;

	camera_pivot.vx += ax;
	camera_pivot.vy += ay;

	camera_pivot.vx = gb.math.clamp(camera_pivot.vx, -5.0, 5.0);
	camera_pivot.vy = gb.math.clamp(camera_pivot.vy, -5.0, 5.0);

	camera_pivot.angle_x += camera_pivot.vx;
	camera_pivot.angle_y += camera_pivot.vy;

	camera_pivot.angle_x = gb.math.clamp(camera_pivot.angle_x, -VERTICAL_LIMIT, VERTICAL_LIMIT);

	var rot_x = gb.quat.tmp();
	var rot_y = gb.quat.tmp();
	var right = gb.vec3.tmp(1,0,0);
	var up = gb.vec3.tmp(0,1,0);

	gb.quat.angle_axis(rot_x, camera_pivot.angle_x, right);
	gb.quat.angle_axis(rot_y, camera_pivot.angle_y, up);

	gb.quat.mul(camera_pivot.rotation, rot_y, rot_x);
	camera_pivot.dirty = true;

	cube.material.warp_x = x_warp.value;
	//cube.material.warp_y = y_warp.value;	
}

function debug_update(dt)
{
	gb.debug_view.update(debug_view);
	//gb.gl_draw.transform(camera_pivot.world_matrix);
	//gb.gl_draw.set_color(0.5,0.5,0.5,0.5);
	//gb.gl_draw.wire_mesh(cube.mesh, cube.world_matrix);
}

function render()
{
	if(gb.webgl.attributes.antialias || gb.webgl.config.antialias === false)
	{
		gl.render_scene(construct, camera, null);
		gb.gl_draw.render(camera, null);
	}
	else
	{
		gl.render_scene(construct, camera, surface_target);
		gb.gl_draw.render(camera, surface_target);
		gl.render_post_call(fxaa_pass);
	}
}

window.addEventListener('load', init, false);