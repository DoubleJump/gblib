//INCLUDE projects/rig/js/gblib.js
var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var input = gb.input;
var scene = gb.scene;
var character;
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
	character = scene.find('cube');
	gb.entity.set_armature(character, ag.rigs.armature);
	ag.animations.test.target = character.rig.joints;
	gb.animation.play(ag.animations.test, -1);

	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(ag.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);

	gb.allow_update = true;
}

function update(dt)
{
	gb.gl_draw.rig_transforms(character.rig);
}

function render()
{
	var s = scene.current;
	gl.render_draw_call(s.active_camera, s, s.draw_items, s.num_draw_items, null, null, true, true);
	gb.gl_draw.render(s.active_camera, null);
	//gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);

