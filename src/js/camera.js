gb.Camera = function()
{
	this.projection_type = null;
	this.projection = new gb.Mat4();
	this.view = new gb.Mat4();
	this.view_projection = new gb.Mat4();
	this.mask;
	this.dirty;
	this.aspect;
	this.near;
	this.far;
	this.fov;
	this.entity;
}

gb.camera = 
{
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

gb.new_camera = function(projection, near, far, fov, mask)
{
    var c = new gb.Camera();
    c.projection_type = projection || gb.Projection.PERSPECTIVE;
    c.near = near || 0.1;
    c.far = far || 100;
    c.fov = fov || 60;
    c.mask = mask || 0;
    c.dirty = true;
    c.entity = new gb.Entity();
    gb.camera.update_projection(c, gb.webgl.view);
    return c;
}