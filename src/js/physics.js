gb.Rigidbody
{
	this.mass;
	this.inv_mass;
	this.position;
	this.velocity;
	this.acceleration;
}
gb.physics = 
{
	new_body: function(mass)
	{
		var v3 = gb.vec3;
		var b = new gb.Rigidbody();
		b.position = v3.new();
		b.velocity = v3.new();
		b.acceleration = v3.new();
		b.mass = mass;
	},

	add_force: function(b, f)
	{
		b.acceleration[0] += f[0] / b.mass;
		b.acceleration[1] += f[1] / b.mass;
		b.acceleration[2] += f[2] / b.mass;
	},
	add_force_f: function(b, x,y,z)
	{
		b.acceleration[0] += x / b.mass;
		b.acceleration[1] += y / b.mass;
		b.acceleration[2] += z / b.mass;
	},
	integrate_euler: function(b, dt)
	{
		var dts = dt * dt;
		b.velocity[0] += 0.5 * b.acceleration[0] * dts;
		b.velocity[1] += 0.5 * b.acceleration[1] * dts;
		b.velocity[2] += 0.5 * b.acceleration[1] * dts; 

		b.position[0] += b.velocity[0];
		b.position[1] += b.velocity[1];
		b.position[2] += b.velocity[2];
		
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
}