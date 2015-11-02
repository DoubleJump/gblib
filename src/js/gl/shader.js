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
    this.mvp = false;
    this.camera = false;
    this.lights = false;
    this.uniforms = {};
    this.linked = false;
}
gb.shader = 
{
    new: function(v_src, f_src)
    {
        var s = new gb.Shader();
        s.vertex_src = v_src;
        s.fragment_src = f_src;
        return s;
    }
}
gb.serialize.r_shader = function(br)
{
	var s = gb.serialize;
    var name = s.r_string(br);
    var uniform_mask = s.r_i32(br);
   	var vs = s.r_string(br);
   	var fs = s.r_string(br);
    var shader = gb.shader.new(vs, fs);
    shader.name = name;
    shader.mvp = gb.has_flag_set(uniform_mask, 1);
    shader.camera = gb.has_flag_set(uniform_mask, 2);
    shader.lights = gb.has_flag_set(uniform_mask, 4);
    shader.rig = gb.has_flag_set(uniform_mask, 8);
    return shader;
}