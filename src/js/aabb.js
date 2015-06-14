gb.AABB = function()
{
    this.min = new gb.Vec3();
    this.max = new gb.Vec3();
}

gb.aabb = 
{
	stack: new gb.Stack(gb.AABB, 16),

    set:function(r, min, max)
    {
        gb.vec3.eq(r.min, min);
        gb.vec3.eq(r.max, max);
    },
    eq:function(a, b)
    {
        gb.aabb.set(a, b.min, b.max);
    },
    setf:function(a, x,y,z)
    {
        a.min[0] = -x / 2;
        a.max[0] = x / 2;
        a.min[1] = -y / 2;
        a.max[1] = y / 2;
        a.min[2] = -z / 2;
        a.max[2] = z / 2;
    },
	tmp: function(min, max)
	{
        var _t = gb.aabb;
		var v = _t.stack.get();
		if(min || max) _t.set(v, min, max);
		return v;
	},
    contains: function(a, b)
    {
        return a.min[0] >= b.min[0] && 
               a.max[0] <= b.max[0] && 
               a.min[1] >= b.min[1] && 
               a.max[1] <= b.max[1] && 
               a.min[2] >= b.min[2] && 
               a.max[2] <= b.max[2];
    },
    combine: function(r, a,b)
    {
        gb.vec3.min(r.min, a.min, b.min);
        gb.vec3.max(r.max, a.max, b.max);
    },
    center: function(r, a)
    {
        r[0] = (a.min[0] + a.max[0]) / 2.0;
        r[1] = (a.min[1] + a.max[1]) / 2.0;
        r[2] = (a.min[2] + a.max[2]) / 2.0;
    },
    width: function(a)
    {
        return a.max[0] - a.min[0];
    },
    height: function(a)
    {
        return a.max[1] - a.min[1];
    },
    depth: function(a)
    {
        return a.max[2] - a.min[2];
    },
    mul_corner: function(p, m, min, max)
    {
        var x = p[0]; 
        var y = p[1]; 
        var z = p[2];

        x = m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12];
        y = m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13];
        z = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];

        if(x < min[0]) min[0] = x;
        if(y < min[1]) min[1] = y;
        if(z < min[2]) min[2] = z;

        if(x > max[0]) max[0] = x;
        if(y > max[1]) max[1] = y;
        if(z > max[2]) max[2] = z;
    },
    transform: function(a, m)
    {
        var _t = gb.aabb;
        var v3 = gb.vec3;
        
        var stack = v3.push();

        var w = a.max[0] - a.min[0];
        var h = a.max[1] - a.min[1];
        var d = a.max[2] - a.min[2];

        var p0 = v3.tmp(a.min[0], a.min[1], a.min[2]);
        var p1 = v3.tmp(a.min[0] + w, a.min[1], a.min[2]);
        var p2 = v3.tmp(a.min[0], a.min[1], a.min[2] + d);
        var p3 = v3.tmp(a.min[0] + w, a.min[1], a.min[2] + d);
        var p4 = v3.tmp(a.min[0], a.min[1] + h, a.min[2]);
        var p5 = v3.tmp(a.min[0] + w, a.min[1] + h, a.min[2]);
        var p6 = v3.tmp(a.min[0], a.min[1] + h, a.min[2] + d);
        var p7 = v3.tmp(a.min[0] + w, a.min[1] + h, a.min[2] + d);
        
        _t.mul_corner(p0, m, a.min, a.max);
        _t.mul_corner(p1, m, a.min, a.max);
        _t.mul_corner(p2, m, a.min, a.max);
        _t.mul_corner(p3, m, a.min, a.max);
        _t.mul_corner(p4, m, a.min, a.max);
        _t.mul_corner(p5, m, a.min, a.max);
        _t.mul_corner(p6, m, a.min, a.max);
        _t.mul_corner(p7, m, a.min, a.max);

        v3.pop(stack);
    },
}