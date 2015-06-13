gb.Vertex_Attribute_Info = function(name, size, normalized)
{
	this.name = name;
	this.size = size;
	this.normalized = normalized;
}

gb.vertex_attributes =
[
	new gb.Vertex_Attribute_Info("position", 3, false),
	new gb.Vertex_Attribute_Info("normal", 3, false),
	new gb.Vertex_Attribute_Info("uv", 2, false),
	new gb.Vertex_Attribute_Info("uv2", 2, false),
	new gb.Vertex_Attribute_Info("color", 4, true),
];

gb.Vertex_Buffer = function()
{
	this.id = 0;
	this.data;
	this.mask;
	this.update_mode;
}
gb.Index_Buffer = function()
{
	this.id = 0;
	this.data;
	this.update_mode;
}
gb.Mesh = function()
{
	this.layout;
	this.vertex_buffer;
	this.vertex_count;
	this.index_buffer;
	this.index_count;
	this.dirty = true;
}
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
    this.uniforms = [];
}
gb.Texture = function()
{
	this.id = 0;
	this.width;
	this.height;
	this.pixels;
	this.format;
	this.byte_size;
	this.mipmaps = 0;
}
gb.Sampler = function()
{
	this.x;
	this.y;
	this.up;
	this.down;
}
gb.Render_Target = function()
{
	this.bounds;
	this.frame_buffer;
	this.render_buffer;
	this.color;
	this.depth;
	this.stencil;
}
gb.new_shader = function(v_src, f_src)
{
    var s = new gb.Shader();
    s.vertex_src = v_src;
    s.fragment_src = f_src;
    gb.webgl.link_shader(s);
    return s;
}
gb.new_sampler = function(x,y,up,down)
{
    var s = new gb.Sampler();
    s.x = x;
    s.y = y;
    s.up = up;
    s.down = down;
    return s;
}
gb.new_mesh = function(vertex_count, vertices, mask, indices)
{
    var m = new gb.Mesh();
    m.layout = gb.webgl.ctx.TRIANGLES;

    var vb = new gb.Vertex_Buffer();
    vb.data = vertices;
    vb.mask = mask;
    vb.update_mode = gb.webgl.ctx.STATIC_DRAW;
    m.vertex_buffer = vb;
    m.vertex_count = vertex_count;

    var ib = new gb.Index_Buffer();
    ib.data = indices;
    ib.update_mode = gb.webgl.ctx.STATIC_DRAW;    
    m.index_buffer = ib;

    m.index_count = indices.length;
    gb.webgl.link_mesh(m);
    return m;
}
gb.new_rgba_texture = function(width, height, pixels, sampler, mipmaps)
{
    var t = new gb.Texture();
    t.width = width;
    t.height = height;
    t.pixels = pixels;
    t.format = gb.webl.ctx.RGBA;
    t.byte_size = gb.webgl.ctx.UNSIGNED_BYTE;
    t.mipmaps = mipmaps;
    gb.webgl.link_texture(t, sampler);
    return t;
}
gb.new_depth_texture = function(width, height)
{
    var t = new gb.Texture();
    t.width = width;
    t.height = height;
    t.pixels = null;
    t.format = gb.webgl.ctx.DEPTH_COMPONENT;
    t.byte_size = gb.webgl.ctx.UNSIGNED_SHORT;
    t.mipmaps = 0;
    gb.webgl.link_texture(t, gb.default_sampler);
    return t;
}
gb.new_render_target = function(view, mask, color)
{
    var rt = new gb.Render_Target();
    rt.bounds = new gb.Rect();
    rt.bounds.eq(view);
    if((1 & mask) === 1) //color
    {
        rt.color = gb.new_rgba_texture(view.width, view.height, null, gb.default_sampler, 0);
    }
    if((2 & mask) === 2) //depth
    {
        rt.depth = gb.new_depth_texture(view.width, view.height);
    }
    if((4 & mask) === 4)
    {
        //rt.stencil = this.new_stencil_texture(view.with, view.height);
    }
    gb.webgl.link_render_target(rt);
    return rt;
},