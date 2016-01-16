gb.Material = function()
{
    this.name;
    this.shader;
    this.mvp;
    this.proj_matrix;
    this.view_matrix;
    this.normal_matrix;
}
gb.material = 
{
    new: function(shader, name)
    {
        var m = new gb.Material();
        m.name = name || shader.name;
        m.shader = shader;
        for(var key in shader.uniforms)
        {
            var uniform = shader.uniforms[key];
            var size = uniform.size;
            var val;

            switch(uniform.type)
            {
                case 'FLOAT': 
                {
                    if(size > 1) val = new Float32Array(size);
                    else val = 0.0;
                    break;
                }
                case 'FLOAT_VEC2':
                {
                    val = new Float32Array(size * 2);
                    break;
                }
                case 'FLOAT_VEC3':
                {
                    val = new Float32Array(size * 3);
                    break;
                }
                case 'FLOAT_VEC4':
                {
                    val = new Float32Array(size * 4);
                    break;
                }
                case 'BOOL':
                {
                    val = true;
                    break;
                }
                case 'FLOAT_MAT3':
                {
                    if(size > 1) val = new Float32Array(size * 9);
                    val = gb.mat3.new();
                    break;
                }
                case 'FLOAT_MAT4':
                {
                    if(size > 1) val = new Float32Array(size * 16);
                    else val = gb.mat4.new();
                    break;
                }
                case 'SAMPLER_2D':
                {
                    val = null;
                    break;
                }
                case 'INT':
                {
                    val = 0;
                    break;
                }
                default:
                {
                    ASSERT(false, uniform.type + ' is an unsupported uniform type');
                }
            }
            m[key] = val
        }
        return m;
    },
    set_uniform: function(material, uniform, value)
    {
        if(material[uniform] !== undefined)
        {
            material[uniform] = value;
        }
    },
    set_camera_uniforms: function(material, camera)
    {
        gb.material.set_uniform(material, 'projection', camera.projection);
        gb.material.set_uniform(material, 'view', camera.view);
        gb.material.set_uniform(material, 'view_projection', camera.view_projection);
        gb.material.set_uniform(material, 'normal_matrix', camera.normal);
    },
    set_entity_uniforms: function(material, entity, camera)
    {
        if(material.mvp !== undefined)
        {
            gb.mat4.mul(material.mvp, entity.world_matrix, camera.view_projection);
        }
        if(material.model_view !== undefined)
        {
            gb.mat4.mul(material.model_view, entity.world_matrix, camera.view);
        }
        if(material.model !== undefined)
        {
            material.model = entity.world_matrix;
        }
        if(material['rig[0]'] !== undefined)
        {
            var rig = material['rig[0]'];
            var n = entity.rig.joints.length;
            var t = 0;
            for(var i = 0; i < n; ++i)
            {
                var joint = entity.rig.joints[i];
                for(var j = 0; j < 16; ++j)
                {
                    rig[t+j] = joint.offset_matrix[j];
                }
                t += 16;
            }
        }
    },
}
gb.binary_reader.material = function(br, ag)
{
    var s = gb.binary_reader;
    var name = s.string(br);
    var shader_name = s.string(br);
    var shader = ag.shaders[shader_name];
    ASSERT(shader, 'Cannot find shader ' + shader_name);

    var material = gb.material.new(shader);
    material.name = name;

    var num_textures = s.i32(br);
    for(var i = 0; i < num_textures; ++i)
    {
        var tex_name = s.string(br);
        var sampler_name = s.string(br);
        ASSERT(material[sampler_name], 'Cannot find sampler ' + sampler_name + ' in shader ' + shader_name);
        ASSERT(ag.textures[tex_name], 'Cannot find texture ' + tex_name + ' in asset group');
        material[sampler_name] = ag.textures[tex_name];
    }
    return material;
}