gb.Material = function()
{
	this.shader;
	this.uniforms;
	this.textures;
}
gb.material = 
{
	new: function(shader)
	{
		var m = new gb.Material();
		m.shader = shader;
		m.uniforms = {};
		for(var key in shader.uniforms)
		{
			m.uniforms[key] = null;
		}
		return m;
	},
}

gb.Entity = function()
{
	this.parent;
	this.children;
	this.active;
	this.layer;
	this.dirty;
	this.local_matrix;
	this.world_matrix;
}
gb.entity = 
{
	new: function()
	{
		var e = new gb.Entity();
		e.parent = null;
		e.children = [];
		e.active = true;
		e.layer = 0;
		e.dirty = true;
		e.local_matrix = gb.mat3.new();
		e.world_matrix = gb.mat3.new();
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
}


gb.Scene = function()
{
	this.matrix;
	this.num_entities;
	//this.num_cameras;
	this.entities;
	//this.cameras;
}
gb.scene = 
{
	new: function()
	{
		var s = new gb.Scene();
		s.matrix = gb.mat3.new();
		s.num_entities = 0;
		s.entities = [];
		return s;
	},
	add_entity: function(s, e)
	{
		s.entities.push(e);
		s.num_entities++;
	},
	
	/*
	add_camera: function(s, c)
	{
		s.cameras.push(c);
		s.entities.push(c.entity);
		s.num_entities++;
		s.num_cameras++;
    	//gb.camera.update_projection(c, gb.webgl.view);
	},

	add_sprite: function(s, spr)
	{
		s.sprites.push(spr);
		s.entities.push(spr.entity);
		s.num_entities++;
		s.num_sprites++;
	},
	*/

	/*
	update_camera: function(c)
	{
		ASSERT(c.entity != null, "Camera has no transform!");
		if(c.dirty === true)
		{
			gb.camera.update_projection(c);
		}
		gb.mat4.inverse(c.view, c.entity.world_matrix);
		gb.mat4.mul(c.view_projection, c.view, c.projection);
		gb.mat3.from_mat4(c.normal, c.view);
		gb.mat3.inverse(c.normal, c.normal);
		gb.mat3.transposed(c.normal, c.normal);
	},
	*/

	update_entity: function(s, e)
	{
		if(e.active === false || e.dirty === false) return;
		var m3 = gb.mat3;

		m3.eq(e.world_matrix, e.local_matrix);
		if(e.parent !== null)
		{
			m3.mul(e.world_matrix, e.world_matrix, e.parent.world_matrix);
		}
		for(var i = 0; i < e.num_children; ++i)
		{
			gb.scene.update_entity(e.children[i]);
		}
		m3.mul(e.world_matrix, e.world_matrix, s.matrix);
	},

	update: function(s)
	{
		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			gb.scene.update_entity(s, s.entities[i]);
		}
		/*
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
		*/
	},
}