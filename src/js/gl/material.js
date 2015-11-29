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
            var val;
            switch(uniform.type)
            {
                case 'FLOAT': 
                {
                    val = 0.0;
                    break;
                }
                case 'FLOAT_VEC2':
                {
                    val = gb.vec2.new(0,0);
                    break;
                }
                case 'FLOAT_VEC3':
                {
                    val = gb.vec3.new(0,0,0);
                    break;
                }
                case 'FLOAT_VEC4':
                {
                    val = gb.quat.new(0,0,0,1);
                    break;
                }
                case 'BOOL':
                {
                    val = true;
                    break;
                }
                case 'FLOAT_MAT3':
                {
                    val = gb.mat3.new();
                    break;
                }
                case 'FLOAT_MAT4':
                {
                    val = gb.mat4.new();
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
        /*
        if(shader.rig === true)
        {
            m.uniforms['rig[0]'] = new Float32Array(gb.rig.MAX_JOINTS * 16);
        }
        */
        return m;
    },
    set_camera_uniforms: function(material, camera)
    {
        if(material.proj_matrix !== undefined)
        {
            material.proj_matrix = camera.projection;
        }
        if(material.view_matrix !== undefined)
        {
            material.view_matrix = camera.view;
        }
        if(material.view_proj_matrix !== undefined)
        {
            materia.view_proj_matrix = camera.view_projection;
        }
        if(material.normals !== undefined)
        {
            material.normal_matrix = camera.normal;
        }
    },
    set_entity_uniforms: function(material, entity, camera)
    {
        if(material.mvp !== undefined)
        {
            gb.mat4.mul(material.mvp, entity.world_matrix, camera.view_projection);
        }
        if(material.model_matrix !== undefined)
        {
            material.model_matrix = entity.world_matrix;
        }
        if(material.rig !== undefined)
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
gb.serialize.r_material = function(br, ag)
{
    var s = gb.serialize;
    var name = s.r_string(br);
    var shader_name = s.r_string(br);
    var shader = ag.shaders[shader_name];
    ASSERT(shader, 'Cannot find shader ' + shader_name);

    var material = gb.material.new(shader);
    material.name = name;
    var num_textures = s.r_i32(br);

    for(var i = 0; i < num_textures; ++i)
    {
        var tex_name = s.r_string(br);
        var sampler_name = s.r_string(br);
        ASSERT(material[sampler_name], 'Cannot find sampler ' + sampler_name + ' in shader ' + shader_name);
        ASSERT(ag.textures[tex_name], 'Cannot find texture ' + tex_name + ' in asset group');
        material[sampler_name] = ag.textures[tex_name];
    }
    return material;
}