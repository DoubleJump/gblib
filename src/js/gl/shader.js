gb.Shader_Attribute = function()
{
	this.location;
	this.index;
}
gb.Shader = function()
{
    this.id = 0;
    this.vertex_src;
    this.fragment_src;
    this.num_attributes;
    this.num_uniforms;
    this.attributes = [null, null, null, null, null];
    this.uniforms = {};
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
   	var vs = s.r_string(br);
   	var fs = s.r_string(br);
    return gb.shader.new(vs, fs);
}