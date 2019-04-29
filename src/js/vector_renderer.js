function Vector()
{
	var r = {};

	r.camera = Perspective_Camera(app.view);
	r.ui_camera = UI_Camera(app.view);

	update_camera_projection(r.camera, app.view);
	update_camera_projection(r.ui_camera, app.view);

	r.root = Entity(0,0,-3);

	
	var font = app.assets.fonts.noto_jp;
	font.atlas = app.assets.textures.noto_jp;
	var style = Text_Style(font);
	r.japanese = Text_Mesh(style, 'こんにちはÇéâêîôûàèùëïü');
	r.japanese.position[2] = -10;
	r.japanese.position[1] = 5;
	set_vec3(r.japanese.scale, 0.1,0.1,1.0);
	update_mesh(r.japanese.mesh);

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

	//rotate_entity(r.root, _Vec3(dt * 15, dt * 20, dt * 30));
	rotate_entity(r.root, _Vec3(0, 0, dt * 30));

	update_entity(r.root);
	update_entity(r.japanese);


	free_look(r.camera, dt, 80);
	update_camera(r.camera);
	update_camera(r.ui_camera);
}

function render_vector(r)
{
	var shaders = app.assets.shaders;
	var meshes = app.assets.meshes;
	var textures = app.assets.textures;
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
	//draw_mesh(meshes.cube);
	draw_mesh(meshes.pyramid);


	set_shader(shaders.text)
	mat4_mul(m4, r.japanese.world_matrix, camera.view_projection);
    set_uniform('mvp', m4);
    set_uniform('texture', r.japanese.style.font.atlas);
    draw_mesh(r.japanese.mesh);

    /*
    set_shader(shaders.texture);
    set_uniform('mvp', camera.view_projection);
    set_uniform('image', textures.boat);
    draw_mesh(meshes.pyramid);
    */

	if(app.debug_tools.mode === 'sizes')
	{
		draw_screen_sizes(r.ui_camera);
	}
}