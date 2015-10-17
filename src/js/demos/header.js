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
//INCLUDE audio.js
//INCLUDE vector.js
//INCLUDE quaternion.js
//INCLUDE matrix.js
//INCLUDE rect.js
//INCLUDE aabb.js
//INCLUDE ray.js
//INCLUDE bezier.js
//INCLUDE intersect.js
//INCLUDE color.js
//INCLUDE random.js
//INCLUDE input.js
//INCLUDE animate.js
//INCLUDE gl/camera.js
//INCLUDE gl/scene.js
//INCLUDE gl/mesh.js
//INCLUDE gl/mesh_tools.js
//INCLUDE gl/texture.js
//INCLUDE gl/dds.js
//INCLUDE gl/shader.js
//INCLUDE gl/render_target.js
//INCLUDE gl/webgl.js
//INCLUDE gl/asset_group.js
//INCLUDE gl/sprite.js
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
var post;
var light_position; //change to enitity


var draw_call;
var post_call;

function init()
{
	assets_loaded = false;

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

	//DEBUG
	gb.gl_draw.init({buffer_size: 4096});
	//END

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
	render_target = gb.render_target.new(gl.view, 1 | 2);
	construct = gb.scene.new();

	camera = gb.camera.new();
	gb.entity.set_position(camera.entity, 0,0,2);
	gb.scene.add_camera(construct, camera);

	gl.set_clear_color(0.352, 0.129, 0.58, 1.0);

	// TODO: create draw calls automatically
	draw_call = new gb.DrawCall();
	draw_call.clear = true;
	draw_call.camera = camera;
	draw_call.entity = sphere;
	draw_call.target = render_target;
	draw_call.material = gb.material.new(assets.shaders.pbr);

	post_call = new gb.PostCall();
	post_call.mesh = gb.mesh.generate.quad(2,2);
	post_call.material = gb.material.new(assets.shaders.screen);
	assets_loaded = true;
}


function update(t)
{
	if(assets_loaded === false) return;

	var dt = gb.time.dt; 

	gb.gl_draw.clear();

	gb.scene.update(construct);

	//MODIFY MESH FOR LULZ

	if(gb.input.held(gb.Keys.left))
	{
		light_position[0] -= dt;
	}	
	else if(gb.input.held(gb.Keys.right))
	{
		light_position[0] += dt;
	}

	if(gb.input.held(gb.Keys.up))
	{
		light_position[1] += dt;
	}	
	else if(gb.input.held(gb.Keys.down))
	{
		light_position[1] -= dt;
	}

	if(gb.input.held(gb.Keys.z))
	{
		light_position[2] += dt;
	}	
	else if(gb.input.held(gb.Keys.x))
	{
		light_position[2] -= dt;
	}

	//need a draw call for debug draw
	//gb.gl_draw.line(v3.tmp(0,0,0), light_position);

	draw_call.material.uniforms.light_position = light_position;
	
	gb.webgl.render_draw_call(draw_call);

	post_call.material.uniforms.tex = render_target.color;
	gl.render_post_call(post_call);
}