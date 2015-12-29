//INCLUDE projects/projection/js/gblib.js
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
			render: render,
		},
		gl:
		{
			antialias: true,
		}
	});

	gb.assets.load("assets/assets.gl", load_complete);
}

function load_complete(asset_group)
{
	debug_view = gb.debug_view.new(document.body);
	x_warp = gb.debug_view.control(debug_view, 'WarpX', 0, 1.0, 0.01, 1.0);
	y_warp = gb.debug_view.control(debug_view, 'WarpY', 0, 1.0, 0.01, 1.0);

	assets = asset_group;
	construct = scene.new(null, true);

	cube = gb.entity.mesh(assets.meshes.map, gb.material.new(assets.shaders.sphere));
	cube.spin = 0;
	scene.add(cube);

	camera = gb.camera.new();
	camera.entity.position[2] = 3.0;
	scene.add(camera);

	input.lock_cursor(true);

	/*
	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);
	*/

	gb.allow_update = true;
}

function update(dt)
{
	gb.debug_view.update(debug_view);
	cube.material.warp_x = x_warp.value;
	cube.material.warp_y = y_warp.value;
}

function render()
{
	gl.render_scene(construct, camera, null);
	//gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);

