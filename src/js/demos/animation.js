var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var input = gb.input;
var scene = gb.scene;
var assets;
var assets_loaded;

var construct;
var anim;

var surface_pass;
var debug_pass;
var lamp_pass;
var shadow_pass;
var lighting_pass;
var fxaa_pass;
var final_pass;
var antialias = false;

var camera;
var lamp;

var bob;

function init()
{
	gb.init(
	{
		frame_skip: false, 
		update: update, 
		render: render,
	});

	assets = new gb.Asset_Group();
	gb.loading = true;
	gb.assets.load("assets.gl", assets, load_complete);
}


function load_complete(asset_group)
{
	construct = scene.new(assets);
	scene.current = construct;
	
	bob = scene.find('cube');
	bob.rig = assets.rigs['armature'];
	//assets.materials.material.alpha = 1.0;
	//gb.animation.play(assets.animations.shift, -1);
	//gb.animation.play(assets.animations.matanim, -1);
	gb.animation.play(assets.animations.test, -1);
	assets.animations.test.target = bob.rig.joints;

	camera = scene.find('camera').camera;
	lamp = scene.find('shadowcam').camera;

	//scene.find('plane').material.alpha = 1.0;


	// draw color and alpha
	var surface_target = gb.render_target.new();
	surface_pass = gb.draw_call.new(construct.draw_items, null, surface_target);

	// draw normals and depth
	/*
	depth_normal_target = gb.render_target.new();
	depth_normal_pass = gb.draw_call.new(camera, 
										 construct.draw_items, 
										 gb.material.new(assets.shaders.depth_normal, 'depth_normal'), 
										 depth_normal_target);


	*/

	// debug draw
	debug_pass = gb.draw_call.new(gb.gl_draw.entities, gb.material.new(assets.shaders.debug), surface_target);
	debug_pass.depth_test = false;
	
	// draw shadows
	var lamp_target = gb.render_target.new();
	lamp_pass = gb.draw_call.new(construct.draw_items, null, lamp_target);

	var shadow_target = gb.render_target.new();
	shadow_pass = gb.draw_call.new(construct.draw_items, gb.material.new(assets.shaders.shadow), shadow_target); 
	shadow_pass.material.lamp_depth_map = lamp_target.depth;
	shadow_pass.material.lamp_matrix = lamp.view_projection;

	var lighting_target = gb.render_target.new();
	lighting_pass = gb.post_call.new(gb.material.new(assets.shaders.lighting), lighting_target);
	lighting_pass.material.surface_map = surface_target.color;
	lighting_pass.material.shadow_map = shadow_target.color;

	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	fxaa_pass.material.resolution = v3.tmp(gl.view.width, gl.view.height);
	fxaa_pass.material.inv_resolution = v3.tmp(1.0 / gl.view.width, 1.0 / gl.view.height);

	final_pass = gb.post_call.new(gb.material.new(assets.shaders.final), null);
	//final_pass.material.texture = surface_target.color;
	final_pass.material.texture = lighting_target.color;

	gb.loading = false;
}


function update(dt)
{
	// TODO: cant rely on this
	bob.dirty = true;

	if(input.down(gb.Keys.left))
	{
		//gb.animation.play(assets.animations.shift, -1);
		//gb.animation.play(assets.animations.matanim, -1);
		//gb.animation.play(assets.animations.test, 1);
		antialias = !antialias;
	}
	gb.animation.update(assets.animations.test, dt);

	gb.scene.update(gb.scene.current, dt);

	gb.gl_draw.rig_transforms(bob.rig);
}

function render()
{
	gl.render_draw_call(camera, surface_pass, true);
	//gl.render_draw_call(camera, debug_pass, false);
	gl.render_draw_call(lamp, lamp_pass, true);
	gl.render_draw_call(camera, shadow_pass, true)
	gl.render_post_call(lighting_pass);
	
	if(antialias === true)
	{
		gl.render_post_call(fxaa_pass);
	}
	else
	{
		gl.render_post_call(final_pass);
	}
}

window.addEventListener('load', init, false);