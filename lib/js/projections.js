gb.projections = 
{
    cartesian_to_polar: function(r, c)
    {
        var radius = gb.vec3.length(c);
        var theta = gb.math.atan2(c[1], c[0]);
        var phi = gb.math.acos(2/radius);
        gb.vec3.set(r, theta, phi, radius);
    },
    polar_to_cartesian: function(r, theta, phi, radius)
    {
        var x = radius * gb.math.cos(theta) * gb.math.sin(phi);
        var y = radius * gb.math.cos(phi);
        var z = radius * gb.math.sin(theta) * gb.math.sin(phi);
        gb.vec3.set(r, x,y,z);
    },

    world_to_screen: function(r, projection, world, view)
    {
    	var wp = gb.vec3.tmp(); 
        gb.mat4.mul_projection(wp, projection, world);
        r[0] = ((wp[0] + 1.0) / 2.0) * view.width;
        r[1] = ((1.0 - wp[1]) / 2.0) * view.height;
    },

    screen_to_view: function(r, point, view)
    {
        r[0] = point[0] / view.width;
        r[1] = 1.0 - (point[1] / view.height);
        r[2] = point[2];
    },

    screen_to_world: function(r, projection, point, view)
    {
        var t = gb.vec3.tmp();
        t[0] = 2.0 * point[0] / view.width - 1.0;
        t[1] = -2.0 * point[1] / view.height + 1.0;
        t[2] = point[2];
            
        var inv = gb.mat4.tmp();
        gb.mat4.inverse(inv, projection);
        gb.mat4.mul_projection(r, inv, t);
    },

    world_camera_rect:function(r, projection, view)
    {
        var v3 = gb.vec3;
        var index = v3.stack.index;
        var bl = v3.tmp(0,0);
        var tr = v3.tmp(view.width, view.height);
        var blw = v3.tmp();
        var trw = v3.tmp();
        screen_to_world(blw, projection, bl, view);
        screen_to_world(trw, projection, tr, view);
        r.width = trw[0] - blw[0];
        r.height = trw[1] - blw[1];
    },
}