gb.Asset_Group = function()
{
    this.shaders = {};
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
    if(e.target.status === 200)
    {
        var s = gb.serialize;
        var br = new gb.Binary_Reader(e.target.response);
        var ag = e.target.upload.asset_group;

        //console.log(ag);

        var header = s.r_i32_array(br, 3);
        var n_shaders = header[0];
        var n_meshes = header[1];
        var n_textures = header[2];
        //var n_sounds = header[3];

        //DEBUG
        console.log("Shaders: " + n_shaders);
        console.log("Meshes: " + n_meshes);
        console.log("Textures: " + n_textures);
        //console.log("Sounds: " + n_sounds);
        //END

        for(var i = 0; i < n_shaders; ++i)
        {
        	var name = s.r_string(br);
            ag.shaders[name] = s.r_shader(br);
        }

        for(var i = 0; i < n_meshes; ++i)
        {
        	var name = s.r_string(br);
            ag.meshes[name] = s.r_mesh(br);
        }
        
        //test pvrtc / dds
        if(gb.webgl.extensions.dxt === true)
        {
            for(var i = 0; i < n_textures; ++i)
            {
            	var name = s.r_string(br);
                ag.textures[name] = s.r_dds(br);
            }
        }


        /*
        //test wav / ogg
        for(var i = 0; i < n_sounds; ++i)
            s.r_wav(br);
        */
              
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
    //audio
    callback();
}