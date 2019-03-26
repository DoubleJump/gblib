var OrbitCameraState = 
{
	INTRO: -1,
	MANUAL: 0,
	DEMO: 1,
	FIXED: 2,
	TARGETING: 3,
}
function OrbitCamera(camera, offset, root)
{
	var r = Entity(0,0,0, root);
	r.state = OrbitCameraState.INTRO;
	r.spin = 0.005215655794835147;
	r.tilt = 0.248;
	r.zoom = 0.8790745733129696;
	r.target_angle = Vec3();
	r.velocity = Vec3();
	r.TILT_LIMIT = 0.8;
	r.TILT_SPEED = 0.1;
	r.SPIN_SPEED = 0.1;
	r.ZOOM_SPEED = 0.05;
	r.MIN_ZOOM = 5;
	r.MAX_ZOOM = 50;
	r.TARGET_EPSILON = 0.0001;

	if(window.isIos || input.is_touch_device === true)
	{
		r.SPIN_SPEED = 0.3;
		r.TILT_SPEED = 0.3;
	}
	if(app.view[3] > app.view[2])
	{
		r.MAX_ZOOM = 70;
		r.zoom = 0.8790745733129696;
	}

	
	r.ease_curve = Curve(2, 
	[
		0,0, 0.1,0.0,
		0.9,1.0, 1,1,
	]);
	r.camera = camera;
	r.has_clicked = false;

	set_vec3(camera.position, 0,0,offset);
    set_parent(camera, r);
	return r;
}

function update_orbit_camera(c, dt)
{
	var v3_index = vec3_stack.index;
	var v4_index = vec4_stack.index;

	var accel = _Vec3();
	var tilt;
	var spin;

	switch(c.state)
	{
		case OrbitCameraState.INTRO:
		{
			
			break;
		}
		case OrbitCameraState.DEMO:
		{
			accel[1] -= c.SPIN_SPEED * 0.01 * dt;
			vec_add(c.velocity, accel, c.velocity);
			vec_mul_f(c.velocity, c.velocity, 0.9);
			c.spin = wrap_normal(c.spin + c.velocity[1]);

			if(key_down(Keys.MOUSE_LEFT))
			{
				c.state = OrbitCameraState.MANUAL;
			}

			tilt = lerp(-90, 90, c.tilt);
			spin = c.spin * 360;

			break;
		}
		case OrbitCameraState.MANUAL:
		{
			var ss = lerp(c.SPIN_SPEED * 0.2, c.SPIN_SPEED, c.zoom);
			var ts = lerp(c.TILT_SPEED * 0.2, c.TILT_SPEED, c.zoom);


			if(key_held(Keys.MOUSE_LEFT) && app.globe.active_player === null) 
			{
				accel[1] -= input.mouse.delta[0] * ss * 0.01 *dt;
				accel[0] -= input.mouse.delta[1] * ts * 0.03 *dt;

				app.analytics.distance_rotated_x += accel[1];
				app.analytics.distance_rotated_y += accel[0];
			}

			if(input.mouse.scroll !== 0)
			{
				accel[2] += input.mouse.scroll * c.ZOOM_SPEED * 5.0 * dt;
				//c.zoom += input.mouse.scroll * c.ZOOM_SPEED * 5.0 * dt;

				app.analytics.distance_zoomed += accel[2];
			}

			//pinch zoom
			var ta = input.touches[0];
			var tb = input.touches[1];
			if(ta.is_touching && tb.is_touching)
			{
				var cur_dist = vec_distance(ta.position, tb.position);
				var last_dist = vec_distance(ta.last_position, tb.last_position);
				var delta = cur_dist - last_dist;

				c.velocity[2] = -delta * c.ZOOM_SPEED * dt;		

				app.analytics.distance_zoomed += delta * c.ZOOM_SPEED * dt;

				accel[0] = 0;
				accel[1] = 0;
			}

			vec_add(c.velocity, accel, c.velocity);
			vec_mul_f(c.velocity, c.velocity, 0.9);
			
			c.spin = wrap_normal(c.spin + c.velocity[1]);
			c.tilt += c.velocity[0];

			if(c.tilt < 1 - c.TILT_LIMIT)
			{
				c.tilt = 1 - c.TILT_LIMIT;
				c.velocity[0] = 0;
			}
			if(c.tilt > c.TILT_LIMIT)
			{
				c.tilt = c.TILT_LIMIT;
				c.velocity[0] = 0;
			}

			c.zoom = clamp(c.zoom + c.velocity[2], 0,1);
			tilt = lerp(-90, 90, c.tilt);

			spin = c.spin * 360;

			break;
		}
		case OrbitCameraState.TARGETING:
		{
			set_vec3(accel, 0,0,0);
			set_vec3(c.velocity, 0,0,0);

			var tx = c.target_angle[0];
			var ty = c.target_angle[1];
			c.spin = smooth_angle_towards(c.spin, tx, 5.0 * dt, c.TARGET_EPSILON);
			c.spin = wrap_normal(c.spin);
			c.tilt = smooth_float_towards(c.tilt, ty, 5.0 * dt, c.TARGET_EPSILON);
			c.zoom = smooth_float_towards(c.zoom, c.target_zoom, 5.0 * dt, c.TARGET_EPSILON);

			if(Math.abs(c.spin - tx) <= c.TARGET_EPSILON &&
				Math.abs(c.tilt - ty) <= c.TARGET_EPSILON &&
				Math.abs(c.zoom - c.target_zoom ) <= c.TARGET_EPSILON)
			{
				c.state = OrbitCameraState.MANUAL;
			}
			
			if(c.tilt < 1 - c.TILT_LIMIT)
			{
				c.tilt = 1 - c.TILT_LIMIT;
			}
			if(c.tilt > c.TILT_LIMIT)
			{
				c.tilt = c.TILT_LIMIT;
			}

			tilt = lerp(-90, 90, c.tilt);
			spin = c.spin * 360;

			break;
		}
	}

	var rot_x = _Vec4(0,0,0,1);
	var rot_y = _Vec4(0,0,0,1);
	quat_set_angle_axis(rot_x, tilt, _Vec3(1,0,0));
	quat_set_angle_axis(rot_y, spin, _Vec3(0,1,0));
	quat_mul(c.rotation, rot_y, rot_x);

	var zt = eval_curve_f(c.ease_curve, c.zoom);
	c.camera.fov = lerp(c.MIN_ZOOM, c.MAX_ZOOM, c.zoom); 

	vec3_stack.index = v3_index;
	vec4_stack.index = v4_index;
}

function target_camera_at(c, location, zoom)
{
	c.target_angle[0] = wrap_angle(((location[1] + 180)) + 180) / 360;
	c.target_angle[1] = (1.0-(location[0] + 90)/180);
	c.target_zoom = zoom;
	c.state = OrbitCameraState.TARGETING;
}