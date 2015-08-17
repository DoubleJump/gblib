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
var rotation;
var nutmeg;
var render_target;
var animA;
var curve;

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
	scene.add_camera(construct, viewer);

	nutmeg = sprite.new(assets.textures.nutmeg, 16,18);
	scene.add_sprite(construct, nutmeg);
    gb.webgl.link_mesh(nutmeg.entity.mesh);
	sprite.set_animation(nutmeg, 0, 4, 4, -1);

	render_group = new RenderGroup();
	render_group.entities.push(nutmeg.entity);
	render_group.shader = assets.shaders.textured;

	curve = gb.bezier.clamped(0.3,0.0,0.8,1.0);

	animA = anim.new(nutmeg.entity.scale, v3.lerp, null);
	anim.add_frame(animA, v3.new(1,1,1), 0.0, curve);
	anim.add_frame(animA, v3.new(2,2,1), 1.0, null);
	anim.add_frame(animA, v3.new(0.5,0.5,1), 1.5, curve);

	rotation = 0;

	assets_loaded = true;
}


function update(timestamp)
{
	if(assets_loaded === false) return;

	rotation += 1.0 * gb.time.dt;

	entity.set_position(viewer.entity, 0,0,8);

	if(gb.input.down(gb.Keys.mouse_left))
	{
		anim.loop(animA);
		sprite.play(nutmeg);
	}

	scene.update(construct);
	anim.update(gb.time.dt);

	//gb.gl_draw.wire_mesh(nutmeg.entity.mesh, nutmeg.entity.world_matrix);

	render(render_target);
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
		r.set_shader_mat4(s, "mvp", mvp);
		r.set_shader_texture(s, "tex", assets.textures.nutmeg, 0);
		r.draw_mesh_elements(e.mesh);
		//r.draw_mesh_arrays(e.mesh);
	}
}

function render(target)
{
	var r = gb.webgl;

	gb.gl_draw.clear();
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