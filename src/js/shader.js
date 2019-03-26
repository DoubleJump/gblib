function Shader(vs, fs)
{
    var s = {};
    s.id = null;
    s.attributes = {};
    s.uniforms = {};
    s.props = {};
    s.vertex_src = vs;
    s.fragment_src = fs;
    return s;
}

function read_shader(ag)
{
    var name = read_string();
    var vs = read_string();
    var fs = read_string();
    var shader = Shader(vs, fs);
    shader.name = name;
    if(ag) ag.shaders[name] = shader;
    return shader;
}