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
//DEBUG
//INCLUDE debug.js
//END
//INCLUDE dom.js
//INCLUDE stack.js
//INCLUDE math.js
//INCLUDE serialize.js
//INCLUDE vector.js
//INCLUDE quaternion.js
//INCLUDE matrix.js
//INCLUDE rect.js
//INCLUDE aabb.js
//INCLUDE ray.js
//INCLUDE bezier.js
//INCLUDE intersect.js
//INCLUDE color.js
//INCLUDE camera.js
//INCLUDE time.js
//INCLUDE scene.js
//INCLUDE webgl.js
//DEBUG
//INCLUDE gl_draw.js
//END
//INCLUDE audio.js
//INCLUDE input.js
//INCLUDE random.js
//INCLUDE asset_group.js
//INCLUDE gl_sprite.js
//INCLUDE animate.js

gb.init = init;
gb.update = update;

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var rand = gb.random;
var math = gb.math;
var input = gb.input;
var scene = gb.scene;
var camera = gb.camera;
var entity = gb.entity;
var sprite = gb.sprite;
var anim = gb.animate;
var assets;
var assets_loaded;

var construct;
var viewer;
var texture;
var render_target;
var sphere;
var light_position; //change to enitity

var RenderGroup = function()
{
	this.shader;
	//this.textures = [null,null,null,null,null,null,null,null];
	this.entities = [];
}
var render_group;


function init()
{
	assets_loaded = false;

	var k = gb.Keys;
	gb.input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.one, k.two, k.three, k.up, k.down, k.left, k.right],
	});

	gb.audio.init();

	gb.webgl.init(gb.dom.find('.container'),
	{
		resolution: 1,
		alpha: false,
		depth: true,
		stencil: false,
		antialias: false,
		premultipliedAlpha: true,
		preserveDrawingBuffer: false,
	});

	//DEBUG
	gb.gl_draw.init({buffer_size: 4096});
	//END

	assets = new gb.Asset_Group();
	if(gb.webgl.extensions.dds !== null)
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
	render_target = gb.render_target.new(gb.webgl.view, 1 | 2);
	construct = scene.new();

	viewer = camera.new();
	entity.set_position(viewer.entity, 0,0,5);
	scene.add_camera(construct, viewer);

	sphere = entity.new();
	sphere.mesh = assets.meshes.sphere;
	scene.add_entity(construct, sphere);

	render_group = new RenderGroup();
	render_group.entities.push(sphere);
	render_group.shader = assets.shaders.pbr;

	light_position = v3.new(3,3,3);

	assets_loaded = true;
}


function update(t)
{
	if(assets_loaded === false) return;

	var dt = gb.time.dt; 

	gb.gl_draw.clear();

	scene.update(construct);

	if(input.held(gb.Keys.left))
	{
		light_position[0] -= dt;
	}	
	else if(input.held(gb.Keys.right))
	{
		light_position[0] += dt;
	}

	if(input.held(gb.Keys.up))
	{
		light_position[1] += dt;
	}	
	else if(input.held(gb.Keys.down))
	{
		light_position[1] -= dt;
	}

	if(input.held(gb.Keys.z))
	{
		light_position[2] += dt;
	}	
	else if(input.held(gb.Keys.x))
	{
		light_position[2] -= dt;
	}


	gb.gl_draw.line(v3.tmp(0,0,0), light_position);

	render_to(render_target);
	display(render_target);
}

function draw_group(group, cam)
{
	var r = gb.webgl;
	var s = group.shader;
	r.set_shader(s);

	var mvp = m4.tmp();
	var ne = group.entities.length;
	for(var i = 0; i < ne; ++i)
	{
		var e = group.entities[i];
		r.link_attributes(s, e.mesh);
		m4.mul(mvp, e.world_matrix, cam.view_projection);
		
		r.set_shader_mat4(s, "proj_matrix", cam.projection);
		r.set_shader_mat4(s, "view_matrix", cam.view);
		r.set_shader_mat4(s, "model_matrix", e.world_matrix);
		r.set_shader_mat3(s, "normal_matrix", cam.normal);
		r.set_shader_vec3(s, "light_position", light_position);

		//r.set_shader_mat4(s, "mvp", mvp);
		r.set_shader_texture(s, "tex", assets.textures.orange, 0);
		r.draw_mesh_elements(e.mesh);
		//r.draw_mesh_arrays(e.mesh);
	}
}

function render_to(target)
{
	var r = gb.webgl;

	r.set_render_target(target, true);
	draw_group(render_group, viewer);
	gb.gl_draw.draw(viewer);
}

function display(target)
{
	var r = gb.webgl;
	var s = r.screen_shader;
	var m = r.screen_mesh;
	
	r.ctx.disable(r.ctx.DEPTH_TEST);
	r.set_render_target(null);
	r.set_shader(s);
	r.link_attributes(s, m);
	r.set_shader_texture(s, "tex", target.color, 0);
	r.draw_mesh_elements(m);
}