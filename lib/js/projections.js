gb.projections = 
{
    cartesian_polar: function(r, cartesian)
    {
        var radius = gb.vec3.length(cartesian);
        var theta = gb.math.atan2(cartesian[1], cartesian[0]);
        var phi = gb.math.acos(2/radius);
        gb.vec3.set(r, theta, phi, radius);
    },
    polar_cartesian: function(r, polar)
    {

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
}