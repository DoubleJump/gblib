function SphereCollider(origin, radius)
{
	var r = {};
	r.origin = origin;
	r.radius = radius;
	return r;
}

function Ray(origin, direction, length)
{
	var r = {};
	r.origin = origin;
	r.direction  = direction;
	r.length = length;
	return r;
}

function HitInfo()
{
	var r = {};
	r.hit = false;
	r.point = Vec3();
	r.normal = Vec3();
	r.t = 0;
	return r;
}

function point_in_rect_fast(px,py, x,y,w,h)
{
	return px >= x && px < (x + w) &&
		   py < y && py >= (y - h);
}

function point_in_rect(p, r, matrix)
{
	var local = _Vec3();

	if(matrix)
	{
		var inv = _Mat4();
		mat4_inverse_affine(inv, matrix);
		mat4_mul_point(local, inv, p);
		mat4_stack.index--;
	}
	else
	{
		vec_eq(local, p);
	}
	vec3_stack.index--;

	if(local[0] > r[0] && 
	   local[1] > r[1] && 
	   local[0] < (r[0] + r[2]) && 
	   local[1] < (r[1] + r[3]))
	{
		return true;
	}
	return false;
}

function ray_sphere(info, ray, sphere)
{
	var index = vec3_stack.index;

	info.hit = false;

	var p = vec3_tmp();

	vec_sub(p, ray.origin, sphere.origin);
	var a = vec_dot(ray.direction, ray.direction);
	var b = vec_dot(ray.direction, p);
	var c = vec_dot(p, p) - (sphere.radius * sphere.radius);
	var d = b * b - c * a;

	if(d < 0.0) return;

	var sqrtd = Math.sqrt(d);
	a = 1.0 / a;

	var t0 = ( -b + sqrtd ) * a;
	var t1 = ( -b - sqrtd ) * a;

	if(t0 < t1) info.t = t0;
	else info.t = t1;
	
	info.hit = true;

	vec_mul_f(p, ray.direction, info.t);
	vec_add(info.point, ray.origin, p);

	vec3_stack.index = index;
}

function circle_circle(info, a, ra, b, rb)
{
	info.hit = false;
	var index = vec3_stack.index;
	var delta = _Vec3();
	vec_sub(delta, b,a);

	//var distance = sqr_length(delta);
	//var rad_sum = (ra * ra) + (rb * rb);

	var distance = vec_length(delta);
	var rad_sum = ra + rb;

	if(distance < rad_sum)
	{
		info.hit = true;
		info.t = rad_sum - distance;
		vec_normalized(info.normal, delta);
		vec_mul_f(info.point, info.normal, ra)
		vec_add(info.point, info.point, a); 
	}

	vec3_stack.index = index;
}

function point_in_circle(info, p,c,r)
{
	var delta = _Vec3();
	var nd = _Vec3();
	vec_sub(delta, c,p);

	info.hit = false;
	
	var l = vec_sqr_length(delta);
	if(l < r * r)
	{
		var nl = Math.sqrt(l);
		info.hit = true;
		info.t = nl - r;
		vec_mul_f(nd, delta, 1 / nl);
		vec_eq(info.normal, nd);
	}

	vec3_stack.index -= 2;
}

function line_circle(h, c,r, a,b)
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

	var sd = Math.sqrt(delta);
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

	if(Math.abs(ta - 0.5) < Math.abs(tb - 0.5))
    {
    	h.hit = true;
        h.point[0] = a[0] * (1 - tb) + tb * b[0];
    	h.point[1] = a[1] * (1 - tb) + tb * b[1];
    	return;
    }

    //TODO: Get normals etc

}

function line_line(h, a,b,c,d)
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
}

function aabb_aabb(a, b)
{
   	if(a.min[0] > b.max[0]) return false;
   	if(a.max[0] < b.min[0]) return false;

   	if(a.min[1] > b.max[1]) return false;
   	if(a.max[1] < b.min[1]) return false;

   	if(a.min[2] > b.max[2]) return false;
   	if(a.max[2] < b.min[2]) return false;

    return true;
}

function aabb_ray(h, a, r)
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

	var min = Math.min;
	var max = Math.max;
	var tmin = max(max(min(t1, t2), min(t3, t4)), min(t5, t6));
	var tmax = min(min(max(t1, t2), max(t3, t4)), max(t5, t6));

	if(tmax < 0 || tmin > tmax)
	{
		h.hit = false;
		return;
	}

	var v = _Vec3();
	vec_mul_f(v, r.dir, tmin);
	vec_add(h.point, r.point, v);
	h.hit = true;
	set_vec3(h.normal, 0,1,0);
	h.t = tmin;
	vec3_stack.index--;
}

function point_in_triangle(p, a,b,c)
{
	var A = (-b[1] * c[0] + a[1] * (-b[0] + c[0]) + a[0] * (b[1] - c[1]) + b[0] * c[1]) / 2;
	var sign = A < 0 ? -1 : 1;
	var s = (a[1] * c[0] - a[0] * c[1] + (c[1] - a[1]) * p[0] + (a[0] - c[0]) * p[1]) * sign;
	var t = (a[0] * b[1] - a[1] * b[0] + (a[1] - b[1]) * p[0] + (b[0] - a[0]) * p[1]) * sign;
	return s > 0 && t > 0 && s + t < 2 * A * sign;
}

function triangle_ray(h, a,b,c, r)
{
	var index = vec3_stack.index;
	var e0 = _Vec3();
	var e1 = _Vec3();
	var cross = _Vec3();
	var n = _Vec3();

	vec_sub(e0, b,a);
	vec_sub(e1, c,a);
	vec_cross(cross, e0, e1);
	vec_normalized(n, cross);
	vec_inverse(n, n);

	var ndot = vec_dot(n, r.dir);
	var t = -(vec_dot(n,r.point) + vec_dot(n,a)) / ndot;

	vec_mul_f(e0, r.dir, t);
	vec_add(e1, r.point, e0);

	if(point_in_triangle(e1, a,b,c) === true)
	{
		h.hit = true;
		vec_eq(h.point, e1);
		vec_eq(h.normal, n);
		h.t = t;
	}
	else
	{
		h.hit = false;
	}
	vec3_stack.index = index;
}

function mesh_ray(h, m, matrix, r)
{
	var index = vec3_stack.index;
	var vb = m.vertex_buffer;
	var stride = vb.stride;
	h.t = Number.MAX_VALUE;
	
	var has_hit = false;
	var point = _Vec3();
	var normal = _Vec3();
	var min_t = h.t;

	var ta = _Vec3();
	var tb = _Vec3();
	var tc = _Vec3();

	var n = vb.count / 3;
	var d = vb.data;
	var c = 0;
	for(var i = 0; i < n; ++i)
	{
		set_vec3(ta, d[c], d[c+1], d[c+2]);
		mat4_mul_point(ta, matrix, ta);
		c += stride;

		set_vec3(tb, d[c], d[c+1], d[c+2]);
		mat4_mul_point(tb, matrix, tb);
		c += stride;
		
		set_vec3(tc, d[c], d[c+1], d[c+2]);
		mat4_mul_point(tc, matrix, tc);
		c += stride;

		triangle_ray(h, ta,tb,tc, r);
		if(h.hit === true && h.t < min_t)
		{
			has_hit = true;
			min_t = h.t;
			vec_eq(point, h.point);
			vec_eq(normal, h.normal);
		}
	}
	h.hit = has_hit;
	h.t = min_t;
	vec_eq(h.point, point);
	vec_eq(h.normal, normal);
	vec3_stack.index = index;
}