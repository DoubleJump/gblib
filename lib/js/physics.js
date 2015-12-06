gb.Rigidbody = function()
{
	this.mass;
	this.inv_mass;
	this.position;
	this.velocity;
	this.acceleration;
	this.friction;
	this.restitution;
}
gb.Manifold = function()
{
	this.A;
	this.B;
	this.normal;
	this.depth;
}
gb.physics = 
{
	new_body: function(mass)
	{
		var v3 = gb.vec3;
		var b = new gb.Rigidbody();
		b.position = v3.new(0,0,0);
		b.velocity = v3.new(0,0,0);
		b.acceleration = v3.new(0,0,0);
		b.mass = mass;
		b.inv_mass = 1 / mass;
		return b;
	},

	add_force: function(b, f)
	{
		b.acceleration[0] += f[0] * b.inv_mass;
		b.acceleration[1] += f[1] * b.inv_mass;
		b.acceleration[2] += f[2] * b.inv_mass;
	},
	add_force_f: function(b, x,y,z)
	{
		b.acceleration[0] += x * b.inv_mass;
		b.acceleration[1] += y * b.inv_mass;
		b.acceleration[2] += z * b.inv_mass;
	},
	add_impulse: function(b, f)
	{
		b.velocity[0] += f[0] * b.inv_mass;
		b.velocity[1] += f[1] * b.inv_mass;
		b.velocity[2] += f[2] * b.inv_mass;
	},
	add_impulse_f: function(b, x,y,z)
	{
		b.velocity[0] += x * b.inv_mass;
		b.velocity[1] += y * b.inv_mass;
		b.velocity[2] += z * b.inv_mass;
	},

	integrate_euler: function(b, dt)
	{
		var dts = dt * dt;
		b.velocity[0] += 0.5 * b.acceleration[0] * dts;
		b.velocity[1] += 0.5 * b.acceleration[1] * dts;
		b.velocity[2] += 0.5 * b.acceleration[1] * dts; 

		b.position[0] += b.velocity[0] * dt;
		b.position[1] += b.velocity[1] * dt;
		b.position[2] += b.velocity[2] * dt;
		
		b.acceleration[0] = 0;
		b.acceleration[1] = 0;
		b.acceleration[2] = 0;
	},
	integrate_rk4: function(b, dt)
	{
		
	},

	gravitation: function(a,b,g)
	{
		var dx = b.position[0] - a.position[0];
		var dy = b.position[1] - a.position[1];
		var dist = dx * dx + dy * dy;
		var id = 1 / dist;
		var f = id * ((g * a.mass * b.mass) / dist);
		gb.physics.add_force(a, dx * f, dy * f);
	}

	resolve_manifold: function(m)
	{
		var v3 = gb.vec3;
		var rv = v3::tmp(); 
		vec3.sub(rv, m.B.velocity, m.A.velocity);
		var velocity_along_normal = v3.dot(rv, m.normal);

		if(velocity_along_normal > 0)
		{
			return;
		}

		var restitution = gb.math.min(m.A.restitution, m.B.restitution);
		var impulse_magnitude = -(1 + restitution) * velocity_along_normal;
		impulse_magnitude /= m.A.inv_mass + m.B.inv_mass;

		vec3.mul(rv, m.normal, impulse_magnitude);
		gb.physics.apply_impulse(m.B, rv);

		vec3.inverse(rv,rv);
		gb.physics.apply_impulse(m.A, rv);
	}
}