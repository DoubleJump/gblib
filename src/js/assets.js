function AssetGroup()
{
    var r = {};
    r.shaders = {};
    r.meshes = {};
    r.textures = {};
    r.fonts = {};
    r.animations = {};
    r.rigs = {};
    r.curves = {};
    return r;
}
var AssetType = 
{
    SHADER: 0,
    SCENE: 1,
    FONT: 2,
    PNG: 3,
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
    END: -1
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
    for(var k in assets.fonts) 
    {
        var f = assets.fonts[k];
        bind_texture(f.atlas);
        update_texture(f.atlas);
    }
}

function read_asset_file(data)
{
    var br = BinaryReader(data, true);
    var assets = AssetGroup();

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
                case AssetType.PNG: { read_texture(assets); break; }
                case AssetType.END: { complete = true; break; }
                default: { complete = true; }
            }
        }

    end_reader_ctx();
    
    return assets;
}

function read_scene(ag)
{
    var name = read_string();

    var complete = false;
    while(complete === false)
    {
        var import_type = read_i32();
        switch(import_type)
        {
            case AssetType.CAMERA: { read_camera(ag); break; }
            case AssetType.LAMP: { read_lamp(ag); break; }
            case AssetType.MESH: { read_mesh(ag); break; }
            case AssetType.MATERIAL: { read_material(ag); break; }
            case AssetType.ACTION: { read_animation(ag); break; }
            case AssetType.EMPTY: { read_transform(ag); break; }
            case AssetType.ENTITY: { read_entity(ag); break; }
            case AssetType.RIG: { read_rig(ag); break; }
            case AssetType.RIG_ACTION: { read_rig_action(ag); break; }
            case AssetType.CURVE: { read_curve(ag); break; }
            case AssetType.END: { complete = true; break; }
            default: { complete = true; }
        }
    }
}