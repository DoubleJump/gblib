//INCLUDE projects/lines/js/gblib.js

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
		gl:
		{
			fill_container: false,
		}
	});

	assets = new gb.Asset_Group();
	gb.assets.load("assets/assets.gl", assets, load_complete);
}

function load_complete(asset_group)
{
	construct = scene.new(null, true);


    var line_data = new Float32Array(
    [
    	// POS NORMAL
        -1,0,0, 0, 1,0,
        -1,0,0, 0,-1,0,
        1,0,0, 0, 1,0,
        1,0,0, 0,-1,0
    ]);

    var line_tris = new Uint32Array([0,1,3,0,3,2]);
    var line_mask = 1 | 2;
    var line_mesh = gb.mesh.new(4, line_data, line_mask, line_tris);
    var line = gb.entity.mesh(line_mesh, gb.material.new(assets.shaders.line));
    line.material.line_width = 0.2;

	scene.add(line);

	camera = gb.camera.new();
	camera.position[2] = 3.0;
	scene.add(camera);
	construct.active_camera = camera;

	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);

	gb.allow_update = true;
}

function update(dt)
{
}

function render()
{
	gl.render_draw_call(camera.camera, construct.draw_items, null, surface_target, true);
	gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);