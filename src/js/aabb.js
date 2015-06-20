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
        var v = gb.stack.get(_t.stack);
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
    test_min_max: function(p, min, max)
    {
        if(p[0] < min[0]) min[0] = p[0];
        if(p[1] < min[1]) min[1] = p[1];
        if(p[2] < min[2]) min[2] = p[2];

        if(p[0] > max[0]) max[0] = p[0];
        if(p[1] > max[1]) max[1] = p[1];
        if(p[2] > max[2]) max[2] = p[2];        
    },
    transform: function(a, m)
    {
        var _t = gb.aabb;
        var v3 = gb.vec3;
        var m4 = gb.mat4;
        
        var stack = v3.push();

        var e = a.min;
        var f = a.max;

        var p0 = v3.tmp(e[0],e[1],e[2]); 
        var p1 = v3.tmp(f[0],e[1],e[2]);
        var p2 = v3.tmp(e[0],f[1],e[2]);
        var p3 = v3.tmp(f[0],f[1],e[2]);

        var p4 = v3.tmp(e[0],e[1],f[2]); 
        var p5 = v3.tmp(f[0],e[1],f[2]);
        var p6 = v3.tmp(e[0],f[1],f[2]);
        var p7 = v3.tmp(f[0],f[1],f[2]);

        m4.mul_point(p0, m, p0);
        m4.mul_point(p1, m, p1);
        m4.mul_point(p2, m, p2);
        m4.mul_point(p3, m, p3);
        m4.mul_point(p4, m, p4);
        m4.mul_point(p5, m, p5);
        m4.mul_point(p6, m, p6);
        m4.mul_point(p7, m, p7);

        e = v3.tmp(p0[0], p0[1], p0[2]);
        f = v3.tmp(p0[0], p0[1], p0[2]);
        
        _t.test_min_max(p1, e, f);
        _t.test_min_max(p2, e, f);
        _t.test_min_max(p3, e, f);
        _t.test_min_max(p4, e, f);
        _t.test_min_max(p5, e, f);
        _t.test_min_max(p6, e, f);
        _t.test_min_max(p7, e, f);

        v3.eq(a.min, e);
        v3.eq(a.max, f);

        v3.pop(stack);
    },
}