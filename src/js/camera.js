function Camera(near, far, fov, view, ortho)
{
	var c = Entity(0,0,0);
	c.projection = Mat4();
	c.view = Mat4();
	c.view_projection = Mat4();
	c.normal = Mat3();
	c.mask = 0;
	c.aspect = 1.0;
	c.near = near;
	c.far = far;
	c.fov = fov;
	c.size = 1.0;
	c.ortho = ortho || false
	update_camera_projection(c, view);
	return c;
}
function UICamera(view)
{
	var c = Camera(0.01,1,60, view, true);
    set_vec3(c.position, view[2] / 2, -view[3] / 2, 0);
    return c;
}

function update_camera_projection(c, view)
{
	c.aspect = view[2] / view[3];
	if(c.ortho)
	{
		c.size = view[3];
		ortho_projection(c.projection, c.size * c.aspect,c.size,c.near,c.far);
	}
	else 
	{
		perspective_projection(c.projection, c.near, c.far, c.aspect, c.fov);
	}
}

function update_camera(c)
{
	update_entity(c, true);
	mat4_inverse_affine(c.view, c.world_matrix);
	mat4_mul(c.view_projection, c.view, c.projection);
	
	mat3_from_mat4(c.normal, c.view);
	mat3_inverse(c.normal, c.normal);
	mat3_transposed(c.normal, c.normal);
}