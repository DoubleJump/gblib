gb.Material = function()
{
    this.shader;
    this.mvp;
    this.proj_matrix;
    this.view_matrix;
    this.normal_matrix;
}
gb.material = 
{
    new: function(shader)
    {
        var m = new gb.Material();
        m.shader = shader;
        for(var key in shader.uniforms)
        {
            m[key] = null;
        }
        if(shader.mvp === true)
        {
            m.mvp = gb.mat4.new();
        }
        /*
        if(shader.rig === true)
        {
            m.uniforms['rig[0]'] = new Float32Array(gb.rig.MAX_JOINTS * 16);
        }
        */
        return m;
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