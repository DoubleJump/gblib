gb.EntityType = 
{
	ENTITY: 0,
	CAMERA: 1,
	LAMP: 2,
	SPRITE: 3,
	EMPTY: 4,
	RIG: 5,
}
gb.Entity = function()
{
	this.name;
	this.id;
	this.entity_type = gb.EntityType.EMPTY;
	this.parent = null;
	this.children = [];

	this.active = true;
	this.layer = 0;
	this.dirty = true;

	this.position = gb.vec3.new(0,0,0);
	this.scale = gb.vec3.new(1,1,1);
	this.rotation = gb.quat.new(0,0,0,1);

	this.local_matrix = gb.mat4.new();
	this.world_matrix = gb.mat4.new();
	this.bounds = gb.aabb.new();
}
gb.entity = 
{
	new: function()
	{
		var e = new gb.Entity();
		e.position = gb.vec3.new(0,0,0);
		e.scale = gb.vec3.new(1,1,1);
		e.rotation = gb.quat.new(0,0,0,1);
		e.local_matrix = gb.mat4.new();
		e.world_matrix = gb.mat4.new();
		e.bounds = gb.aabb.new();
		return e;
	},
	mesh: function(mesh, material)
	{
		var e = gb.entity.new();
		e.entity_type = gb.EntityType.ENTITY;
		e.mesh = mesh;
		e.material = material;
		return e;
	},
	set_active: function(e, val)
	{
		e.active = val;
		var n = e.children.length;
		for(var i = 0; i < n; ++i)
		{
			gb.entity.set_active(e.children[i], val);
		}
	},
	set_parent: function(e, parent)
	{
		if (e.parent === parent) return;

		if (e.parent !== null && parent === null) // clearing parent
		{
			gb.entity.remove_child(e.parent, e);
			e.parent = null;
		}
		else if (e.parent !== null && parent !== null) // swapping parent
		{
			gb.entity.remove_child(e.parent, e);
			e.parent = parent;
			gb.entity.add_child(e.parent, e);
		}
		else // setting new parent from null
		{
			e.parent = parent;
			gb.entity.add_child(e.parent, e);
		}
	},
	add_child: function(e, child)
	{
		e.children.push(child);
	},
	remove_child: function(e, child)
	{
		var index = e.children.indexOf(child, 0);
		ASSERT(index == undefined, "Cannot remove child - not found!");
		e.children.splice(index, 1);
	},
	move_f: function(e, x,y,z)
	{
		e.position[0] += x;
		e.position[1] += y;
		e.position[2] += z;
		e.dirty = true;
	},
	rotate_f: function(e, x,y,z)
	{
		var rotation = gb.quat.tmp();
		gb.quat.euler(rotation, x, y, z);
		gb.quat.mul(e.rotation, rotation, e.rotation);
		e.dirty = true;
	},
	set_position: function(e, x,y,z)
	{
		gb.vec3.set(e.position, x,y,z);
		e.dirty = true;
	},
	set_scale: function(e, x,y,z)
	{
		gb.vec3.set(e.scale, x,y,z);
		e.dirty = true;
	},
	set_rotation: function(e, x,y,z)
	{
		gb.quat.euler(e.rotation, x,y,z);
		e.dirty = true;
	},
	set_armature: function(e, a)
	{
		e.entity_type = gb.EntityType.RIG;
		e.rig = a;
	},

	// TODO: needs updating to ensure components get updated on recursive calls
	update: function(e, scene)
	{
		if(e.active === false || e.dirty === false) return;
		if(e.mesh && e.mesh.dirty === true)
		{
			gb.webgl.update_mesh(e.mesh);
		}
		if(e.rig)
		{
			gb.rig.update(e.rig, scene);
		}
		gb.mat4.compose(e.local_matrix, e.position, e.scale, e.rotation);
		if(e.parent === null)
		{
			gb.mat4.eq(e.world_matrix, e.local_matrix);
		}
		else
		{
			gb.mat4.mul(e.world_matrix, e.local_matrix, e.parent.world_matrix);
		}

		var n = e.children.length;
		for(var i = 0; i < n; ++i)
		{
			var child = e.children[i];
			child.dirty = true;
			gb.entity.update(child);
		}
		e.dirty = false;
	},
}
gb.serialize.r_entity = function(br, ag)
{
    var s = gb.serialize;

    var entity = new gb.Entity();
    entity.name = s.r_string(br);

    var parent_name = s.r_string(br);
    if(parent_name !== 'none') 
    {
    	var parent = ag.entities[parent_name];
    	ASSERT(parent, 'Cannot find entity ' + parent_name + ' in asset group');
    	gb.entity.set_parent(entity, parent);
    }

    entity.position = s.r_vec3(br);
    entity.scale = s.r_vec3(br);
    entity.rotation = s.r_vec4(br);
    return entity;
}