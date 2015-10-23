gb.Camera = function()
{
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
	this.entity;
}

gb.camera = 
{
	new: function(projection, near, far, fov, mask)
	{
		var e = gb.entity.new();
	    var c = new gb.Camera();
	    c.projection_type = projection || gb.Projection.PERSPECTIVE;
	    c.near = near || 0.1;
	    c.far = far || 100;
	    c.fov = fov || 60;
	    c.mask = mask || 0;
	    e.camera = c;
	    return e;
	},
	update_projection: function(c, view)
	{
		c.aspect = view.width / view.height;

		var m = c.projection;

		if(c.projection_type === gb.Projection.ORTHO)
		{
			m[ 0] = 2.0 / view.width;
			m[ 5] = 2.0 / view.height;
			m[10] = -2.0 / (c.far - c.near);
			m[14] = 0.0;
			m[15] = 1.0;	
		}
		else
		{
			var h = 1.0 / gb.math.tan(c.fov * gb.math.PI_OVER_360);
			var y = c.near - c.far;
			
			m[ 0] = h / c.aspect;
			m[ 5] = h;
			m[10] = (c.far + c.near) / y;
			m[11] = -1.0;
			m[14] = 2.0 * (c.near * c.far) / y;
			m[15] = 0.0;
		}

		c.dirty = false;
	},

	set_clip_range: function(c, near, far)
	{
		c.near = near;
		c.far = far;
		c.dirty = true;
	},
}

gb.Projection = 
{
    ORTHO: 0,
    PERSPECTIVE: 1,
}

gb.serialize.r_camera = function(entity, br, ag)
{
    var s = gb.serialize;
    s.r_entity(entity, br, ag);
    var camera = new gb.Camera();
    var camera_type = s.r_i32(br);
    camera.near = s.r_f32(br);
    camera.far = s.r_f32(br);
    camera.fov = s.r_f32(br);
    if(camera_type === 0) camera.projection_type = gb.Projection.PERSPECTIVE;
    else camera.projection_type = gb.Projection.ORTHO;
    camera.dirty = true;
    entity.camera = camera;
}