gb.Scene = function()
{
	this.world_matrix = gb.mat4.new();
	this.num_entities = 0;
	this.entities = [];
	this.draw_items = [];
	this.animations = [];
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
	    for(var e in ag.entities)
	    {
	        gb.scene.add(ag.entities[e], s);
	    }
	    for(var a in ag.animations)
	    {
	    	var anim = ag.animations[a];
	    	switch(anim.target_type)
	    	{
	    		case 0: // entity transform
	    		{
	    			anim.target = gb.scene.find(anim.target, s);
	    			break;
	    		}
	    		case 1: // material
	    		{
	    			anim.target = gb.scene.find(anim.target, s).material;
	    			break;
	    		}
	    		case 2: // armature
	    		{
	    			break;
	    		}
	    	}
	    	s.animations.push(anim);
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
		if(e.entity_type === gb.EntityType.ENTITY && e.mesh && e.material)
		{
			s.draw_items.push(e);
		}
	},
	update: function(s, dt)
	{
		s = s || gb.scene.current;

		/*
		var n = s.animations.length;
		for(var i = 0; i < n; ++i) 
		{
			var anim = s.animations[i];
			if(anim.is_playing)
			{
				gb.animation.update(anim, dt);
			}
		}
		*/

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