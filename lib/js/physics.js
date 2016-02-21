gb.Rigidbody = function()
{
	this.mass;
	this.inv_mass;
	this.moi;
	this.inv_moi;
	this.position;
	this.rotation;
	this.acceleration;
	this.angular_acceleration;
	this.velocity;
	this.torque;
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

	new_body: function(mass, moi)
	{
		var v3 = gb.vec3;
		var b = new gb.Rigidbody();
		b.position = v3.new();
		b.rotation = v3.new();
		b.velocity = v3.new();
		b.acceleration = v3.new();
		b.torque = v3.new();
		b.angular_acceleration = v3.new();
		b.mass = mass;
		b.inv_mass = 1.0 / mass;
		b.moi = moi;
		b.inv_moi = 1.0 / moi;
		return b;
	},

	torque: function(b, f)
	{
		var m = b.inv_moi;
		b.angular_acceleration[0] += f[0] * m;
		b.angular_acceleration[1] += f[1] * m;
		b.angular_acceleration[2] += f[2] * m;
	},

	force: function(b, f, at, constant)
	{
		var to = v3.tmp();
		v3.sub(to, at, b.position);
		v3.cross(to, to, f);

		var m = b.inv_mass;
		var i = b.inv_moi;
		if(constant === true)
		{
			m = 1.0;
			i = 1.0;
		}

		b.acceleration[0] += (f[0] * m);
		b.acceleration[1] += (f[1] * m);
		b.acceleration[2] += (f[2] * m);

		b.angular_acceleration[0] += (to[0] * i);
		b.angular_acceleration[1] += (to[1] * i);
		b.angular_acceleration[2] += (to[2] * i);

		gb.vec3.index--;
	},

	impulse: function(b, f)
	{
		var m = b.inv_mass;
		b.velocity[0] += x * m;
		b.velocity[1] += y * m;
		b.velocity[2] += z * m;
	},

	integrate_euler: function(b, dt)
	{
		b.velocity[0] += b.acceleration[0];
		b.velocity[1] += b.acceleration[1];
		b.velocity[2] += b.acceleration[2];

		b.torque[0] += b.angular_acceleration[0];
		b.torque[1] += b.angular_acceleration[1];
		b.torque[2] += b.angular_acceleration[2];

		b.position[0] += b.velocity[0] * dt;
		b.position[1] += b.velocity[1] * dt;
		b.position[2] += b.velocity[2] * dt;

		b.rotation[0] += b.torque[0] * dt;
		b.rotation[1] += b.torque[1] * dt;
		b.rotation[2] += b.torque[2] * dt;

		//v += dt * (b->m_gravityScale * gravity + b->m_invMass * b->m_force);
		//w += dt * b->m_invI * b->m_torque;
		//v *= 1.0f / (1.0f + h * b->m_linearDamping);
		//w *= 1.0f / (1.0f + h * b->m_angularDamping);

		gb.vec3.set(b.acceleration, 0,0,0);
		gb.vec3.set(b.angular_acceleration, 0,0,0);

		gb.vec3.stack.index--;
		gb.quat.stack.index--;
	},
	
	sync_transform: function(b, t)
	{
		gb.vec3.eq(t.position, b.position);
		gb.quat.euler(t.rotation, b.rotation);
	},

	gravitation: function(a,b,g)
	{
		var dx = b.position[0] - a.position[0];
		var dy = b.position[1] - a.position[1];
		var dist = dx * dx + dy * dy;
		var id = 1 / dist;
		var f = id * ((g * a.mass * b.mass) / dist);
		gb.physics.force(a, dx * f, dy * f);
	},

	resolve_manifold: function(m)
	{
		var v3 = gb.vec3;
		var rv = v3.tmp(); 
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
		gb.physics.impulse(m.B, rv);

		vec3.inverse(rv,rv);
		gb.physics.impulse(m.A, rv);
	}
}