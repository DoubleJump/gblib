gb.Entity = function()
{
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
			e.parent.remove_child(e);
			e.parent = null;
		}
		else if (e.parent !== null && parent !== null) // swapping parent
		{
			e.parent.remove_child(e);
			e.parent = parent;
			e.parent.add_child(e);
		}
		else // setting new parent from null
		{
			e.parent = parent;
			e.parent.add_child(e);
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


gb.Scene = function()
{
	this.num_entities = 0;
	this.num_cameras = 0;
	this.num_sprites = 0;
	this.entities = [];
	this.cameras = [];
	this.sprites = [];
	//this.render_groups: [],
}
gb.scene = 
{
	new: function()
	{
		return new gb.Scene();
	},
	add_entity: function(s, e)
	{
		s.entities.push(e);
		s.num_entities++;
	},
	
	add_camera: function(s, c)
	{
		s.cameras.push(c);
		s.entities.push(c.entity);
		s.num_entities++;
		s.num_cameras++;
    	gb.camera.update_projection(c, gb.webgl.view);
	},

	add_sprite: function(s, spr)
	{
		s.sprites.push(spr);
		s.entities.push(spr.entity);
		s.num_entities++;
		s.num_sprites++;
	},

	update_camera: function(c)
	{
		ASSERT(c.entity != null, "Camera has no transform!");
		if(c.dirty === true)
		{
			gb.camera.update_projection(c);
		}
		gb.mat4.inverse(c.view, c.entity.world_matrix);
		gb.mat4.mul(c.view_projection, c.view, c.projection);
	},

	update_entity: function(e)
	{
		if(e.active === false || e.dirty === false) return;
		if(e.mesh !== null && e.mesh.dirty === true)
		{
			gb.webgl.update_mesh(e.mesh);
		}
		gb.mat4.compose(e.world_matrix, e.position, e.scale, e.rotation);
		if(e.parent !== null)
		{
			gb.mat4.mul(e.world_matrix, e.parent.world_matrix);
		}
		for(var i = 0; i < e.num_children; ++i)
		{
			gb.scene.update_entity(e.children[i]);
		}
	},

	update: function(s)
	{
		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			gb.scene.update_entity(s.entities[i]);
		}
		n = s.num_cameras;
		for(var i = 0; i < n; ++i)
		{
			gb.scene.update_camera(s.cameras[i]);
		}
		n = s.num_sprites;
		for(var i = 0; i < n; ++i)
		{
			gb.sprite.update(s.sprites[i]);
		}
	},
}