//INCLUDE projects/lines/js/gblib.js
//INCLUDE lib/js/gl/curve.js
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
var line_cutoff = 0;

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
		},
	});

	gb.assets.load("assets/assets.gl", load_complete);
}

function load_complete(ag)
{
	construct = scene.new(null, true);

	//line = gb.line_mesh.ellipse(2,2,60,0.1);
	line = gb.line_mesh.curve(ag.curves['bob'], 15);

	line.entity.material = gb.material.new(ag.shaders.line);
	line.entity.material.line_width = line.thickness;
	line.entity.material.cutoff = line.length;
	line.entity.material.aspect = 1.0;
	line.entity.material.mitre = 1;
	gb.color.set(line.entity.material.color, 0.8,0.8,0.884,1.0);
	scene.add(line);

	camera = gb.camera.new();
	camera.entity.position[2] = 3.0;
	scene.add(camera);
	construct.active_camera = camera;

	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(ag.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);
	gb.allow_update = true;
}

function update(dt)
{
	line_cutoff += dt;
	var sint = (gb.math.sin(line_cutoff) + 1) * 0.5;
	//line.entity.material.line_width = sint;
	//line.entity.material.cutoff = sint * line.length;
}

function render()
{
	gl.render_draw_call(camera, construct, construct.draw_items, construct.num_draw_items, null, null, true, true);
	gb.gl_draw.render(camera, null);
	//gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);