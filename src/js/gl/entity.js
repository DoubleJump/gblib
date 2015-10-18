gb.Entity = function()
{
	this.name;
	this.id;
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

	this.material = null;
	this.mesh = null;
}
gb.entity = 
{
	new: function()
	{
		return new gb.Entity();
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
}
gb.serialize.r_entity = function(br, ag)
{
    var s = gb.serialize;
    var entity = new gb.Entity();
    var parent_name = s.r_string(br);
    
    entity.position[0] = s.r_f32(br);
    entity.position[1] = s.r_f32(br);
    entity.position[2] = s.r_f32(br);
    entity.scale[0] = s.r_f32(br);
    entity.scale[1] = s.r_f32(br);
    entity.scale[2] = s.r_f32(br);
    entity.rotation[0] = s.r_f32(br);
    entity.rotation[1] = s.r_f32(br);
    entity.rotation[2] = s.r_f32(br);
    entity.rotation[3] = s.r_f32(br);

    if(parent_name !== 'none') 
    {
    	var parent = ag.entities[parent_name];
    	gb.entity.set_parent(entity, parent);
    }

    return entity;
}