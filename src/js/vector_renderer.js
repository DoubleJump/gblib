function Vector()
{
	var r = {};

	r.camera = Perspective_Camera(app.view);
	r.ui_camera = UI_Camera(app.view);

	r.root = Entity(0,0,-3);

	return r;
}

function update_vector(r, dt)
{
	if(app.do_resize)
	{
		var view = app.view;
		set_vec3(r.ui_camera.position, view[2] / 2, view[3] / 2, 0);
		update_camera_projection(r.camera, view);
		update_camera_projection(r.ui_camera, view);
	}

	rotate_entity(r.root, _Vec3(dt * 15, dt * 20, dt * 30));

	update_entity(r.root);
	free_look(r.camera, dt, 80);
	update_camera(r.camera);
	update_camera(r.ui_camera);
}

function render_vector(r)
{
	var shaders = app.assets.shaders;
	var meshes = app.assets.meshes;
	var camera = r.camera;
	var m4 = _Mat4();
	var m3 = _Mat3();

	set_mvp(m4, r.root, camera);
	set_normal_matrix(m3, r.root, camera);

	set_viewport(camera.view);
	clear_screen();
	//disable_depth_testing();

	enable_alpha_blending();
	set_shader(shaders.normal);
	set_uniform('mvp', m4);
	set_uniform('normal_matrix', m3);
	draw_mesh(meshes.cube);

	if(app.debug_tools.mode === 'sizes')
	{
		draw_screen_sizes(r.ui_camera);
	}
}