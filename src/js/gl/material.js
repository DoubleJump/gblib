gb.Material = function()
{
    this.shader;
    this.uniforms;
    this.textures;
}
gb.material = 
{
    new: function(shader)
    {
        var m = new gb.Material();
        m.shader = shader;
        m.uniforms = {};
        for(var key in shader.uniforms)
        {
            var uniform = shader.uniform[key];
            m.uniforms[key] = null;
        }
        if(shader.mvp === true)
        {
            m.uniforms.mvp = gb.mat4.new();
        }
        return m;
    },
}
gb.serialize.r_material = function(br, ag)
{
    var s = gb.serialize;
    var shader_name = s.r_string(br);
    var shader = ag.shaders[shader_name];
    ASSERT(shader, 'Cannot find shader ' + shader_name);

    var material = gb.material.new(shader);
    var num_textures = s.r_i32(br);
    for(var i = 0; i < num_textures; ++i)
    {
        var tex_name = s.r_string(br);
        var sampler_name = s.r_string(br);
        ASSERT(material.uniforms[sampler_name], 'Cannot find sampler ' + sampler_name + ' in shader ' + shader_name);
        material.uniforms[sampler_name] = ag.textures[tex_name];
    }
    return material;
}