gb.Scene = function()
{
	this.name;
	this.active_camera = null;
	this.world_matrix = gb.mat4.new();
	this.num_entities = 0;
	this.entities = [];
	this.draw_items = [];
	this.animations = [];
	//DEBUG
	this.fly_mode = false;
	//END
}
gb.scene = 
{
	scenes: {},
	current: null,

	new: function(name, make_active)
	{
		var scene = new gb.Scene();
		scene.name = name;
		gb.scene.scenes[name] = scene;
		if(make_active) gb.scene.current = scene;
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
	add: function(entity, s)
	{
		var e = entity.entity || entity;
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

		var n = s.animations.length;
		for(var i = 0; i < n; ++i) 
		{
			var anim = s.animations[i];
			if(anim.is_playing)
			{
				gb.animation.update(anim, dt);
			}
		}

		//DEBUG
		if(gb.input.down(gb.Keys.f))
		{
			s.fly_mode = !s.fly_mode;
		}
		if(s.active_camera && s.fly_mode === true)
		{
			gb.camera.fly(s.active_camera, dt);
		}
		//END

		var n = s.num_entities;
		for(var i = 0; i < n; ++i) 
		{
			gb.entity.update(s.entities[i], s);
		}
	},
}
gb.serialize.r_scene = function(br, ag)
{
	var s = gb.serialize;
	var scene = new gb.Scene();
	scene.name = s.r_string(br);
    LOG("Loading Scene: " + scene.name);

    var scene_complete = false;
    while(scene_complete === false)
    {
        var import_type = s.r_i32(br);
        switch(import_type)
        {
            case 0:
            {
                var entity = s.r_camera(br, ag);
                ag.entities[entity.name] = entity;
                LOG("Loaded Camera: " + entity.name);
                break;                        
            }
            case 1:
            {
                var entity = s.r_lamp(br, ag);
                ag.entities[entity.name] = entity;
                LOG("Loaded Lamp: " + entity.name);
                break;
            }
            case 2:
            {
                var mesh = s.r_mesh(br);
                ag.meshes[mesh.name] = mesh;
                LOG("Loaded Mesh: " + mesh.name);
                break;
            }
            case 3:
            {
                var material = s.r_material(br, ag);
                ag.materials[material.name] = material;
                LOG("Loaded Material: " + material.name);
                break;
            }
            case 4:
            {
                var action = s.r_action(br);
                ag.animations[action.name] = action;
                LOG("Loaded Action: " + action.name);
                break;
            }
            case 5:
            {
                var entity = s.r_entity(br, ag);
                entity.material = ag.materials[s.r_string(br)];
                entity.mesh = ag.meshes[s.r_string(br)];
                entity.entity_type = gb.EntityType.ENTITY;
                ag.entities[entity.name] = entity;
                LOG("Loaded Entity: " + entity.name);
                break;
            }
            case 6:
            {
                var entity = s.r_entity(br, ag);
                ag.entities[empty.name] = empty;
                LOG("Loaded Entity: " + empty.name);
                break;
            }
            case 7:
            {
                var rig = s.r_rig(br, ag);
                ag.rigs[rig.name] = rig;
                LOG("Loaded Rig: " + rig.name);
                break;
            }
            case 8:
            {
                var action = s.r_rig_action(br);
                ag.animations[action.name] = action;
                LOG("Loaded Action: " + action.name);
                break;
            }
            case -101: //FINISH
            {
                scene_complete = true;
                break;
            }
        }
    }

    gb.scene.scenes[scene.name] = scene;
    gb.scene.load_asset_group(ag, scene);
}