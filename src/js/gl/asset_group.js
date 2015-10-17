gb.Asset_Group = function()
{
    this.shaders = {};
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
    request.upload.asset_group = asset_group; //hack
    request.upload.callback = on_load;
    request.send();
    //console.log(request);
}
gb.on_asset_load = function(e)
{
	// NOTE: asset data encoded in little endian (x86)
    console.log(e.target);
    if(e.target.status === 200)
    {
        var s = gb.serialize;
        var br = new gb.Binary_Reader(e.target.response);
        var ag = e.target.upload.asset_group;

        var header = s.r_i32_array(br, 3);
        var n_shaders = header[0];
        var n_scenes = header[1];
        var n_textures = header[2];

        //DEBUG
        console.log("Shaders: " + n_shaders);
        console.log("Scenes: " + n_scenes);
        console.log("Textures: " + n_textures);
        //END

        for(var i = 0; i < n_shaders; ++i)
        {
        	var name = s.r_string(br);
            ag.shaders[name] = s.r_shader(br);
            //DEBUG
            console.log("Loaded Shader: " + name);
            //END
        }

        for(var i = 0; i < n_scenes; ++i)
        {
        	var name = s.r_string(br);
            var n_entities = s.r_i32(br);
            var n_meshes = s.r_i32(br);

            console.log("Entities: " + n_entities);
            console.log("Meshes: " + n_meshes);

            for(var j = 0; j < n_entities; ++j)
            {
                //s.r_entity(br);
                console.log("Name: " + s.r_string(br));
                console.log("Parent: " + s.r_string(br));
                console.log("Material: " + s.r_string(br));
                console.log("X: " + s.r_f32(br));
                console.log("Y: " + s.r_f32(br));
                console.log("Z: " + s.r_f32(br));
                console.log("SX: " + s.r_f32(br));
                console.log("SY: " + s.r_f32(br));
                console.log("SZ: " + s.r_f32(br));
                console.log("QX: " + s.r_f32(br));
                console.log("QY: " + s.r_f32(br));
                console.log("QZ: " + s.r_f32(br));
                console.log("QW: " + s.r_f32(br));
            }
            for(var m = 0; m < n_meshes; ++m)
            {
                var mesh_name = s.r_string(br);
                var mesh = s.r_mesh(br);
                mesh.name = mesh_name;
                ag.meshes[mesh_name] = mesh;
                //console.log("Loaded Mesh: " + mesh_name);
            }
            //ag.scenes[name] = s.r_scene(br);
             //DEBUG
            console.log("Loaded Scene: " + name);
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