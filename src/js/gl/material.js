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
            m.uniforms[key] = null;
        }
        if(shader.mvp === true)
        {
            m.uniforms.mvp = gb.mat4.new();
        }
        return m;
    },
}
gb.serialize.r_material = function(br)
{
    var s = gb.serialize;
    var mat = s.r_string(br);
    console.log(mat);
    return mat;
}