gb.Entity = function()
{
	this.parent = null;
	this.children = [];

	this.active = true;
	this.layer = 0;
	this.dirty = true;

	this.position = new gb.Vec3(0,0,0);
	this.scale = new gb.Vec3(1,1,1);
	this.rotation = new gb.Quat(0,0,0,1);

	this.local_matrix = new gb.Mat4();
	this.world_matrix = new gb.Mat4();
	this.bounds = new gb.AABB();

	this.mesh = null;
}
gb.entity = 
{
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
gb.new_entity = function(mesh, scene)
{
	var e = new gb.Entity();
	e.mesh = mesh;
	gb.scene.add_entity(scene, e);
	return e;
}

gb.Scene = function()
{
	this.num_entities = 0;
	this.num_cameras = 0;
	this.entities = [];
	this.cameras = [];
	//this.render_groups: [],
}
gb.scene = 
{
	add_entity: function(s, e, rg)
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
		var ne = s.num_entities;
		for(var i = 0; i < ne; ++i) 
		{
			gb.scene.update_entity(s.entities[i]);
		}
		var nc = s.num_cameras;
		for(var i = 0; i < nc; ++i)
		{
			gb.scene.update_camera(s.cameras[i]);
		}
	},
}