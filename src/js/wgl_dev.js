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
//INCLUDE sprite.js
//INCLUDE animate.js


var v3 = gb.vec3;
var scene = gb.scene;
var camera = gb.camera;
var entity = gb.entity;
var sprite = gb.sprite;
var assets;

var focus = true;
var alpha;

var construct;
var viewer;
var texture;
var rotation;
var nutmeg;
var render_target;
var anim;
var curve;



window.addEventListener('load', init, false);

var RenderGroup = function()
{
	this.shader;
	//this.textures = [null,null,null,null,null,null,null,null];
	this.entities = [];
}
var render_group;


function init()
{
	gb.time.init();
	gb.input.init(document,
	{
		keycodes: [0,1],
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

	window.onfocus = on_focus;
	window.onblur = on_blur;
}

function on_focus(e)
{
	console.log('focus');
	focus = true;
}
function on_blur(e)
{
	console.log('blur');
	focus = false;
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

	nutmeg = gb.sprite.new(assets.textures.nutmeg, 16,18);
	scene.add_sprite(construct, nutmeg);
    gb.webgl.link_mesh(nutmeg.entity.mesh);
	sprite.set_animation(nutmeg, 0, 4, 3, -1);

	render_group = new RenderGroup();
	render_group.entities.push(nutmeg.entity);
	render_group.shader = assets.shaders.textured;

	curve = gb.bezier.clamped(0.3,0.0,0.8,1.5);
	anim = gb.animate.from_to(v3.new(1,1,1), v3.new(2,2,-3), nutmeg.entity.scale, 1.0, curve, v3.lerp, null);

	rotation = 0;

	requestAnimationFrame(upA);
}



function update(timestamp)
{
	gb.stack.clear_all();

	rotation += 1.0 * gb.time.dt;

	entity.set_position(viewer.entity, 0,0,8);

	if(gb.input.down(0))
	{
		gb.animate.play(anim);
		sprite.play(nutmeg);
	}

	scene.update(construct);
	gb.animate.update(gb.time.dt);

	gb.gl_draw.clear();
	//gb.gl_draw.wire_mesh(nutmeg.entity.mesh, nutmeg.entity.world_matrix);

	gb.input.update();
}


function upA(t)
{
	gb.time.update(t);
	if(gb.time.paused || focus === false)
	{
		requestAnimationFrame(upA);
		return;
	}

	update(t);
	render(render_target);
	display(render_target);
	requestAnimationFrame(upB);
}
function upB(t)
{
	gb.time.update(t);
	if(gb.time.paused || focus === false)
	{
		requestAnimationFrame(upB);
		return;
	}

	update(t);
	render(render_target);
	display(render_target);
	requestAnimationFrame(upA);
}


function draw_group(group, cam)
{
	var r = gb.webgl;
	var s = group.shader;
	r.set_shader(s);

	var mvp = gb.mat4.tmp();
	var ne = group.entities.length;
	for(var i = 0; i < ne; ++i)
	{
		var e = group.entities[i];
		r.link_attributes(s, e.mesh);
		gb.mat4.mul(mvp, e.world_matrix, cam.view_projection);
		r.set_shader_mat4(s, "mvp", mvp);
		r.set_shader_texture(s, "tex", assets.textures.nutmeg, 0);
		r.draw_mesh_elements(e.mesh);
		//r.draw_mesh_arrays(e.mesh);
	}
}

function render(target)
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