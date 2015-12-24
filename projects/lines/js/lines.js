//INCLUDE projects/lines/js/gblib.js
//INCLUDE lib/js/gl/line_mesh.js

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var input = gb.input;
var scene = gb.scene;

var construct;
var line;
var camera;
var surface_target;
var fxaa_pass;

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
	});

	gb.assets.load("assets/assets.gl", load_complete);
}

function load_complete(ag)
{
	construct = scene.new(null, true);

	var line = gb.line_mesh.new(0.1, null, [-1,0, 1,0, 2,0.5]);
	line.entity.material = gb.material.new(ag.shaders.line);
	line.entity.material.line_width = line.thickness;
	scene.add(line);

	camera = gb.camera.new();
	camera.entity.position[2] = 3.0;
	scene.add(camera);
	construct.active_camera = camera;

	surface_target = gb.render_target.new();
	/*
	fxaa_pass = gb.post_call.new(gb.material.new(ag.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);
	*/
	gb.allow_update = true;
}

function update(dt)
{
}

function render()
{
	gl.render_draw_call(camera, construct, construct.draw_items, construct.num_draw_items, null, null, true, true);
	//gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);