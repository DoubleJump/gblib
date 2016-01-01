gb.Scene = function()
{
	this.name;
	this.active_camera = null;
	this.world_matrix = gb.mat4.new();
	this.num_entities = 0;
	this.entities = [];
	this.draw_items;
	this.num_draw_items;
	this.animations = [];
}
gb.scene = 
{
	scenes: {},
	current: null,

	new: function(name, make_active)
	{
		var scene = new gb.Scene();
		scene.name = name;
		scene.draw_items = new Uint32Array(64);
		scene.num_draw_items = 0;
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
		e.id = s.num_entities;
		s.num_entities++;

		if(e.entity_type === gb.EntityType.CAMERA && s.active_camera === null)
		{
			s.active_camera = e.camera;
		}
	},
	update: function(dt, s)
	{
		s = s || gb.scene.current;
		if(!s) return;

		var n = s.animations.length;
		for(var i = 0; i < n; ++i) 
		{
			var anim = s.animations[i];
			if(anim.is_playing)
			{
				gb.animation.update(anim, dt);
			}
		}

		var n = s.num_entities;
		s.num_draw_items = 0;
		for(var i = 0; i < n; ++i) 
		{
			var e = s.entities[i];
			if(e.active === true)
			{
				gb.entity.update(e, s);

				if(e.mesh && e.material)
				{
					s.draw_items[s.num_draw_items] = e.id;
					s.num_draw_items++;
				}
			}
		}
	},
}
gb.binary_reader.scene = function(br, ag)
{
	var s = gb.binary_reader;
	var name = s.string(br);
    LOG("Loading Scene: " + name);

    var scene_complete = false;
    while(scene_complete === false)
    {
        var import_type = s.i32(br);
        switch(import_type)
        {
            case 0:
            {
                var camera = s.camera(br, ag);
                ag.entities[camera.entity.name] = camera;
                LOG("Loaded Camera: " + camera.entity.name);
                break;                        
            }
            case 1:
            {
                var entity = s.lamp(br, ag);
                ag.entities[entity.name] = entity;
                LOG("Loaded Lamp: " + entity.name);
                break;
            }
            case 2:
            {
                var mesh = s.mesh(br);
                ag.meshes[mesh.name] = mesh;
                LOG("Loaded Mesh: " + mesh.name);
                break;
            }
            case 3:
            {
                var material = s.material(br, ag);
                ag.materials[material.name] = material;
                LOG("Loaded Material: " + material.name);
                break;
            }
            case 4:
            {
                var action = s.action(br);
                ag.animations[action.name] = action;
                LOG("Loaded Action: " + action.name);
                break;
            }
            case 5:
            {
                var entity = s.entity(br, ag);
                entity.material = ag.materials[s.string(br)];
                entity.mesh = ag.meshes[s.string(br)];
                entity.entity_type = gb.EntityType.ENTITY;
                ag.entities[entity.name] = entity;
                LOG("Loaded Entity: " + entity.name);
                break;
            }
            case 6:
            {
                var entity = s.entity(br, ag);
                ag.entities[empty.name] = empty;
                LOG("Loaded Entity: " + empty.name);
                break;
            }
            case 7:
            {
                var rig = s.rig(br, ag);
                ag.rigs[rig.name] = rig;
                LOG("Loaded Rig: " + rig.name);
                break;
            }
            case 8:
            {
                var action = s.rig_action(br);
                ag.animations[action.name] = action;
                LOG("Loaded Action: " + action.name);
                break;
            }
            case 9:
            {
            	var name = s.string(br);
            	var curve = s.curve(br);
            	ag.curves[name] = curve;
            	LOG("Loaded Curve: " + name);
            	break;
            }
            case -101: //FINISH
            {
                scene_complete = true;
                break;
            }
        }
    }

    var scene = gb.scene.new(name, true);
    gb.scene.scenes[scene.name] = scene;
    gb.scene.load_asset_group(ag, scene);
}