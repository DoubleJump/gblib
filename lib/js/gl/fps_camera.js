gb.camera.fly = function(c, dt, vertical_limit)
{
	if(c.fly_mode === undefined) 
	{
		c.fly_mode = false;
		c.angle_x = 0;
		c.angle_y = 0;
	}
	if(gb.input.down(gb.Keys.f))
	{
		c.fly_mode = !c.fly_mode;
	}
	if(c.fly_mode === false) return;

	var e = c.entity;
	var index = gb.vec3.stack.index;

	var m_delta = gb.input.mouse_delta;
	var ROTATE_SPEED = 30.0;

	c.angle_x -= m_delta[1] * ROTATE_SPEED * dt;
	c.angle_y -= m_delta[0] * ROTATE_SPEED * dt;
	
	if(c.angle_x > vertical_limit) c.angle_x = vertical_limit;
	if(c.angle_x < -vertical_limit) c.angle_x = -vertical_limit;

	var rot_x = gb.quat.tmp();
	var rot_y = gb.quat.tmp();
	var right = gb.vec3.tmp(1,0,0);
	var up = gb.vec3.tmp(0,1,0);

	gb.quat.angle_axis(rot_x, c.angle_x, right);
	gb.quat.angle_axis(rot_y, c.angle_y, up);
	gb.quat.mul(e.rotation, rot_y, rot_x);

	var move = gb.vec3.tmp();
	var MOVE_SPEED = 1.0;
	if(gb.input.held(gb.Keys.a))
	{
		move[0] = -MOVE_SPEED * dt;
	}
	else if(gb.input.held(gb.Keys.d))
	{
		move[0] = MOVE_SPEED * dt;
	}
	if(gb.input.held(gb.Keys.w))
	{
		move[2] = -MOVE_SPEED * dt;
	}
	else if(gb.input.held(gb.Keys.s))
	{
		move[2] = MOVE_SPEED * dt;
	}

	gb.mat4.mul_dir(move, e.world_matrix, move);
	gb.vec3.add(e.position, move, e.position);
	e.dirty = true;

	gb.entity.update(c.entity);

	// Draw reticule cross... (yeah, I know)

	var vx = gb.webgl.view.width / 2;
	var vy = gb.webgl.view.height / 2;

	var size = 5;
	var ct = v3.tmp(vx, vy + size,0);
	var cb = v3.tmp(vx, vy - size,0);
	var cl = v3.tmp(vx - size, vy);
	var cr = v3.tmp(vx + size, vy);
	gb.projections.screen_to_world(ct, c.view_projection, ct, gb.webgl.view);
	gb.projections.screen_to_world(cb, c.view_projection, cb, gb.webgl.view);
	gb.projections.screen_to_world(cl, c.view_projection, cl, gb.webgl.view);
	gb.projections.screen_to_world(cr, c.view_projection, cr, gb.webgl.view);
	gb.gl_draw.line(ct, cb);
	gb.gl_draw.line(cl, cr);

	gb.vec3.stack.index = index;
}