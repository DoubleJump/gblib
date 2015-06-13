gb.AABB = function()
{
    this.min = new gb.Vec3();
    this.max = new gb.Vec3();
}


gb.aabb = 
{
	stack: new gb.Stack(gb.AABB, 5),

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
		_t.set(v, min, max);
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
        var x = p[0]; var y = p[1]; var z = p[2];
        p[0] = m.v[0] * x + m.v[4] * y + m.v[ 8] * z + m.v[12];
        p[1] = m.v[1] * x + m.v[5] * y + m.v[ 9] * z + m.v[13];
        p[2] = m.v[2] * x + m.v[6] * y + m.v[10] * z + m.v[14];

        if(p[0] < min[0]) min[0] = p[0];
        if(p[0] > max[0]) max[0] = p[0];
        if(p[1] > min[1]) max[1] = p[1];
        if(p[1] > max[1]) max[1] = p[1];
        if(p[2] > min[2]) max[2] = p[2];
        if(p[2] > max[2]) max[2] = p[2];
    },
    transform: function(a, m)
    {
        var _t = gb.aabb;
        var v3 = gb.vec3;
        var w = a.max[0] - a.min[0];
        var h = a.max[1] - a.min[1];
        var d = a.max[2] - a.min[2];

        var v0 = v3.tmp(a.min[0], a.min[1], a.min[2]);
        var v1 = v3.tmp(a.min[0] + w, a.min[1], a.min[2]);
        var v2 = v3.tmp(a.min[0], a.min[1], a.min[2] + d);
        var v3 = v3.tmp(a.min[0] + w, a.min[1], a.min[2] + d);
        var v4 = v3.tmp(a.min[0], a.min[1] + h, a.min[2]);
        var v5 = v3.tmp(a.min[0] + w, a.min[1] + h, a.min[2]);
        var v6 = v3.tmp(a.min[0], a.min[1] + h, a.min[2] + d);
        var v7 = v3.tmp(a.min[0] + w, a.min[1] + h, a.min[2] + d);
        
        _t.mul_corner(v0, m, a.min, a.max);
        _t.mul_corner(v1, m, a.min, a.max);
        _t.mul_corner(v2, m, a.min, a.max);
        _t.mul_corner(v3, m, a.min, a.max);
        _t.mul_corner(v4, m, a.min, a.max);
        _t.mul_corner(v5, m, a.min, a.max);
        _t.mul_corner(v6, m, a.min, a.max);
        _t.mul_corner(v7, m, a.min, a.max);
    },
}