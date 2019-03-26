function free_look(c, dt, vertical_limit)
{
	if(c.fly_mode === undefined) 
	{
		c.fly_mode = false;
		c.angle = Vec3();
		c.velocity = Vec3();
	}
	
	if(key_down(Keys.F)) c.fly_mode = !c.fly_mode;
	if(c.fly_mode === false) return;

	var v3_index = vec3_stack.index;
	var v4_index = vec4_stack.index;

	var ROTATE_SPEED = 3.0;

	c.angle[0] -= input.mouse.delta[1] * ROTATE_SPEED * dt;
	c.angle[1] -= input.mouse.delta[0] * ROTATE_SPEED * dt;
	
	if(c.angle[0] >  vertical_limit) c.angle[0] = vertical_limit;
	if(c.angle[0] < -vertical_limit) c.angle[0] = -vertical_limit;

	if(key_down(Keys.R))
	{
		c.angle[0] = 0;
		c.angle[1] = 0;
	}
	if(key_down(Keys.P))
	{
		LOG(c.angle)
		LOG(c.position)
	}

	var rot_x = _Vec4(0,0,0,1);
	var rot_y = _Vec4(0,0,0,1);
	var rot_lerp = _Vec4(0,0,0,1);

	var right = _Vec3(1,0,0);
	var up = _Vec3(0,1,0);

	quat_set_angle_axis(rot_x, c.angle[0], right);
	quat_set_angle_axis(rot_y, c.angle[1], up);

	quat_mul(rot_lerp, rot_y, rot_x);
	vec_lerp(c.rotation, c.rotation, rot_lerp, 0.1);

	var accel = _Vec3();
	var MOVE_SPEED = 0.5;
	if(key_held(Keys.SHIFT)) MOVE_SPEED *= 2;

	if(key_held(Keys.A)) accel[0] = -MOVE_SPEED * dt;
	else if(key_held(Keys.D)) accel[0] = MOVE_SPEED * dt;
	
	if(key_held(Keys.W)) accel[2] = -MOVE_SPEED * dt;
	else if(key_held(Keys.S)) accel[2] = MOVE_SPEED * dt;

	if(key_held(Keys.Q)) accel[1] = -MOVE_SPEED * dt;
	else if(key_held(Keys.E)) accel[1] = MOVE_SPEED * dt;

	mat4_mul_dir(accel, c.world_matrix, accel);

	vec_add(c.velocity, accel, c.velocity);
	vec_mul_f(c.velocity, c.velocity, 0.9);

	vec_add(c.position, c.velocity, c.position);
	c.dirty = true;

	vec3_stack.index = v3_index;
	vec4_stack.index = v4_index;
}