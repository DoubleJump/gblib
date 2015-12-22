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
	return this;
}
gb.camera = 
{
	new: function(projection, near, far, fov, mask)
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
	    c.scale = 1;
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
		var m_delta = gb.input.mouse_delta;
		var ROTATE_SPEED = 10.0;
		gb.entity.rotate_f(e, -m_delta[1] * ROTATE_SPEED * dt, -m_delta[0] * ROTATE_SPEED * dt, 0);

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
	}
	//END
}

gb.Projection = 
{
    ORTHO: 0,
    PERSPECTIVE: 1,
}

gb.serialize.r_camera = function(br, ag)
{
    var s = gb.serialize;
    var entity = s.r_entity(br, ag);
    entity.entity_type = gb.EntityType.CAMERA;
    var c = new gb.Camera();
    var camera_type = s.r_i32(br);
    if(camera_type === 0) 
    {
    	c.projection_type = gb.Projection.PERSPECTIVE;
    }
    else 
    {
    	c.projection_type = gb.Projection.ORTHO;
    	c.scale = s.r_f32(br);
    }
    c.near = s.r_f32(br);
    c.far = s.r_f32(br);
    c.fov = s.r_f32(br);
    c.dirty = true;
    entity.camera = c;
    c.entity = entity;
    return entity;
}