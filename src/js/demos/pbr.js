/*
TODO: 
- shadow mapping
- dds mipmaps
- basic sound
- mesh gen
- particles
*/

//INCLUDE gb.js
//INCLUDE stack.js
//INCLUDE time.js
//INCLUDE math.js
//INCLUDE serialize.js
//INCLUDE vector.js
//INCLUDE quaternion.js
//INCLUDE matrix.js
//INCLUDE rect.js
//INCLUDE aabb.js
//INCLUDE ray.js
//INCLUDE intersect.js
//INCLUDE color.js
//INCLUDE input.js
//INCLUDE animate.js
//INCLUDE gl/entity.js
//INCLUDE gl/lamp.js
//INCLUDE gl/camera.js
//INCLUDE gl/scene.js
//INCLUDE gl/mesh.js
//INCLUDE gl/mesh_tools.js
//INCLUDE gl/texture.js
//INCLUDE gl/dds.js
//INCLUDE gl/shader.js
//INCLUDE gl/material.js
//INCLUDE gl/rig.js
//INCLUDE gl/render_target.js
//INCLUDE gl/draw_call.js
//INCLUDE gl/webgl.js
//INCLUDE gl/asset_group.js
//DEBUG
//INCLUDE gl/draw.js
//INCLUDE gl/debug.js
//END

gb.init = init;
gb.update = update;

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var assets;
var assets_loaded;

var construct;
var pivot;
var camera;
var lamp;
var texture;
var sphere;
var anim;
var post;
var h_angle = 0;
var v_angle = 0;

var shadow_target;
var albedo_target;
var final_target;

var albedo_pass;
var lamp_pass;
var lighting_pass;
var fxaa_pass;

function init()
{
	assets_loaded = false;

	gb.frame_skip = true;

	var k = gb.Keys;
	gb.input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.one, k.two, k.three, k.up, k.down, k.left, k.right],
	});

	gl.init(document.querySelector('.container'),
	{
		width: 512,
		height: 512,
		resolution: 1,
		alpha: false,
	    depth: true,
	    stencil: false,
	    antialias: false,
	    premultipliedAlpha: false,
	    preserveDrawingBuffer: false,
	    preferLowPowerToHighPerformance: false,
	    failIfMajorPerformanceCaveat: false
	});

	//if(gl.extensions.dds !== null)
	assets = new gb.Asset_Group();
	gb.load_asset_group("assets.gl", assets, load_complete, load_progress);
}

function load_progress(e)
{
	var percent = e.loaded / e.total;
}
function load_complete(asset_group)
{
	gb.link_asset_group(asset_group, link_complete);	
}
function link_complete()
{
	construct = gb.scene.new();

	albedo_target = gb.render_target.new();
	shadow_target = gb.render_target.new();
	final_target = gb.render_target.new();

	gb.scene.load_asset_group(construct, assets);

	pivot = gb.entity.new();
	gb.scene.add(construct, pivot);

	camera = gb.scene.find(construct, 'camera').camera;
	gb.entity.set_parent(camera.entity, pivot);

	lamp = gb.scene.find(construct, 'lamp').camera;
	//gb.entity.set_parent(lamp.entity, pivot);

	/*
	anim = assets.animations.test;
	anim.target = sphere.rig.joints;
	anim.loops = -1;
	anim.is_playing = true;
	*/

	var albedo_material = gb.material.new(assets.shaders.surface);
	albedo_pass = gb.draw_call.new(camera, albedo_material, construct.entities); 
	lamp_pass = gb.draw_call.new(lamp, albedo_material, construct.entities);

	lighting_pass = gb.post_call.new(assets.shaders.vsm);
	lighting_pass.material.uniforms.normal_tex = albedo_target.color;
	lighting_pass.material.uniforms.camera_depth_tex = albedo_target.depth;
	lighting_pass.material.uniforms.lamp_depth_tex = shadow_target.depth;

	fxaa_pass = gb.post_call.new(assets.shaders.fxaa, true);
	fxaa_pass.material.uniforms.texture = final_target.color;
	fxaa_pass.material.uniforms.resolution = v3.tmp(gl.view.width, gl.view.height);
	fxaa_pass.material.uniforms.inv_resolution = v3.tmp(1.0 / gl.view.width, 1.0 / gl.view.height);

	assets_loaded = true;
}


function update(t)
{
	if(assets_loaded === false) return;

	var dt = gb.time.dt; 

	var view_speed = 30;
	if(gb.input.held(gb.Keys.left))
	{
		h_angle += view_speed * dt;
	}
	else if(gb.input.held(gb.Keys.right))
	{
		h_angle -= view_speed * dt;
	}
	if(gb.input.held(gb.Keys.up))
	{
		v_angle += view_speed * dt;
	}
	else if(gb.input.held(gb.Keys.down))
	{
		v_angle -= view_speed * dt;
	}
	gb.entity.set_rotation(pivot, v_angle, 0, h_angle);
	//sphere.dirty = true;

	gb.scene.update(construct);
	//gb.animation.update(anim, dt);

	gb.webgl.render_draw_call(albedo_pass, albedo_target, true);
	gb.webgl.render_draw_call(lamp_pass, shadow_target, true);

	gl.render_post_call(lighting_pass, final_target);
	gl.render_post_call(fxaa_pass, null);
}