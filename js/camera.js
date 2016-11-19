function Camera(near, far, fov, view)
{
	var c = {};
    c.entity = Entity(0,0,0);
	c.projection = Mat4();
	c.view = Mat4();
	c.view_projection = Mat4();
	c.normal = Mat3();
	c.mask = 0;
	c.aspect = 1.0;
	c.near = near;
	c.far = far;
	c.fov = fov;
	c.scale = 1.0;
	update_camera_projection(c, view);
	return c;
}
function update_camera_projection(c, view)
{
	c.aspect = view[2] / view[3];
	perspective_projection(c.projection, c.near, c.far, c.aspect, c.fov);
}
function update_camera(c)
{
	update_entity(c.entity, true);
	mat4_inverse_affine(c.view, c.entity.world_matrix);
	mat4_mul(c.view_projection, c.view, c.projection);

	//mat3_from_mat4(c.normal, c.view);
	//mat3_inverse(c.normal, c.normal);
	//mat3_transposed(c.normal, c.normal);
}