/*
TODO: 
- antialiasing
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
var rand = gb.random;
var math = gb.math;
var gl = gb.webgl;
var assets;
var assets_loaded;

var construct;
var pivot;
var camera;
var texture;
var sphere;
var anim;
var post;
var h_angle = 0;
var v_angle = 0;

var depth_normal_target;
var depth_normal_pass;
var albedo_target;
var albedo_pass;
var post_call;

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

	//depth_normal_target = gb.render_target.new(gl.view, gb.render_target.COLOR | gb.render_target.DEPTH);
	albedo_target = gb.render_target.new(gl.view, gb.render_target.COLOR | gb.render_target.DEPTH);

	gb.scene.load_asset_group(construct, assets);

	pivot = gb.entity.new();
	gb.scene.add(construct, pivot);

	camera = gb.scene.find(construct, 'camera').camera;
	gb.entity.set_parent(camera.entity, pivot);

	sphere = gb.scene.find(construct, 'cube');
	sphere.entity_type = gb.EntityType.RIG;
	sphere.rig = assets.rigs['armature'];
	
	anim = assets.animations.test;
	anim.target = sphere.rig.joints;
	anim.loops = -1;
	anim.is_playing = true;

	// TODO: create draw calls automatically
	//depth_normal_pass = gb.draw_call.new(true, camera, assets.materials.material, construct.entities);

	var albedo_material = gb.material.new(assets.shaders.albedo);
	albedo_pass = gb.draw_call.new(true, camera, albedo_material, construct.entities); 

	//DEBUG
	/*
	gb.gl_draw.init({buffer_size: 160000});
	gb.gl_draw.draw_call.camera = camera;
	gb.gl_draw.draw_call.target = render_target;
	*/
	//END

	var resolution = v3.tmp(albedo_target.color.width, albedo_target.color.height);
	var inv_resolution = v3.tmp(1.0 / albedo_target.color.width, 1.0 / albedo_target.color.height);

	post_call = gb.post_call.new(assets.shaders.fxaa, true);
	post_call.material.uniforms.texture = albedo_target.color;
	post_call.material.uniforms.resolution = resolution;
	post_call.material.uniforms.inv_resolution = inv_resolution;

	//post_call.material.uniforms.albedo = albedo_target.color;
	//post_call.material.uniforms.normal = depth_normal_target.color;
	//post_call.material.uniforms.depth = depth_normal_target.depth;

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
	sphere.dirty = true;

	gb.scene.update(construct);
	gb.animation.update(anim, dt);
	gb.webgl.render_draw_call(albedo_pass, albedo_target);
	//gb.webgl.render_draw_call(depth_normal_pass, depth_normal_target);
	/*
	gb.gl_draw.clear();
	gb.gl_draw.rig_transforms(sphere.rig);
	gb.webgl.render_draw_call(gb.gl_draw.draw_call);
	*/
	gl.render_post_call(post_call);
}