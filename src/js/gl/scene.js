gb.Scene = function()
{
	this.num_entities = 0;
	this.entities = [];
}
gb.scene = 
{
	new: function()
	{
		return new gb.Scene();
	},
	load_asset_group: function(s, ag)
	{
	    for(var entity in ag.entities)
	    {
	        gb.scene.add(s, ag.entities[entity]);
	    }
	},	
	find: function(s, name)
	{
		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			var e = s.entities[i];
			if(e.name === name) return e;
		}
		return null;
	},
	add: function(s, e)
	{
		s.entities.push(e);
		s.num_entities++;
	},
	update: function(s)
	{
		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			var e = s.entities[i];
			gb.entity.update(e);
			switch(e.entity_type)
			{
				case gb.EntityType.CAMERA:
				{
					gb.camera.update(e.camera);
					break;
				}
				case gb.EntityType.LAMP:
				{
					//gb.lamp.update(e.lamp);
					break;
				}
				case gb.EntityType.RIG:
				{
					//gb.scene.update_rig(e.rig);
					break;
				}
			}
		}
	},
	update_rig: function(rig)
	{
		var n = rig.joints.length;
		for(var i = 0; i < n; ++i)
		{
			var j = rig.joints[i];
			gb.mat4.compose(j.local_matrix, j.position, j.scale, j.rotation);
			if(j.parent !== -1)
			{
				var parent = rig.joints[j.parent];
				gb.mat4.mul(j.world_matrix, j.local_matrix, j.parent.world_matrix);
			}
			else
			{
				gb.mat4.eq(j.world_matrix, j.local_matrix);
			}
			
			gb.mat4.mul(j.world_matrix, j.world_matrix, j.inverse_bind_pose);
		}
	},

	/*
	gb.Rig = function()
	{
		this.joints = [];	
	}
	gb.Joint = function()
	{
		this.parent = -1;
		this.position = gb.vec3.new();
		this.scale = gb.vec3.new();
		this.rotation = gb.quat.new();
		this.local_matrix = gb.mat4.new();
		this.world_matrix = gb.mat4.new(); 
		this.inverse_bind_pose = gb.mat4.new();
	}
	*/
}