gb.Asset_Group = function()
{
    this.shaders = {};
    this.materials = {};
    this.actions = {};
    this.cameras = {};
    this.lamps = {};
    this.entities = {};
    this.meshes = {};
    this.textures = {};
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
        var ag = e.target.upload.asset_group;

        var header = s.r_i32_array(br, 3);
        var n_shaders = header[0];
        var n_textures = header[1];
        var n_scenes = header[2];

        //DEBUG
        console.log("Shaders: " + n_shaders);
        console.log("Textures: " + n_textures);
        console.log("Scenes: " + n_scenes);
        //END

        for(var i = 0; i < n_shaders; ++i)
        {
            var shader = s.r_shader(br);
            ag.shaders[shader.name] = shader;
            //DEBUG
            console.log("Loaded Shader: " + shader.name);
            //END
        }

        for(var i = 0; i < n_textures; ++i)
        {
            var name = s.r_string(br);
            var id = s.r_i32(br);
            if(id === 0 && gb.webgl.extensions.dxt !== null)
            {
                var t = s.r_dds(br);
                ag.textures[name] = t;
                //DEBUG
                console.log("Width: " + t.width);
                console.log("Height: " + t.height);
                console.log("Loaded DDS: " + name);
                //END
            }
            else if(id === 1 && gb.webgl.extensions.pvr !== null)
            {
                ag.textures[name] = s.r_pvr(br);
                //DEBUG
                console.log("Loaded PVR: " + name);
                //END
            }
        }

        for(var i = 0; i < n_scenes; ++i)
        {
            var name = s.r_string(br);
            var n_meshes = s.r_i32(br);
            var n_actions = s.r_i32(br);
            var n_materials = s.r_i32(br);
            var n_cameras = s.r_i32(br);
            var n_lamps = s.r_i32(br);
            var n_empties = s.r_i32(br);
            var n_entities = s.r_i32(br);

            //DEBUG
            console.log("Loading: " + name);
            console.log("Meshes: " + n_meshes);
            console.log("Actions: " + n_actions);
            console.log("Materials: " + n_materials);
            console.log("Cameras:" + n_cameras);
            console.log("Lamps:" + n_lamps);
            console.log("Empties: " + n_empties);
            console.log("Entities: " + n_entities);
            //END

            for(var j = 0; j < n_meshes; ++j)
            {
                var mesh = s.r_mesh(br);
                ag.meshes[mesh.name] = mesh;
                console.log("Loaded Mesh: " + mesh.name);
            }
            for(var j = 0; j < n_actions; ++j)
            {
                var action = s.r_action(br);
                ag.actions[action.name] = action;
                console.log("Loaded Action: " + action.name);
            }
            for(var j = 0; j < n_materials; ++j)
            {
                var material = s.r_material(br, ag);
                ag.materials[material.name] = material;
                console.log("Loaded Material: " + material.name);
            }
            for(var j = 0; j < n_cameras; ++j)
            {
                var entity = new gb.Entity();
                s.r_camera(entity, br, ag);
                ag.cameras[entity.name] = entity;
                console.log("Loaded Camera: " + entity.name);
            }
            for(var j = 0; j < n_lamps; ++j)
            {
                var entity = new gb.Entity();
                s.r_lamp(entity, br, ag);
                ag.lamps[entity.name] = entity;
                console.log("Loaded Lamp: " + entity.name);
            }
            for(var j = 0; j < n_empties; ++j)
            {
                var empty = new gb.Entity();
                s.r_entity(empty, br, ag);
                ag.entities[empty.name] = empty;
                console.log("Loaded Entity: " + empty.name);
            }
            for(var j = 0; j < n_entities; ++j)
            {
                var entity = new gb.Entity();
                s.r_entity(entity, br, ag);
                entity.material = ag.materials[s.r_string(br)];
                entity.mesh = ag.meshes[s.r_string(br)];
                ag.entities[entity.name] = entity;
                console.log("Loaded Entity: " + entity.name);
            }
            
            //DEBUG
            console.log("Loaded Scene: " + name);
            //END
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
    {
        gb.webgl.link_shader(asset_group.shaders[s]);
    }
    for(var m in asset_group.meshes)
    {
        gb.webgl.link_mesh(asset_group.meshes[m]);
    }
    for(var t in asset_group.textures)
    {
        gb.webgl.link_texture(asset_group.textures[t]);
    }
    callback();
}