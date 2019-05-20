function HoloPlay(camera, focal_point, constant_center)
{
    var r = {};

    r.hi_res = true;
    r.hold_center = true; 
    r.focal_point = Vec3();
    r.tiles_x = 4; 
    r.tiles_y = 8;
    r.resolution = 2048;
    r.pitch: 49.825218200683597;
    r.slope: 5.2160325050354;
    r.center: -0.23396748304367066;
    r.inv_view: 1.0;
    r.dpi: 338.0;
    r.screen_w: 2560.0;
    r.screen_h: 1600.0;
    r.camera = camera;

    if(r.hi_res)
    {
        r.resolution = 4096;
        r.tiles_x = 5;
        r.tiles_y = 9;
    }

    vec_eq(r.focal_point, focal_point);
    r.view_scale = Math.max(vec_distance(r.focal_point, camera.position), 1);

    r.render_target = Render_Target(Vec4(0,0, r.resolution, r.resolution));

    r.num_views = r.tiles_x * r.tiles_y;
    var render_size_x = r.resolution / r.tiles_x;
    var render_size_y = r.resolution / r.tiles_y;
    r.cameras = new Array(r.num_views);
    var nc = 0;
    for(var y = 0; y < r.tiles_y; y++)
    {
        for(var x = 0; x < r.tiles_x; x++) 
        {
            var sub_view = Vec4(x * render_size_x, y * render_size_y, render_size_x, render_size_y)
            r.cameras[nc] = Perspective_Camera(0.1,100,60, sub_view);
            nc++;
        }
    }

    r.ui_cam = UI_Camera(app.view);

    return r;
}
        
function render_holo_cube(r)
{
    var camera_right = _Vec3(1,0,0);
    rotate_vector(camera_right, camera_right, r.camera.rotation);

    var dist = vec_dist(r.focal_point, r.camera.position);
    r.camera.near = 0.01 * dist / r.view_scale;
    r.camera.far = 100 * dist / r.view_scale;
    update_camera_projection(r.camera);
    
    var start = -r.view_cone / 2;
    var end = r.view_cone / 2;
    var distance = vec_distance(r.focal_point, r.camera.position);
    var size = 2 * distance * Math.tan(0.5 * r.camera.fov * DEG2RAD);

    var offset = _Vec3();
    for(var i = 0; i < r.num_views; i++)
    {
        var sub_cam = r.cameras[i];
        vec_eq(sub_cam.position, r.camera.position);
        vec_eq(sub_cam.rotation, r.camera.rotation);

        var radians = lerp(start, end, i/(r.num_views - 1)) * DEG2RAD;
        var offset_x = distance * Math.tan(radians);

        vec_mulf(offset, camera_right * offset_x);
        vec_add(sub_cam.position, sub_cam.position, offset);

        update_entity(sub_cam);

        vec_eq(sub_cam.projection, r.camera.projection);
        sub_cam.projection[8] = -2 * offset_x / (size * r.camera.aspect);
    }

    set_shader(app.assets.shaders.holocube);
    set_uniform('pitch', r.pitch);
    set_uniform('tilt', r.tilt);
    set_uniform('center', r.center);
    set_uniform('sub_p', 1 / (r.screen_w * 3));
    set_uniform('inv_view', r.inv_view);
    set_uniform('tiles_x', r.tiles_x);
    set_uniform('tiles_y', r.tiles_y);

    set_render_target(r.render_target);
    for(var i = 0; i < r.cameras.length; ++i) render(r.cameras[i]);
   
    set_render_target(null);
    render(r.ui_cam);
};

function request_fullscreen()
{
    var root = document.body;
    if(root.requestFullscreen) root.requestFullscreen();
    else if(root.mozRequestFullScreen) root.mozRequestFullScreen();
    else if(root.webkitRequestFullscreen) root.webkitRequestFullscreen();
    else if(root.msRequestFullscreen) root.msRequestFullscreen();
}
