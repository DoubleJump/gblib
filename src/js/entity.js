var _ENTITY_COUNT = 0;

var Entity_Type = 
{
	EMPTY: 0,
	CAMERA: 1,
	OBJECT: 2,
	LAMP: 3,
	TEXT: 4,
};

function Entity(x,y,z, parent, draw_info)
{
	var e = {};
	e.name;
	e.entity_type = Entity_Type.EMPTY;
	e.id = _ENTITY_COUNT;
	_ENTITY_COUNT++;
	e.parent = null;
	e.children = [];
	e.active = true;
	e.dirty = true;
	e.position = Vec3(x,y,z);
	e.world_position = Vec3();
	e.scale = Vec3(1,1,1);
	e.rotation = Vec4(0,0,0,1);
	e.local_matrix = Mat4();
	e.world_matrix = Mat4();
	e.draw_info = draw_info ||
	{
		material: null,
		mesh: null,
		instance_mesh: null,
		instance_count: 0,
		transparent: false,
	};
	if(parent) set_parent(e, parent);
	return e;
}

function set_mvp(m, entity, camera)
{
	mat4_mul(m, entity.world_matrix, camera.view_projection);
}

function set_normal_matrix(m, entity, camera)
{
	var m4 = mat4_stack.index;

	var model_view = _Mat4();
    mat4_mul(model_view, entity.world_matrix, camera.view_matrix);

    var inv_model_view = _Mat4();
    mat4_inverse(inv_model_view, model_view);
    mat4_transposed(inv_model_view, inv_model_view);

    mat3_from_mat4(m, inv_model_view);

    mat4_stack.index = m4;
}

function set_active(e, val)
{
	e.active = val;
	var n = e.children.length;
	for(var i = 0; i < n; ++i) entity_set_active(e.children[i], val);
}
function set_parent(e, parent)
{
	if(e.parent === parent) return;
	if(e.parent !== null && parent === null) // clearing parent
	{
		parent.children.splice(parent.children.indexOf(e, 0), 1);
		e.parent = null;
	}
	else if(e.parent !== null && parent !== null) // swapping parent
	{
		e.parent.children.splice(e.parent.children.indexOf(e, 0), 1);
		e.parent = parent;
		parent.children.push(e);
	}
	else // setting new parent from null
	{
		e.parent = parent;
		parent.children.push(e);
	}
}

function get_position(r, e)
{
    mat4_get_position(r, e.world_matrix);
}
function get_scale(r, e)
{
    mat4_get_scale(r, e.world_matrix);
}
function get_rotation(r, e)
{
	mat4_get_rotation(r, e.world_matrix);
}

function rotate_entity(e, v)
{
	var rotation = _Vec4();
	quat_set_euler(rotation,v);
	quat_mul(e.rotation, rotation, e.rotation);
}

function update_entity(e)
{
	mat4_compose(e.local_matrix, e.position, e.scale, e.rotation);

	if(e.parent === null) vec_eq(e.world_matrix, e.local_matrix);
	else mat4_mul(e.world_matrix, e.local_matrix, e.parent.world_matrix);

	var n = e.children.length;
	for(var i = 0; i < n; ++i)
	{
		var index = mat4_stack.index;
		update_entity(e.children[i], true);
		mat4_stack.index = index;
	}

	e.dirty = false;
}