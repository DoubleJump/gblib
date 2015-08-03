gb.Hit = function()
{
	this.hit = false;
	this.point = gb.vec3.new();
	this.normal = gb.vec3.new();
	this.t = 0;
}
gb.hit = 
{
	stack: new gb.Stack(gb.Hit, 5),

	eq: function(a,b)
	{
		a.hit = b.hit;
		gb.vec3.eq(a.point, b.point);
		gb.vec3.eq(a.normal, b.normal);
		a.t = b.t;
	},
	tmp: function()
	{
		var r = gb.stack.get(gb.hit.stack);
		r.hit = false;
		gb.vec3.set(r.point, 0,0,0);
		gb.vec3.set(r.normal, 0,0,0);
		r.t = 0;
		return r;
	},
}


gb.intersect = 
{
	point_circle: function(h, p, c, r)
	{
		var v2 = gb.vec2;
		var delta = v2.tmp();
		v2.sub(delta, c, p);
		var l = v2.sqr_length(delta);
		if(l < r * r)
		{
			var nl = gb.math.sqrt(l);
			h.hit = true;
			h.t = nl - r;
			var nd = v2.tmp();
			v2.mulf(nd, delta, 1/nl);
			v2.eq(h.normal, nd);
		}
		else 
		{
			h.hit = false;
		}
	},

	line_circle: function(h, c,r, a,b)
	{
		var lax = a[0] - c[0];
		var lay = a[1] - c[1];
		var lbx = b[0] - c[0];
		var lby = b[1] - c[1];

		var sx = lbx - lax;
		var sy = lby - lay;

		var a = sx * sx + sy * sy;
		var b = 2 * ((sx * lax) + (sy * lay));
		var c = (lax * lax) + (lay * lay) - (r * r);
		var delta = b * b - (4 * a * c);
		if(delta < 0)
		{
			h.hit = false;
			return;
		} 

		var sd = gb.math.sqrt(delta);
		var ta = (-b - sd) / (2 * a);

		if(ta < 0 || ta > 1)
		{
			h.hit = false;
			return;
		}

		h.point[0] = a[0] * (1 - ta) + ta * b[0];
        h.point[1] = a[1] * (1 - ta) + ta * b[1];

        /*
		if(delta === 0)
		{
			h.hit = true;
			h.t = t;
            return;
		}
		*/

		var tb = (-b + sd) / (2 * a);

		draw.text("TA: " + ta, 10, 30)
		draw.text("TB: " + tb, 10, 60);

		if(gb.math.abs(ta - 0.5) < gb.math.abs(tb - 0.5))
        {
        	h.hit = true;
            h.point[0] = a[0] * (1 - tb) + tb * b[0];
        	h.point[1] = a[1] * (1 - tb) + tb * b[1];
        	return;
        }

        //TODO: Get normals etc

	},

	line_line: function(h, a,b,c,d)
	{
		var lax = b[0] - a[0];
		var lay = b[1] - a[1];
		var lbx = d[0] - c[0];  
		var lby = d[1] - c[1];

		var d = -lbx * lay + lax * lby;

		var s = (-lay * (a[0] - c[0]) + lax * (a[1] - c[1])) / d;
		var t = ( lbx * (a[1] - c[1]) - lby * (a[0] - c[0])) / d;

		if(s >= 0 && s <= 1 && t >= 0 && t <= 1)
		{
			h.hit = true;
			h.point[0] = a[0] + (t * lbx);
			h.point[1] = a[1] + (t * lby);
			return 1;
		}
		else
		{
			h.hit = false;
		}
	},

	aabb_aabb: function(a, b)
    {
       	if(a.min[0] > b.max[0]) return false;
       	if(a.max[0] < b.min[0]) return false;

       	if(a.min[1] > b.max[1]) return false;
       	if(a.max[1] < b.min[1]) return false;

       	if(a.min[2] > b.max[2]) return false;
       	if(a.max[2] < b.min[2]) return false;

        return true;
    },

    aabb_ray: function(h, a, r)
	{
		var fx = 1 / r.dir[0];
		var fy = 1 / r.dir[1];
		var fz = 1 / r.dir[2];

		var t1 = (a.min[0] - r.point[0]) * fx;
		var t2 = (a.max[0] - r.point[0]) * fx;
		var t3 = (a.min[1] - r.point[1]) * fy;
		var t4 = (a.max[1] - r.point[1]) * fy;
		var t5 = (a.min[2] - r.point[2]) * fz;
		var t6 = (a.max[2] - r.point[2]) * fz;

		var m = gb.math;
		var tmin = m.max(m.max(m.min(t1, t2), m.min(t3, t4)), m.min(t5, t6));
		var tmax = m.min(m.min(m.max(t1, t2), m.max(t3, t4)), m.max(t5, t6));

		if(tmax < 0 || tmin > tmax)
		{
			h.hit = false;
			return;
		}

		var v = gb.vec3.tmp();
		gb.vec3.mulf(v, r.dir, tmin);
		gb.vec3.add(h.point, r.point, v);
		h.hit = true;
		gb.vec3.set(h.normal, 0,1,0);
		h.t = tmin;
	},

	point_triangle: function(p, a,b,c)
	{
		var A =  (-b[1] * c[0] + a[1] * (-b[0] + c[0]) + a[0] * (b[1] - c[1]) + b[0] * c[1]) / 2;
		var sign = A < 0 ? -1 : 1;
		var s = (a[1] * c[0] - a[0] * c[1] + (c[1] - a[1]) * p[0] + (a[0] - c[0]) * p[1]) * sign;
		var t = (a[0] * b[1] - a[1] * b[0] + (a[1] - b[1]) * p[0] + (b[0] - a[0]) * p[1]) * sign;
		return s > 0 && t > 0 && s + t < 2 * A * sign;
	},

	triangle_ray: function(h, a,b,c, r)
	{
		var v3 = gb.vec3;
		var e0 = v3.tmp();
		var e1 = v3.tmp();
		var cross = v3.tmp();
		var n = v3.tmp();

		v3.sub(e0, b,a);
		v3.sub(e1, c,a);

		v3.cross(cross, e0, e1);
		v3.normalized(n, cross);
		v3.inverse(n, n);

		var ndot = v3.dot(n, r.dir);
		var t = -(v3.dot(n,r.point) + v3.dot(n,a)) / ndot;

		v3.mulf(e0, r.dir, t);
		v3.add(e1, r.point, e0);

		if(gb.intersect.point_triangle(e1, a,b,c) === true)
		{
			h.hit = true;
			v3.eq(h.point, e1);
			v3.eq(h.normal, n);
			h.t = t;
		}
		else
		{
			h.hit = false;
		}
	},

	mesh_ray: function(h, m, matrix, r)
	{
		var _t = gb.intersect;
		var stride = gb.mesh.get_stride(m);
		h.t = gb.math.MAX_F32;

		var hit = gb.hit.tmp();

		var n = m.vertex_count / 3;
		var d = m.vertex_buffer.data;
		var c = 0;
		for(var i = 0; i < n; ++i)
		{
			var stack = gb.vec3.push();
			var ta = gb.vec3.tmp(d[c], d[c+1], d[c+2]);
			gb.mat4.mul_point(ta, matrix, ta);
			c += stride;
			var tb = gb.vec3.tmp(d[c], d[c+1], d[c+2]);
			gb.mat4.mul_point(tb, matrix, tb);
			c += stride;
			var tc = gb.vec3.tmp(d[c], d[c+1], d[c+2]);
			gb.mat4.mul_point(tc, matrix, tc);
			c += stride;

			_t.triangle_ray(hit, ta,tb,tc, r);
			gb.vec3.pop(stack);
			if(hit.hit === true && hit.t < h.t)
			{
				gb.hit.eq(h, hit);
			}
		}
	},
}
