gb.Derivative = function()
{
	this.velocity;
	this.spin;
}

gb.physics = 
{
	da: new gb.Derivative();
	db: new gb.Derivative();
	dc: new gb.Derivative();
	dd: new gb.Derivative();

	new_body: function(mass, size)
	{
		var v3 = gb.vec3;
		var qt = gb.quat;
		var b;

		b.position = v3.new();
		b.momentum = v3.new();
        b.orientation = qt.new();
        b.ang_momentum = v3.new();

        b.velocity = v3.new();
        b.spin = qt.new();            
		b.ang_velocity = v3.new();         

        b.size = size;
        b.mass = mass;
        b.inv_mass = 1.0 / mass;
        b.inertia = mass * size;
        b.inv_inertia = 1.0 / inertia;

		return b;
	},


	evaluate: function(r, state, t, dt, derivative)
	{
		state.position += derivative.velocity * dt;
		state.momentum += derivative.force * dt;
		state.orientation += derivative.spin * dt;
		state.ang_momentum += derivative.torque * dt;
		_t.recalculate_state(state);
		
		r.velocity = state.velocity;
		r.spin = state.spin;
		//forces(state, t+dt, output.force, output.torque);
	},

	recalculate_state: function(s)
    {
        s.velocity[0] = s.momentum[0] * s.inv_mass;
        s.velocity[1] = s.momentum[1] * s.inv_mass;
        s.velocity[2] = s.momentum[2] * s.inv_mass;

        s.ang_velocity[0] = s.ang_momentum[0] * s.inv_inertia;
        s.ang_velocity[1] = s.ang_momentum[1] * s.inv_inertia;
        s.ang_velocity[2] = s.ang_momentum[2] * s.inv_inertia;

        gb.quat.normalized(s.orientation, s.orientation);
        var rot = gb.quat.tmp(s.ang_velocity[0] * 0.5, s.ang_velocity[1] * 0.5, s.ang_velocity[2] * 0.5, 0.0);
        gb.quat.mul(s.spin, rot, s.orientation);
    },

	integrate_RK4: function(state, t, dt)
	{
		var _t = gb.physics;

		// -- _t.evaluate(_t.da, state, t);
		_t.evaluate(_t.db, state, t, dt * 0.5, _t.a);
		_t.evaluate(_t.dc, state, t, dt * 0.5, _t.b);
		_t.evaluate(_t.dd, state, t, dt, _t.c);
		
		var i = 1.0 / 6.0;
		state.position += i * dt * (_t.da.velocity + 2.0 * (_t.db.velocity + _t.dc.velocity) + _t.dd.velocity);
		state.momentum += i * dt * (_t.da.force + 2.0 * (_t.db.force + _t.dc.force) + _t.dd.force);
		state.orientation += i * dt * (_t.da.spin + 2.0 * (_t.db.spin + _t.dc.spin) + _t.dd.spin);
		state.ang_momentum += i * dt * (_t.da.torque + 2.0 *(_t.db.torque + _t.dc.torque) + _t.dd.torque);

		_t.recalculate_state(state);
	}	
}