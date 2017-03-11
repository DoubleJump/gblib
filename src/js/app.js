function init()
{
    var assets = app.assets;
    bind_assets(assets);

    assets.meshes.screen_quad = quad_mesh(2,2);
    app.gl_draw = GLDraw(16000);

    app.root = Entity(null);

    // CAMERA
    app.camera = Camera(0.01, 50, 60, app.view);
    set_vec3(app.camera.position, 0,0,1);

    app.ellipse = line_mesh_ellipse(1.0, 1.0, 30);
    set_parent(app.ellipse, app.root);

    // ASYNC VIDEO
    //app.video = load_video_async('../../assets/bbb.mp4', 960, 540, app.sampler, TextureFormat.RGBA, true, true);

    // MAIN OBJECT
    app.monkey = Entity(0,0,0, app.root);

    // TEXT

    var copy = "Apparently we had reached a great height in the atmosphere, for the sky was a dead black, and the stars had ceased to twinkle. By the same illusion which lifts the horizon of the sea to the level of the spectator on a hillside, the sable cloud beneath was dished out, and the car seemed to float in the middle of an immense dark sphere, whose upper half was strewn with silver. Looking down into the dark gulf below, I could see a ruddy light streaming through a rift in the clouds.";
    
    app.text_style = TextStyle(assets.fonts.share_tech_mono);
    app.display_text = TextMesh(app.text_style, copy);
    update_text_mesh(app.display_text);
    set_parent(app.display_text, app.root);

    // UI
    app.ui_root = Entity(null);
    app.ui_camera = UICamera(app.view);

    app.db_view = DebugView(app.view, 4096);
    app.db_group = DebugGroup(app.db_view, 'Controls', 0,0);
    app.label = UI_Label('Label', '', app.db_group);
    app.slider = UI_Slider('Slider', 0, 10, _Vec3(0,0,0), app.db_group);
    app.slider_b = UI_Slider('Other', 0, 10, 0, app.db_group);
    app.toggle = UI_Toggle('Toggle', true, app.db_group);

    app.curve = Curve(2, new Float32Array([0,0, 0,0, 0.5,0, 0.5,1, 1,1, 1,1]));
    app.ui_curve = UI_Curve('curve', app.curve, app.db_group);

    // RENDER TARGET
    //app.render_target = RenderTarget(app.view, app.sampler);
    

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

    update_entity(app.ui_root, true);
    update_camera(app.ui_camera);

    render();
      
    update_input();
    clear_stacks();

    //DEBUG
    verify_webgl_context();
    //END
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
    set_blend_mode(BlendMode.DEFAULT);
    enable_depth_testing();

    // IMPORTED MESH
    /*
    if(app.video.loaded === true)
    {
        update_texture(app.video);
        use_shader(shaders.monkey);
        set_mvp(mvp, app.monkey, camera);
        set_uniform('mvp', mvp);
        set_uniform('video', app.video);
        draw_mesh(meshes.monkey);
    }
    */
    // LINE

    draw_line_mesh(app.ellipse, shaders.line, camera);

    // TEXT

    disable_depth_testing();
    draw_text(app.display_text, shaders.text, camera);

    // GL DRAW

    var ctx = app.gl_draw;
    set_vec4(ctx.color, 1.0,0.0,0.0,1.0);
    draw_line(ctx, _Vec3(0,0,0), _Vec3(1,0,0));
    
    set_vec4(ctx.color, 0.0,1.0,0.0,1.0);
    draw_line(ctx, _Vec3(0,0,0), _Vec3(0,1,0));
    
    set_vec4(ctx.color, 0.0,0.0,1.0,1.0);
    draw_line(ctx, _Vec3(0,0,0), _Vec3(0,0,1));
    render_gl_draw(ctx, app.camera);
    
    // UI

    update_debug_view(app.db_view, app.view);
    render_debug_view(app.db_view, app.ui_camera);
}