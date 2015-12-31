//INCLUDE projects/basic/js/gblib.js
//INCLUDE lib/js/gl/fps_camera.js

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var input = gb.input;
var scene = gb.scene;
var plane;
var camera;
var surface_target;
var fxaa_pass;
var debug_view;

function init()
{
	gb.init(
	{
		config:
		{
			frame_skip: false,
			update: update, 
			debug_update: debug_update,
			render: render,
		}
	});
	gb.assets.load("assets/assets.gl", load_complete);

}

function load_complete(ag)
{
	debug_view = gb.debug_view.new(document.body);

	scene.current = scene.scenes['basic'];

	plane = scene.find('plane');
	gb.mesh.set_vertex(plane.mesh, 'position', 0, gb.vec3.tmp(0,0,0));
	gb.mesh.update(plane.mesh);
	plane.material = gb.material.new(ag.shaders.basic);
	plane.material.diffuse = ag.textures.orange;
	gb.animation.play(ag.animations.planeaction, -1);

	camera = gb.camera.new();
	camera.entity.position[2] = 2.0;
	scene.add(camera);

	gb.debug_view.watch(debug_view, 'AngleX', camera, 'angle_x');
	gb.debug_view.watch(debug_view, 'AngleY', camera, 'angle_y');


	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(ag.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);

	gb.allow_update = true;
}

function update(dt)
{
	gb.camera.fly(camera, dt, 80);
}

function debug_update(dt)
{
	gb.debug_view.update(debug_view);
	gb.gl_draw.thickness = 3.0;
	gb.gl_draw.line(v3.tmp(0,0,0), v3.tmp(3,3,3));
	gb.gl_draw.wire_mesh(plane.mesh, plane.world_matrix);
}

function render()
{
	//gl.render_draw_call(s.active_camera, s, s.draw_items, s.num_draw_items, null, surface_target, true, true);
	gl.render_scene(scene.current, camera, surface_target);
	gb.gl_draw.render(camera, surface_target);
	gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);

