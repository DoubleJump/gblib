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

function point_in_rect(p, r, matrix)
{
	var local = _Vec3();
	var inv = _Mat4();
	mat4_inverse_affine(inv, matrix);
	mat4_mul_point(local, inv, p);
	vec3_stack.index--;
	mat4_stack.index--;

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