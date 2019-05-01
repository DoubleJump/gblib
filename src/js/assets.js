function AssetGroup(name)
{
    var r = {};
    r.name = name;
    r.load_count = 0;
    r.loaded = false;
    r.is_loading = false;
    r.load_progress = 0;
    r.onload = null;
    r.shaders = {};
    r.meshes = {};
    r.materials = {};
    r.textures = {};
    r.fonts = {};
    r.animations = {};
    r.rigs = {};
    r.curves = {};
    r.sounds = {};
    r.scenes = {};
    return r;
}
var AssetType =
{
    SHADER: 0,
    SCENE: 1,
    FONT: 2,
    PNG: 3,
    JPG: 15,
    DDS: 16,
    PVR: 17,
    CAMERA: 4,
    LAMP: 5,
    MESH: 6,
    MATERIAL: 7,
    ACTION: 8,
    ENTITY: 9,
    EMPTY: 10,
    RIG: 11,
    RIG_ACTION: 12,
    CURVE: 13,
    CUBEMAP: 14,
    SOUNDS: 15,
    WORLD: 16,
    END: -1
}

function load_assets(ag, urls, onload)
{
    // LOG('Loading Asset Group: ' + ag.name);

    ag.onload = onload;

    for(var k in urls)
    {
        var url = urls[k];
        var path = url.match(/[^\\/]+$/)[0];
        var name = path.split(".")[0];
        var type = path.split(".")[1];

        //LOG('Loading: ' + path);

        ag.load_count++;

        switch(type)
        {
            case 'txt':
            {
                var rq = Request(
                {
                    url: url,
                    success: function(data)
                    {
                        read_asset_file(data, ag);
                        ag.load_count--;
                        update_load_progress(ag);
                    },
                });

                break;
            }
            case 'png':
            case 'jpg':
            {
                ag.textures[name] = load_texture_async(url, ag);
                break;
            }
            case 'json':
            {
                var rq = Request(
                {
                    url: url,
                    response_type: 'text',
                    success: function(data)
                    {
                        app.translations = JSON.parse(data);

                        ag.load_count--;
                        update_load_progress(ag);
                    },
                });
            }
            default: break;
        }

    }
}

function update_load_progress(ag)
{
    if(ag.load_count === 0)
    {
        if(ag.onload) ag.onload();
    }
}

function bind_assets(assets)
{
    for(var k in assets.shaders)
    {
        bind_shader(assets.shaders[k]);
    }
    for(var k in assets.meshes)
    {
        var m = assets.meshes[k];
        bind_mesh(m);
        update_mesh(m);
    }
    for(var k in assets.textures)
    {
        var t = assets.textures[k];
        bind_texture(t);
        update_texture(t);
    }

    assets.loaded = true;
}

function read_asset_file(data, assets)
{
    var br = BinaryReader(data, 4);

    set_reader_ctx(br);

        var complete = false;
        while(complete === false)
        {
            var asset_type = read_i32();
            switch(asset_type)
            {
                case AssetType.SHADER: { read_shader(assets); break; }
                case AssetType.SCENE: { read_scene(assets); break; }
                case AssetType.FONT: { read_font(assets); break; }
                case AssetType.PVR: { read_pvr(assets); break; }
                case AssetType.DDS: { read_dds(assets); break; }
                case AssetType.MATERIAL: { read_material(assets); break; }
                case AssetType.END: { complete = true; break; } default: { complete = true; }
            }
        }

    end_reader_ctx();

    return assets;
}

function read_scene(ag)
{
    var size = read_i32();
    var name = read_string();
    var offset = _BR.offset;
    var pad = get_padding(_BR.alignment, size);

    var scene = Scene(name, 1024);

    var complete = false;
    while(complete === false)
    {
        var import_type = read_i32();
        switch(import_type)
        {
            case AssetType.CAMERA: { read_camera(scene); break; }
            case AssetType.LAMP: { read_lamp(scene); break; }
            case AssetType.MESH: { read_mesh(ag); break; }
            case AssetType.MATERIAL: { read_material(ag); break; }
            //case AssetType.ACTION: { read_animation(ag); break; }
            case AssetType.ENTITY: { read_entity(scene); break; }
            //case AssetType.RIG: { read_rig(ag); break; }
            //case AssetType.RIG_ACTION: { read_rig_action(ag); break; }
            case AssetType.CURVE: { read_curve(ag); break; }
            case AssetType.END: { complete = true; break; }
            default: { complete = true; }
        }
    }

    ag.scenes[name] = scene;

    _BR.offset = offset + size + pad;
}