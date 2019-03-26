function Rigidbody(x,y,z, mass)
{
	var r = Entity(x,y,z, app.root);
	r.mass = mass;
	if(mass === 0) r.inv_mass = 0;
	else r.inv_mass = 1 / mass;
	r.last_position = Vec3();
	r.acceleration = Vec3();
	r.velocity = Vec3();
	r.angular_acceleration = Vec3();
	r.angular_velocity = Vec3();
	r.restitution = 1;
	return r;
}

function DistanceConstraint(a,b, min, max, stiffness)
{
	var r = {};
	r.a = a;
	r.b = b;
	r.stiffness = stiffness;
	r.min = min;
	r.max = max;
	return r;
}

function AngularConstraint(a,b, min, max, stiffness)
{
	var r = {};
	r.a = a;
	r.b = b;
	r.stiffness = stiffness;
	r.min = min;
	r.max = max;
	return r;
}

function update_constraint(c)
{
	var dx = c.a.position[0] - c.b.position[0];
    var dy = c.a.position[1] - c.b.position[1];
    var dz = c.a.position[2] - c.b.position[2];

    var d = Math.sqrt(dx * dx + dy * dy + dz * dz);

    if(d < c.max && d > c.min) return;

    var delta;
    if(d > c.max) delta = (c.max - d) / d;
    else delta = (c.min - d) / d; 

    var ma = c.a.inv_mass;
    var mb = c.b.inv_mass;
    var fa = (ma / (mb + ma)) * c.stiffness;
    var fb = c.stiffness - fa;
    fa *= delta;
    fb *= delta;
    
    c.a.position[0] += dx * fa;
    c.a.position[1] += dy * fa;
    c.a.position[2] += dz * fa;
    c.b.position[0] -= dx * fb;
    c.b.position[1] -= dy * fb;
    c.b.position[2] -= dz * fb;
}

function verlet_integration(b, dt)
{
    var dts = dt * dt;
    var pos = b.position;
    var vel = b.velocity;
    var acc = b.acceleration;
    var lst = b.last_position;

	vec_sub(vel, pos, lst);
    vec_mul_f(vel, vel, 0.95);

	var next = _Vec3();
	next[0] = pos[0] + vel[0] + 0.5 * acc[0] * dts;
	next[1] = pos[1] + vel[1] + 0.5 * acc[1] * dts;
	next[2] = pos[2] + vel[2] + 0.5 * acc[2] * dts;
    
	vec_eq(lst, pos);
	vec_eq(pos, next);
  	set_vec3(acc, 0,0,0);

	vec3_stack.index--;
}

function euler_integration(b, dt)
{
	vec_mul_f(b.acceleration, b.acceleration, b.inv_mass);
	vec_add(b.velocity, b.velocity, b.acceleration);
	vec_mul_f(b.velocity, dt);

	vec_add(b.position, b.position, b.velocity);
	set_vec3(b.acceleration, 0,0,0);
	vec_mul_f(b.velocity, b.velocity, 0.9);
}

function apply_impulse(b, i)
{
	b.velocity[0] += i[0] * b.inv_mass;
	b.velocity[1] += i[1] * b.inv_mass;
	b.velocity[2] += i[2] * b.inv_mass;
}

function apply_force(b, v)
{
	b.acceleration[0] += v[0] * b.inv_mass;
	b.acceleration[1] += v[1] * b.inv_mass;
	b.acceleration[2] += v[2] * b.inv_mass;
}