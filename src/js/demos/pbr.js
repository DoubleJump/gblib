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

//INCLUDE dom/dom.js
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
var camera;
var texture;
var render_target;
var sphere;
var anim;
var post;

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

	gl.init(gb.dom.find('.container'),
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

	camera = gb.scene.find(construct, 'camera').camera;
	sphere = gb.scene.find(construct, 'cube');
	sphere.entity_type = gb.EntityType.RIG;
	sphere.rig = assets.rigs['armature'];
	qt.euler(sphere.rig.joints[1].rotation, -30,0,0);
	
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

	gb.scene.update(construct);

	gb.animation.update(anim, dt);

	gb.gl_draw.clear();
	
	gb.gl_draw.set_color(1,0,0,1);
	gb.gl_draw.line(v3.tmp(0,0,0), v3.tmp(10,0,0));
	
	gb.gl_draw.set_color(0,1,0,1);
	gb.gl_draw.line(v3.tmp(0,0,0), v3.tmp(0,10,0));

	gb.gl_draw.set_color(0,0,1,1);
	gb.gl_draw.line(v3.tmp(0,0,0), v3.tmp(0,0,10));

	gb.gl_draw.set_color(1,1,1,1);
	gb.gl_draw.rig(sphere.rig);

	sphere.dirty = true;

	gb.webgl.render_draw_call(draw_call);
	gb.webgl.render_draw_call(gb.gl_draw.draw_call);

	post_call.material.uniforms.tex = render_target.color;
	gl.render_post_call(post_call);
}