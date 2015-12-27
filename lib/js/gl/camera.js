gb.Camera = function()
{
	this.entity;
	this.projection_type = null;
	this.projection = gb.mat4.new();
	this.view = gb.mat4.new();
	this.view_projection = gb.mat4.new();
	this.normal = gb.mat3.new();
	this.mask = 0;
	this.dirty = true;
	this.aspect;
	this.near;
	this.far;
	this.fov;
	this.scale;
	//DEBUG
	this.angle_x = 0;
	this.angle_y = 0;
	//END
	return this;
}
gb.camera = 
{
	new: function(projection, near, far, fov, mask, scale)
	{
		var e = gb.entity.new();
		e.entity_type = gb.EntityType.CAMERA;
		e.update = gb.camera.update;
	    var c = new gb.Camera();
	    c.projection_type = projection || gb.Projection.PERSPECTIVE;
	    c.near = near || 0.1;
	    c.far = far || 100;
	    c.fov = fov || 60;
	    c.mask = mask || 0;
	    c.scale = scale || 1;
	    c.entity = e;
	    e.camera = c;
	    return c;
	},
	update_projection: function(c, view)
	{
		c.aspect = view.width / view.height;
		if(c.projection_type === gb.Projection.ORTHO)
		{
			gb.mat4.ortho_projection(c.projection, c.scale * c.aspect, c.scale, c.near, c.far);
		}
		else
		{
			gb.mat4.perspective_projection(c.projection, c.far, c.near, c.aspect, c.fov);
		}
		c.dirty = false;
	},

	set_clip_range: function(c, near, far)
	{
		c.near = near;
		c.far = far;
		c.dirty = true;
	},

	update: function(e)
	{
		ASSERT(e.camera, 'Entity is not a camera');
		var c = e.camera;
		if(c.dirty === true)
		{
			gb.camera.update_projection(c, gb.webgl.view);
		}
		gb.mat4.inverse(c.view, e.world_matrix);
		gb.mat4.mul(c.view_projection, c.view, c.projection);
		gb.mat3.from_mat4(c.normal, c.view);
		gb.mat3.inverse(c.normal, c.normal);
		gb.mat3.transposed(c.normal, c.normal);
	},

	//DEBUG
	fly: function(c, dt)
	{
		var e = c.entity;
		var index = gb.vec3.stack.index;

		var m_delta = gb.input.mouse_delta;
		var ROTATE_SPEED = 30.0;
		var X_LIMIT = 80.0;

		c.angle_x -= m_delta[1] * ROTATE_SPEED * dt;
		c.angle_y -= m_delta[0] * ROTATE_SPEED * dt;
		
		//if(c.angle_x > X_LIMIT) c.angle_x = X_LIMIT;
		//else if(c.angle_x < -X_LIMIT) c.angle_x = -X_LIMIT;

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
	//END
}

gb.Projection = 
{
    ORTHO: 0,
    PERSPECTIVE: 1,
}

gb.binary_reader.camera = function(br, ag)
{
    var s = gb.binary_reader;

    var e = s.entity(br, ag);
    e.entity_type = gb.EntityType.CAMERA;
    e.update = gb.camera.update;

    var c = new gb.Camera();
    e.camera = c;

    var camera_type = s.i32(br);
    if(camera_type === 0) 
    {
    	c.projection_type = gb.Projection.PERSPECTIVE;
    }
    else 
    {
    	c.projection_type = gb.Projection.ORTHO;
    	c.scale = s.f32(br);
    }
    c.near = s.f32(br);
    c.far  = s.f32(br);
    c.fov  = s.f32(br);
    c.mask = 0;
    c.entity = e;
    return c;
}