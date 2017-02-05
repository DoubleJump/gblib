var _ENTITY_COUNT = 0;

function Entity(x,y,z, parent)
{
	var e = {};
	e.name;
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
	if(parent) set_parent(e, parent);
	return e;
}

function set_mvp(m, entity, camera)
{
	mat4_mul(m, entity.world_matrix, camera.view_projection);
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

function update_entity(e, force)
{
	if(force === true || e.dirty === true)
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
}