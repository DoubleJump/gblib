//INCLUDE projects/vector/js/gblib.js
var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var input = gb.input;
var scene = gb.scene;
var assets;
var debug_view;

var construct;
var cube;
var camera;
var surface_target;
var fxaa_pass;
var thickness;

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
			antialias: false,
		}
	});

	gb.assets.load("assets/assets.gl", load_complete);
}

function load_complete(asset_group)
{
	debug_view = gb.debug_view.new(document.body);
	thickness = gb.debug_view.control(debug_view, 'Thickness', 0.01, 0.5, 0.01, 0.01);

	assets = asset_group;
	construct = scene.new(null, true);

	//var vb = gb.vertex_buffer.new([0,0,0, 0,1,0, 1,1,0]);
	var vb = gb.vertex_buffer.new(
	[
		0.0,0.8, 0.0,0.0, 
		1.0,0.0, 1.0,1.0,
		1.0,0.7, 0.5,0.0
	]);
	//var ib = gb.index_buffer.new([0,1,2]);
	gb.vertex_buffer.add_attribute(vb, 'position', 2);
	gb.vertex_buffer.add_attribute(vb, 'uv', 2);

	var mesh = gb.mesh.new(vb, null);
	cube = gb.entity.mesh(mesh, gb.material.new(assets.shaders.vector));
	scene.add(cube);

	camera = gb.camera.new();
	camera.entity.position[2] = 3.0;
	scene.add(camera);

	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);

	gb.allow_update = true;
}

function update(dt)
{
	gb.debug_view.update(debug_view);
	cube.material.thickness = thickness.value;
}

function render()
{
	gl.render_scene(construct, camera, surface_target);
	//gb.gl_draw.render(camera, null);
	gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);

