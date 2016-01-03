gb.Asset_Group = function()
{
    this.shaders = {};
    this.materials = {};
    this.animations = {};
    this.entities = {};
    this.meshes = {};
    this.textures = {};
    this.rigs = {};
    this.curves = {};
    this.sounds = {};
}

gb.assets = 
{
    load: function(url, on_load, on_progress)
    {
        var request = gb.ajax.GET(url, gb.assets.event_asset_load)
        request.upload.callback = on_load;
        request.send();
    },
    event_asset_load: function(e)
    {
        if(e.target.status === 200)
        {
            var s = gb.binary_reader;
            var br = new gb.Binary_Reader(e.target.response);
            LOG("Asset File Size: " + br.buffer.byteLength + " bytes");

            var ag = new gb.Asset_Group();

            var asset_load_complete = false;
            while(asset_load_complete === false)
            {
                var asset_load_type = s.i32(br);
                switch(asset_load_type)
                {
                    case 0:
                    {
                        var shader = s.shader(br);
                        ag.shaders[shader.name] = shader;
                        break;
                    }
                    case 1:
                    {
                        var scene = s.scene(br, ag);
                        break;
                    } 
                    case 2:
                    {
                        var texture = s.dds(br);
                        ag.textures[texture.name] = texture;
                        break;
                    }
                    case 3:
                    {
                        var texture = s.pvr(br);
                        ag.textures[texture.name] = texture;
                        break;
                    } 
                    case -1:
                    {
                        asset_load_complete = true;
                        break;
                    }
                    default:
                    {
                        console.error("Invalid asset load type: " + asset_load_type);
                        asset_load_complete = true;
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