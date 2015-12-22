//INCLUDE projects/shadows/js/gblib.js
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
var lamp;

var surface_target;

var lamp_depth_target;
var lamp_mat;

var shadow_target;
var shadow_mat;

//var fxaa_pass;
var final_pass;

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

	assets = new gb.Asset_Group();
	gb.assets.load("assets/assets.gl", assets, load_complete);
}

function load_complete(asset_group)
{
	construct = scene.new(null, true);

	var surface_mat = gb.material.new(assets.shaders.surface);

	cube = gb.entity.mesh(gb.mesh.generate.cube(2,1,1), surface_mat);
	cube.spin = 0;
	scene.add(cube);

	var floor = gb.entity.mesh(gb.mesh.generate.quad(6,0,6), surface_mat);
	floor.position[1] = -1.0;
	scene.add(floor);

	camera = gb.camera.new();
	camera.position[2] = 3.0;
	scene.add(camera);
	construct.active_camera = camera;

	lamp = gb.camera.new(gb.Projection.PERSPECTIVE,0,10);
	lamp.position[1] = 5.0;
	qt.euler(lamp.rotation, -90,0,0);
	scene.add(lamp); 

	surface_target = gb.render_target.new();
	lamp_depth_target = gb.render_target.new();
	shadow_target = gb.render_target.new();

	lamp_mat = gb.material.new(assets.shaders.lamp);

	shadow_mat = gb.material.new(assets.shaders.shadow);
	shadow_mat.lamp_depth_map = lamp_depth_target.color;
	shadow_mat.lamp_view = lamp.camera.view;
	shadow_mat.lamp_proj = lamp.camera.projection;

	final_pass = gb.post_call.new(gb.material.new(assets.shaders.final), null);
	final_pass.material.surface_map = surface_target.color;
	final_pass.material.shadow_map = shadow_target.color;

	/*
	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = final_pass.render_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);
	*/

	gb.allow_update = true;
}

function update(dt)
{
	cube.spin += 30 * dt;
	gb.entity.set_rotation(cube, cube.spin, cube.spin, cube.spin);
}

function render()
{
	gl.render_draw_call(camera.camera, construct.draw_items, null, surface_target, true);
	gl.render_draw_call(lamp.camera, construct.draw_items, lamp_mat, lamp_depth_target, true);
	gl.render_draw_call(camera.camera, construct.draw_items, shadow_mat, shadow_target, true);

	gl.render_post_call(final_pass);
	//gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);

