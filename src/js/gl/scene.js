gb.Scene = function()
{
	this.num_entities = 0;
	this.num_cameras = 0;
	this.num_sprites = 0;
	this.num_lamps = 0;
	this.entities = [];
	this.cameras = [];
	this.lamps = [];
	this.sprites = [];
	//this.render_groups: [],
}
gb.scene = 
{
	new: function()
	{
		return new gb.Scene();
	},
	load_asset_group: function(s, ag)
	{
		for(var camera in ag.cameras)
	    {
	        s.add_camera(ag.cameras[camera]);
	    }
	    for(var lamp in ag.lamps)
	    {
	        s.add_lamp(ag.lamps[lamp]);
	    }
	    for(var empty in ag.empties)
	    {
	        s.add_entity(ag.empties[empty]);
	    }
	    for(var entity in ag.entities)
	    {
	        s.add_entity(ag.entities[entity]);
	    }
	},	
	find: function(s, name, root)
	{
		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			var e = s.entities[i];
			if(e.name === name) return e;
		}
		return null;
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
	add_lamp: function(s, l)
	{
		s.lamps.push(l);
		s.entities.push(l.entity);
		s.num_entities++;
		s.num_lamps++;
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
		gb.mat3.from_mat4(c.normal, c.view);
		gb.mat3.inverse(c.normal, c.normal);
		gb.mat3.transposed(c.normal, c.normal);
	},

	update_entity: function(e)
	{
		if(e.active === false || e.dirty === false) return;
		if(e.mesh !== null && e.mesh.dirty === true)
		{
			gb.webgl.update_mesh(e.mesh);
		}
		gb.mat4.compose(e.local_matrix, e.position, e.scale, e.rotation);
		if(e.parent !== null)
		{
			gb.mat4.mul(e.world_matrix, e.local_matrix, e.parent.world_matrix);
		}
		else
		{
			gb.mat4.eq(e.world_matrix, e.local_matrix);
		}
		var n = e.children.length;
		for(var i = 0; i < n; ++i)
		{
			var child = e.children[i];
			child.dirty = true;
			gb.scene.update_entity(child);
		}
		e.dirty = false;
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