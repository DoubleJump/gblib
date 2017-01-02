var OrbitCameraState = 
{
	MANUAL: 0,
	FIXED: 1,
	TARGETING: 2,
}
function OrbitCamera(camera, offset)
{
	var r = Entity(app.root);
	r.state = OrbitCamera.MANUAL;
	r.spin = 0;
	r.tilt = 0.3;
	r.zoom = 0.6;
	r.target_angle = Vec3();
	r.velocity = Vec3();
	r.TILT_LIMIT = 70;
	r.TILT_SPEED = 0.1;
	r.SPIN_SPEED = 0.1;
	r.ZOOM_SPEED = 0.1;
	r.MIN_ZOOM = 25;
	r.MAX_ZOOM = 75;
	r.TARGET_EPSILON = 0.0001;
	r.ease_curve = Curve(2, 
	[
		0,0, 0.1,0.0,
		0.9,1.0, 1,1,
	]);
	r.camera = camera;
	set_postition(camera, 0,0,-offset);
    set_parent(camera, r);
	return r;
}

function orbit_camera(c, dt)
{
	var v3_index = vec3_stack.index;
	var v4_index = vec4_stack.index;

	var accel = _Vec3();

	switch(c.state)
	{
		case CameraState.MANUAL:
		{
			if(key_held(Keys.W)) accel[0] -= c.TILT_SPEED * dt;
			if(key_held(Keys.S)) accel[0] += c.TILT_SPEED * dt;
			if(key_held(Keys.A)) accel[1] -= c.SPIN_SPEED * dt;
			if(key_held(Keys.D)) accel[1] += c.SPIN_SPEED * dt;
			if(key_held(Keys.E)) accel[2] = -c.ZOOM_SPEED * dt;
			if(key_held(Keys.Q)) accel[2] = c.ZOOM_SPEED * dt;

			vec_add(c.velocity, accel, c.velocity);
			vec_mul_f(c.velocity, c.velocity, 0.9);
			
			c.spin = wrap_normal(c.spin + c.velocity[1]);
			c.tilt = clamp(c.tilt + c.velocity[0], 0,1);
			c.zoom = clamp(c.zoom + c.velocity[2], 0,1);

			break;
		}
		case CameraState.TARGETING:
		{
			set_vec3(accel, 0,0,0);
			set_vec3(c.velocity, 0,0,0);

			var tx = wrap_normal(c.target_angle[0] / 360);
			var ty = wrap_normal(c.target_angle[1] / 360);

			// TODO delta time these speeds
			c.spin = smooth_move_towards(c.spin, tx, c.SPIN_SPEED * dt, c.TARGET_EPSILON);
			c.tilt = smooth_move_towards(c.tilt, ty, c.TILT_SPEED * dt, c.TARGET_EPSILON);
			//c.zoom = smooth_move_towards(c.zoom, 0.4, 0.1, c.TARGET_EPSILON);
			
			break;
		}
	}

	var tt = eval_curve_f(c.ease_curve, c.tilt);
	var tilt = lerp(-c.TILT_LIMIT, c.TILT_LIMIT, tt);
	var spin = c.spin * 360;

	var rot_x = _Vec4(0,0,0,1);
	var rot_y = _Vec4(0,0,0,1);
	quat_set_angle_axis(rot_x, tilt, _Vec3(1,0,0));
	quat_set_angle_axis(rot_y, spin, _Vec3(0,1,0));
	quat_mul(c.rotation, rot_y, rot_x);

	var zt = eval_curve_f(c.ease_curve, c.zoom);
	c.camera.fov = lerp(c.MIN_ZOOM, c.MAX_ZOOM, zt); 

	update_camera_projection(c.camera, app.view);

	vec3_stack.index = v3_index;
	vec4_stack.index = v4_index;
}