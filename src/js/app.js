function init()
{
    var assets = app.assets;
    bind_assets(assets);

    assets.meshes.screen_quad = quad_mesh(2,2);
    app.gl_draw = GLDraw(16000, assets.shaders.basic);

    app.root = Entity(null);

    // CAMERA
    app.camera = Camera(0.01, 50, 60, app.view);
    set_vec3(app.camera.position, 0,0,1);

    app.ellipse = line_mesh_ellipse(1.0, 1.0, 30);
    set_parent(app.ellipse, app.root);

    app.label = TextMesh(assets.fonts.bebas, 'Text');
    set_parent(app.label, app.root);

    // UI
    /*
    app.ui_root = Entity(null);
    app.ui_camera = UICamera(app.view);
    app.ui_draw = GLDraw(16000, assets.shaders.basic);
    */

    set_clear_color(0.0, 0.0, 0.0, 1.0);
    set_viewport(app.view);
    clear_stacks();
    requestAnimationFrame(update);
}


function update(t)
{
    set_time(app.time, t);
    requestAnimationFrame(update);

    if(app.time.paused === true || 
        app.has_focus === false || 
        app.assets_loaded === false)
    {
        return;
    }

    var dt = app.time.dt;
    


    free_look(app.camera, dt, 80);
    update_camera(app.camera);
    update_entity(app.root, true);

    //update_entity(app.ui_root, true);
    //update_camera(app.ui_camera);

    render();
    //render_ui();
    
    update_input();
    clear_stacks();
    verify_webgl_context();
}

function render()
{
    var shaders = app.assets.shaders;
    var meshes = app.assets.meshes;
    var textures = app.assets.textures;
    var camera = app.camera;
    var mvp = _Mat4();
    var aspect = app.view[2] / app.view[3];

    clear_screen();
    //set_blend_mode(BlendMode.DEFAULT);
    //enable_depth_testing();

    /*
    use_shader(shaders.doh);
    set_uniform('mvp', camera.view_projection);
    draw_mesh(shaders.doh, meshes.screen_quad);
    */

    draw_line_mesh(app.ellipse, shaders.line, camera);
    draw_text(app.label, shaders.text, camera);

    /*
    var ctx = app.gl_draw;
    set_vec4(ctx.color, 1,0,0,1.0);
    draw_line(ctx, _Vec3(0,0,0),_Vec3(1,0,0));
    draw_line(ctx, _Vec3(0,0,0),_Vec3(0,1,0));
    draw_line(ctx, _Vec3(0,0,0),_Vec3(0,0,1));
    render_gl_draw(ctx, camera);
    */
}

function render_ui()
{

}