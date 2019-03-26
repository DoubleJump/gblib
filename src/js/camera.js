function Camera(near, far, fov, view, ortho, ortho_size)
{
	var c = Entity(0,0,0);
	c.projection = Mat4();
	c.view_matrix = Mat4();
	c.view_projection = Mat4();
	c.view = view;
	c.mask = 0;
	c.aspect = view[2] / view[3];
	c.near = near;
	c.far = far;
	c.fov = fov;
	c.size = ortho_size || 1.0;
	c.ortho = ortho || false
	update_camera_projection(c, view);
	return c;
}
function Perspective_Camera(view)
{
	return Camera(0.01,100,60,view,false,1.0);
}

function UI_Camera(view)
{
	var c = Camera(0.01,1,60, view, true, view[3]);
    set_vec3(c.position, view[2] / 2, view[3] / 2, 0);
    update_camera(c);
    return c;
}

function update_camera_projection(c, view)
{
	c.view = view;
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
	mat4_inverse_affine(c.view_matrix, c.world_matrix);
	mat4_mul(c.view_projection, c.view_matrix, c.projection);
}