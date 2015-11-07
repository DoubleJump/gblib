/*
TODO: 
- dds mipmaps
- deferred rendering
- PBR
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
//INCLUDE random.js
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
var render_target;
var sphere;
var anim;
var post;
var h_angle = 0;
var v_angle = 0;

var draw_call;
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
		width: 1024,
		height: 576,
		resolution: 1,
		alpha: false,
	    depth: true,
	    stencil: false,
	    antialias: true,
	    premultipliedAlpha: false,
	    preserveDrawingBuffer: false,
	    preferLowPowerToHighPerformance: false,
	    failIfMajorPerformanceCaveat: false
	});

	assets = new gb.Asset_Group();
	if(gl.extensions.dds !== null)
	{
		gb.load_asset_group("assets.gl", assets, load_complete, load_progress);
	}
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
	render_target = gb.render_target.new(gl.view, gb.render_target.COLOR | gb.render_target.DEPTH);
	construct = gb.scene.new();
	//var world_rotation = gb.quat.new();
	//qt.euler(world_rotation, 0,0,90);
	//m4.set_rotation(construct.world_matrix, world_rotation);

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
	//light_position = v3.new(3,3,3);

	// TODO: create draw calls automatically
	draw_call = new gb.DrawCall();
	draw_call.clear = true;
	draw_call.camera = camera;
	draw_call.entities = construct.entities;
	draw_call.target = render_target;
	draw_call.material = assets.materials.material;

	//DEBUG
	gb.gl_draw.init({buffer_size: 160000});
	gb.gl_draw.draw_call.camera = camera;
	gb.gl_draw.draw_call.target = render_target;
	//END

	post_call = new gb.PostCall();
	post_call.mesh = gb.mesh.generate.quad(2,2);
	post_call.material = gb.material.new(assets.shaders.screen);
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
	gb.webgl.render_draw_call(draw_call);

	gb.gl_draw.clear();
	gb.gl_draw.rig_transforms(sphere.rig);
	//gb.gl_draw.rig(sphere.rig);
	gb.webgl.render_draw_call(gb.gl_draw.draw_call);

	post_call.material.uniforms.tex = render_target.color;
	gl.render_post_call(post_call);
}