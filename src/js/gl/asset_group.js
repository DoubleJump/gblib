gb.Asset_Group = function()
{
    this.shaders = {};
    this.materials = {};
    this.animations = {};
    this.entities = {};
    this.meshes = {};
    this.textures = {};
    this.rigs = {};
    this.sounds = {};
}
gb.load_asset_group = function(url, asset_group, on_load, on_progress)
{
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = gb.on_asset_load;
    request.onprogress = on_progress;
    request.responseType = 'arraybuffer';
    request.upload.asset_group = asset_group;
    request.upload.callback = on_load;
    request.send();
}
gb.on_asset_load = function(e)
{
    // NOTE: asset data encoded in little endian (x86)
    if(e.target.status === 200)
    {
        var s = gb.serialize;
        var br = new gb.Binary_Reader(e.target.response);
        LOG("Asset File Size: " + br.buffer.byteLength + " bytes");

        var ag = e.target.upload.asset_group;

        var header = s.r_i32_array(br, 3);
        var n_shaders = header[0];
        var n_textures = header[1];
        var n_scenes = header[2];

        LOG("Shaders: " + n_shaders);
        LOG("Textures: " + n_textures);
        LOG("Scenes: " + n_scenes);

        for(var i = 0; i < n_shaders; ++i)
        {
            var shader = s.r_shader(br);
            ag.shaders[shader.name] = shader;
            LOG("Loaded Shader: " + shader.name);
        }

        for(var i = 0; i < n_textures; ++i)
        {
            var name = s.r_string(br);
            var id = s.r_i32(br);
            if(id === 0 && gb.webgl.extensions.dxt !== null)
            {
                var t = s.r_dds(br);
                ag.textures[name] = t;
                LOG("Width: " + t.width);
                LOG("Height: " + t.height);
                LOG("Loaded DDS: " + name);
            }
            else if(id === 1 && gb.webgl.extensions.pvr !== null)
            {
                ag.textures[name] = s.r_pvr(br);
                LOG("Loaded PVR: " + name);
            }
        }

        for(var i = 0; i < n_scenes; ++i)
        {
            var name = s.r_string(br);
            LOG("Loading Scene: " + name);

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
                        LOG("Loaded Scene: " + name);
                        break;
                    }
                }
            }
        }
        
        e.target.upload.callback(ag);    
    }
    else
    {
        console.error("Resource failed to load");
    }
}
gb.link_asset_group = function(asset_group, callback)
{
    for(var s in asset_group.shaders)
        gb.webgl.link_shader(asset_group.shaders[s]);
    
    for(var m in asset_group.meshes)
        gb.webgl.link_mesh(asset_group.meshes[m]);
    
    for(var t in asset_group.textures)
        gb.webgl.link_texture(asset_group.textures[t]);
    
    callback();
}