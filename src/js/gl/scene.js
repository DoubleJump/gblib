gb.Scene = function()
{
	this.world_matrix = gb.mat4.new();
	this.num_entities = 0;
	this.entities = [];
}
gb.scene = 
{
	current: null,

	new: function(assets)
	{
		var scene = new gb.Scene();
		if(assets)
			gb.scene.load_asset_group(assets, scene);
		return scene;
	},
	load_asset_group: function(ag, s)
	{
		s = s || gb.scene.current;
	    for(var entity in ag.entities)
	    {
	        gb.scene.add(ag.entities[entity], s);
	    }
	},	
	find: function(name, s)
	{
		s = s || gb.scene.current;
		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			var e = s.entities[i];
			if(e.name === name) return e;
		}
		return null;
	},
	add: function(e, s)
	{
		s = s || gb.scene.current;
		s.entities.push(e);
		s.num_entities++;
	},
	update: function(s)
	{
		s = s || gb.scene.current;
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
			}
		}
	},
}