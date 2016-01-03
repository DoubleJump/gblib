//INCLUDE projects/launchvis/js/gblib.js
//INCLUDE projects/launchvis/js/lvlib.js
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
var assets;
var debug_view;

var construct;
var cube;
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
		}
	});

	gb.assets.load('assets/assets.gl', event_asset_load);
	var request = gb.ajax.GET('assets/launch_data.data', event_data_load);
	request.send();
}

function event_data_load(e)
{
	if(e.target.status === 200)
    {
        var s = gb.binary_reader;
        var br = new gb.Binary_Reader(e.target.response);
        LOG("Asset File Size: " + br.buffer.byteLength + " bytes");
        lv.load_data(br);
    }
}

function event_asset_load(asset_group)
{
	debug_view = gb.debug_view.new(document.body);

	assets = asset_group;
	construct = scene.new(null, true);

	cube = gb.entity.mesh(gb.mesh.cube(2,1,1), gb.material.new(assets.shaders.surface));
	cube.spin = 0;
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

	gb.camera.fly(camera, dt, 80);
	
	cube.spin += 30 * dt;
	gb.entity.set_rotation(cube, cube.spin, cube.spin, cube.spin);
}

function render()
{
	gl.render_scene(construct, camera, surface_target);
	gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);
