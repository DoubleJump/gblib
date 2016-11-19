function Entity(x,y,z)
{
	var e = {};
	e.name;
	e.id;
	e.parent = null;
	e.children = [];
	e.active = true;
	e.dirty = true;
	e.position = Vec3(x,y,z);
	e.scale = Vec3(1,1,1);
	e.rotation = Vec4(0,0,0,1);
	e.local_matrix = Mat4();
	e.world_matrix = Mat4();
	return e;
}

function entity_set_active(e, val)
{
	e.active = val;
	var n = e.children.length;
	for(var i = 0; i < n; ++i) entity_set_active(e.children[i], val);
}
function entity_set_parent(e, parent)
{
	if(e.parent === parent) return;
	if(e.parent !== null && parent === null) // clearing parent
	{
		entity_remove_child(parent, e);
		e.parent = null;
	}
	else if(e.parent !== null && parent !== null) // swapping parent
	{
		entity_remove_child(parent, e);
		e.parent = parent;
		entity_add_child(parent, e);
	}
	else // setting new parent from null
	{
		e.parent = parent;
		entity_add_child(parent, e);
	}
}
function entity_add_child(e, child)
{
	e.children.push(child);
}
function remove_child(e, child)
{
	e.children.splice(e.children.indexOf(child, 0), 1);
}
function entity_move_f(e, x,y,z)
{
	e.position[0] += x;
	e.position[1] += y;
	e.position[2] += z;
	e.dirty = true;
}
function entity_rotate_f(e, x,y,z)
{
	var rotation = _Vec4();
	quat_set_euler_f(rotation, x, y, z);
	quat_mul(e.rotation, rotation, e.rotation);
	e.dirty = true;
}
function entity_set_position_f(e, x,y,z)
{
	set_vec3(e.position, x,y,z);
	e.dirty = true;
}
function entity_set_scale_f(e, x,y,z)
{
	set_vec3(e.scale, x,y,z);
	e.dirty = true;
}
function entity_set_rotation_f(e, x,y,z)
{
	quat_set_euler_f(e.rotation, x,y,z);
	e.dirty = true;
}
function entity_set_rotation_v(e, v)
{
	quat_set_euler_f(e.rotation, v[0],v[1],v[2]);
	e.dirty = true;
}

function update_entity(e, force)
{
	// if(force === true || e.dirty === true)
	// {
		mat4_compose(e.local_matrix, e.position, e.scale, e.rotation);
		
		if(e.parent === null) vec_eq(e.world_matrix, e.local_matrix);
		else mat4_mul(e.world_matrix, e.local_matrix, e.parent.world_matrix);

		var n = e.children.length;
		for(var i = 0; i < n; ++i) 
		{
			//var index = mat4_stack.index;
			update_entity(e.children[i], true);
			//mat4_stack.index = index;
		}

		e.dirty = false;
	// }
}