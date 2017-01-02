function perspective_projection(m, n,f,aspect,fov)
{
    mat4_identity(m);

    var h = 1.0 / Math.tan(fov * PI_OVER_360);
    var y = n - f;
    
    m[ 0] = h / aspect;
    m[ 5] = h;
    m[10] = (f + n) / y;
    m[11] = -1.0;
    m[14] = 2.0 * (n * f) / y;
    m[15] = 1.0;
}

function ortho_projection(m, w,h,n,f)
{
    mat4_identity(m);
    
    m[ 0] = 2.0 / w;
    m[ 5] = 2.0 / h;
    m[10] = -2.0 / (f - n);
    m[11] = -n / (f - n);
    m[15] = 1.0;
}

function cartesian_to_polar(r, c)
{
    var radius = vec_length(c);
    var theta = Math.atan2(c[1], c[0]);
    var phi = Math.acos(2 / radius);
    set_vec3(r, theta, phi, radius);
}

function polar_to_cartesian(r, a, b, radius)
{
    var ar = a * DEG2RAD;
    var br = b * DEG2RAD;

    var x = radius * Math.cos(br) * Math.cos(ar);
    var y = radius * Math.sin(br);
    var z = radius * Math.cos(br) * Math.sin(ar);
    set_vec3(r, x,y,z);
}

function lng_lat_to_cartesian(r, lng, lat, radius)
{
    polar_to_cartesian(r, -lng + 90, lat, radius);
}

function world_to_screen(r, projection, world, view)
{
	var wp = _Vec3(); 
    mat4_mul_projection(wp, projection, world);
    r[0] = ((wp[0] + 1.0) / 2.0) * view[2];
    r[1] = ((1.0 - wp[1]) / 2.0) * view[3];
    vec3_stack.index--;
}

function screen_to_view(r, point, view)
{
    r[0] = point[0] / view[2];
    r[1] = 1.0 - (point[1] / view[3]);
    r[2] = point[2];
}

function screen_to_world(r, projection, point, view)
{
    var t = _Vec3();
    t[0] =  2.0 * point[0] / view[2] - 1.0;
    t[1] = -2.0 * point[1] / view[3] + 1.0;
    t[2] = point[2];

    var inv = _Mat4();
    mat4_inverse(inv, projection);
    mat4_mul_projection(r, inv, t);

    mat4_stack.index--;
    vec3_stack.index--;
}

function world_camera_rect(r, projection, view)
{
    var index = vec3_stack.index;

    var bl  = _Vec3();
    var tr  = _Vec3(view[2], view[3]);
    var blw = _Vec3();
    var trw = _Vec3();

    screen_to_world(blw, projection, bl, view);
    screen_to_world(trw, projection, tr, view);

    r[2] = trw[0] - blw[0];
    r[3] = trw[1] - blw[1];

    vec3_stack.index = index;
}