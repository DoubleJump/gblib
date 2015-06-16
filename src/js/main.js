'use strict';

/*
TODO: 
- split input by devices
- fire and forget animations
- pvrtc
- defered rendering
- basic sound
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
//INCLUDE intersect.js
//INCLUDE color.js
//INCLUDE camera.js
//INCLUDE time.js
//INCLUDE scene.js
//INCLUDE canvas.js
//INCLUDE webgl.js
//DEBUG
//INCLUDE gl_draw.js
//END
//INCLUDE audio.js
//INCLUDE input.js
//INCLUDE random.js
//INCLUDE asset_group.js

var focus = true;
var assets;
var alpha;
var camera;
var texture;
var shader;
var rotation;
var render_target;

var scene;
var bob;
var fred;
var bounds;

window.addEventListener('load', init, false);

var RenderGroup = function()
{
	//this.shader;
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
	/*
	var canvas = gb.new_canvas(gb.dom.find('.container'));
	gb.canvas.set_context(canvas);
	*/
	
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

	//document.body.addEventListener('touchmove', function(e) { e.preventDefault(); }, false); //scrolljack
	window.onfocus = on_focus;
	window.onblur = on_blur;

	//update_canvas(0);
}

function update_canvas(t)
{
	gb.canvas.circle(gb.vec3.tmp(100,100), 50);
	gb.canvas.stroke("#00ff00",5);
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
	scene = new gb.Scene();
	
	bob = gb.new_entity(assets.meshes.cube, scene);
	fred = gb.new_entity(assets.meshes.cube, scene);
	//bob.mesh.layout = gb.webgl.ctx.LINES;
	
	texture = assets.textures.dxt5;
	shader = assets.shaders.flat;

	camera = gb.new_camera();
	//camera.fov = 60;
	gb.scene.add_camera(scene, camera);

	render_group = new RenderGroup();
	render_group.entities.push(fred);
	render_group.entities.push(bob);

	rotation = 0;
	bounds = new gb.AABB();
	gb.mesh.get_bounds(bounds, bob.mesh);

	render_target = gb.new_render_target(gb.webgl.view, 1 | 2);
	requestAnimationFrame(upA);
}



function update(timestamp)
{
	// TODO register each stack to do this automatically
	gb.vec2.stack.index = 0;
	gb.vec3.stack.index = 0;
	gb.quat.stack.index = 0;
	gb.mat3.stack.index = 0;
	gb.mat4.stack.index = 0;
	gb.aabb.stack.index = 0;
	gb.color.stack.index = 0;
	gb.ray.stack.index = 0;
	gb.rect.stack.index = 0;

	/*
	var touch = gb.input.touches[0];
	if(touch.touching)
	{
		position.eq(gb.screen_to_world(camera, touch.position, gb.view));
	}
	*/

	rotation += 1.0 * gb.time.dt;

	gb.entity.set_position(bob, 0,0,-4.0);
	gb.entity.set_rotation(bob, rotation * 10, rotation * 30, rotation * 10);

	gb.entity.set_position(fred, 2.0,0,-2.0);
	gb.entity.set_rotation(fred, rotation * -10, rotation * -20, rotation * 10);

	gb.scene.update(scene);

	var t_bounds = gb.aabb.tmp();
	gb.aabb.eq(t_bounds, bounds);
	gb.aabb.transform(t_bounds, bob.world_matrix);

	gb.gl_draw.clear();
	gb.gl_draw.set_color(0.7,0.2,0.3,0.5);
	//gb.gl_draw.set_position(gb.vec3.tmp(0,0,-2.0));
	//gb.gl_draw.rect(gb.rect.tmp(-0.3,-0.3,0.6,0.6));
	//gb.gl_draw.line(gb.vec3.tmp(0,0,-2), gb.vec3.tmp(1,1,-2));
	//gb.gl_draw.circle(0.2, 32);
	//gb.gl_draw.transform(bob.world_matrix);
	//gb.gl_draw.set_position(bob.position);
	gb.gl_draw.bounds(t_bounds);
	//gb.gl_draw.sphere(0.2, 12,12);
	//gb.gl_draw.cube(1.36,0.5,1.0);
	//gb.gl_draw.cube(gb.aabb.width(t_bounds), gb.aabb.height(t_bounds), gb.aabb.depth(t_bounds));

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
	render(t);
	
	requestAnimationFrame(display);
}

function draw_objects(group, shader, camera)
{
	gb.webgl.set_shader(shader);

	var mvp = gb.mat4.tmp();
	var ne = group.entities.length;
	for(var i = 0; i < ne; ++i)
	{
		var e = group.entities[i];
		gb.webgl.link_attributes(shader, e.mesh);
		gb.mat4.mul(mvp, e.world_matrix, camera.view_projection);
		gb.webgl.set_shader_mat4(shader, "mvp", mvp);
		//gb.webgl.draw_mesh_elements(e.mesh);
		gb.webgl.draw_mesh_arrays(e.mesh);
	}
}

function render(t)
{
	var r = gb.webgl;

	r.set_render_target(render_target, true);
	draw_objects(render_group, shader, camera);
	gb.gl_draw.draw(camera);
}

function display(t)
{
	var r = gb.webgl;
	var s = r.screen_shader;
	var m = r.screen_mesh;
	
	r.ctx.disable(r.ctx.DEPTH_TEST);
	r.set_render_target(null);
	r.set_shader(s);
	r.link_attributes(s, m);
	r.set_shader_texture(s, "tex", render_target.color, 0);
	r.draw_mesh_elements(m);

	requestAnimationFrame(upA);
}