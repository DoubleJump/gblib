gb.Scene = function()
{
	this.world_matrix = gb.mat4.new();
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
			gb.entity.update(e, s);
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
					//gb.rig.update(e.rig, s);
					break;
				}
			}
		}
	},
}