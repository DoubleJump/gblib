gb.init = init;
gb.update = update;

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var scene = gb.scene;
var assets;
var assets_loaded;

var construct;
var anim;
var surface_pass;
var scene_target;
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
	});

	//if(gl.extensions.dds !== null)
	assets = new gb.Asset_Group();
	gb.assets.load("assets.gl", assets, load_complete, load_progress);
}

function load_progress(e)
{
	var percent = e.loaded / e.total;
	LOG('Loaded: ' + e.loaded + ' / ' + e.total + ' bytes');
}
function load_complete(asset_group)
{
	construct = scene.new(assets);
	scene.current = construct;
	scene_target = gb.render_target.new();

	anim = assets.animations.shift;
	anim.target = scene.find('cube');
	anim.loops = -1;
	//anim.time_scale = 4.0;
	anim.is_playing = true;

	// TODO: scene context for things like find and add
	surface_pass = gb.draw_call.new(scene.find('camera').camera, assets.materials.material, construct.entities); 

	fxaa_pass = gb.post_call.new(assets.shaders.fxaa, true);
	fxaa_pass.material.uniforms.texture = scene_target.color;
	fxaa_pass.material.uniforms.resolution = v3.tmp(gl.view.width, gl.view.height);
	fxaa_pass.material.uniforms.inv_resolution = v3.tmp(1.0 / gl.view.width, 1.0 / gl.view.height);

	assets_loaded = true;
}


function update(dt)
{
	if(assets_loaded === false) return;

	gb.scene.update(construct);
	gb.animation.update(anim, dt);

	gb.webgl.render_draw_call(surface_pass, scene_target, true);
	gl.render_post_call(fxaa_pass, null);
}