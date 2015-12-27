gb.ShaderAttribute = function()
{
	this.location;
	this.size;
    this.type;
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
    this.attributes = {};
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
gb.binary_reader.shader = function(br)
{
	var s = gb.binary_reader;
    var name = s.string(br);
   	var vs = s.string(br);
   	var fs = s.string(br);
    var shader = gb.shader.new(vs, fs);
    shader.name = name;
    LOG("Loaded Shader: " + shader.name);
    return shader;
}