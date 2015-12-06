gb.ShaderAttribute = function()
{
	this.location;
	this.index;
}
gb.ShaderUniform = function()
{
    this.location;
    this.name;
    this.type;
    this.size;
    this.sampler_index;
}
gb.Shader = function()
{
    this.name = null;
    this.id = 0;
    this.vertex_src;
    this.fragment_src;
    this.num_attributes;
    this.num_uniforms;
    this.attributes = [null, null, null, null, null];
    this.uniforms = {};
    this.linked = false;
}
gb.shader = 
{
    new: function(v_src, f_src)
    {
        var shader = new gb.Shader();
        shader.vertex_src = v_src;
        shader.fragment_src = f_src;
        gb.webgl.link_shader(shader);
        return shader;
    }
}
gb.serialize.r_shader = function(br)
{
	var s = gb.serialize;
    var name = s.r_string(br);
   	var vs = s.r_string(br);
   	var fs = s.r_string(br);
    var shader = gb.shader.new(vs, fs);
    shader.name = name;
    LOG("Loaded Shader: " + shader.name);
    return shader;
}