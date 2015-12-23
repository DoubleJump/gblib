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

gb.assets = 
{
    load: function(url, asset_group, on_load, on_progress)
    {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.onload = gb.assets.event_asset_load;
        request.onprogress = on_progress || gb.event_load_progress;
        request.responseType = 'arraybuffer';
        request.upload.asset_group = asset_group;
        request.upload.callback = on_load;
        request.send();
    },
    event_asset_load: function(e)
    {
        // NOTE: asset data encoded in little endian (x86)
        if(e.target.status === 200)
        {
            var s = gb.serialize;
            var br = new gb.Binary_Reader(e.target.response);
            LOG("Asset File Size: " + br.buffer.byteLength + " bytes");

            var ag = e.target.upload.asset_group;

            var asset_load_complete = false;
            while(asset_load_complete === false)
            {
                var asset_load_type = s.r_i32(br);
                switch(asset_load_type)
                {
                    case 0:
                    {
                        var shader = s.r_shader(br);
                        ag.shaders[shader.name] = shader;
                        break;
                    }
                    case 1:
                    {
                        var scene = s.r_scene(br, ag);
                        break;
                    } 
                    case 2:
                    {
                        var texture = s.r_dds(br);
                        ag.textures[texture.name] = texture;
                        break;
                    }
                    case 3:
                    {
                        var texture = s.r_pvr(br);
                        ag.textures[texture.name] = texture;
                        break;
                    } 
                    case -1:
                    {
                        asset_load_complete = true;
                        break;
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
}