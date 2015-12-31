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