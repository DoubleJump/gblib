gb.init = init;
gb.update = update;

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
var lamp_pass;
var shadow_pass;
var lighting_pass;
var fxaa_pass;
var final_pass;
var antialias = false;

function init()
{
	assets_loaded = false;

	gb.frame_skip = true;

	var k = gb.Keys;
	input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.one, k.two, k.three, k.up, k.down, k.left, k.right],
	});

	gl.init(document.querySelector('.container'),
	{
		width: 512,
		height: 512,
	});

	assets = new gb.Asset_Group();
	gb.assets.load("assets.gl", assets, load_complete);
}
function load_complete(asset_group)
{
	construct = scene.new(assets);
	scene.current = construct;
	
	assets.materials.material.alpha = 1.0;
	gb.animation.play(assets.animations.shift, -1);
	//gb.animation.play(assets.animations.matanim, -1);

	var camera = scene.find('camera').camera;
	var lamp = scene.find('shadowcam').camera;

	scene.find('plane').material.alpha = 1.0;


	// draw color and alpha
	var surface_target = gb.render_target.new();
	surface_pass = gb.draw_call.new(camera, construct.draw_items, null, surface_target);

	// draw normals and depth
	/*
	depth_normal_target = gb.render_target.new();
	depth_normal_pass = gb.draw_call.new(camera, 
										 construct.draw_items, 
										 gb.material.new(assets.shaders.depth_normal, 'depth_normal'), 
										 depth_normal_target);
	*/

	// draw shadows
	var lamp_target = gb.render_target.new();
	lamp_pass = gb.draw_call.new(lamp, 
								 construct.draw_items, 
								 gb.material.new(assets.shaders.surface), 
								 lamp_target);


	var shadow_target = gb.render_target.new();
	shadow_pass = gb.draw_call.new(camera, construct.draw_items, gb.material.new(assets.shaders.shadow), shadow_target); 
	shadow_pass.material.lamp_depth_map = lamp_target.depth;
	shadow_pass.material.lamp_matrix = lamp.view_projection;

	var lighting_target = gb.render_target.new();
	lighting_pass = gb.post_call.new(gb.material.new(assets.shaders.lighting), lighting_target);
	lighting_pass.material.surface_map = surface_target.color;
	lighting_pass.material.shadow_map = shadow_target.color;
	
	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = lighting_target.color;
	fxaa_pass.material.resolution = v3.tmp(gl.view.width, gl.view.height);
	fxaa_pass.material.inv_resolution = v3.tmp(1.0 / gl.view.width, 1.0 / gl.view.height);

	final_pass = gb.post_call.new(gb.material.new(assets.shaders.final), null);
	final_pass.material.texture = lamp_target.depth;
	//final_pass.material.texture = lighting_target.color;

	assets_loaded = true;
}


function update(dt)
{
	if(assets_loaded === false) return;

	scene.update(construct, dt);

	if(input.down(gb.Keys.left))
	{
		//gb.animation.play(assets.animations.shift, -1);
		//gb.animation.play(assets.animations.matanim, -1);
		antialias = !antialias;
	}

	gl.render_draw_call(surface_pass, true);
	gl.render_draw_call(lamp_pass, true);
	gl.render_draw_call(shadow_pass, true)
	gl.render_post_call(lighting_pass);
	if(antialias === true)
	{
		gl.render_post_call(fxaa_pass);
	}
	else
	{
		gl 	.render_post_call(final_pass);
	}
}