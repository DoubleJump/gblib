gb.Render_Target = function()
{
	this.bounds;
	this.frame_buffer;
	this.render_buffer;
	this.color;
	this.depth;
	this.stencil;
    this.linked = false;
}

gb.render_target = 
{
    COLOR: 1,
    DEPTH: 2,
    STENCIL: 4,
    DEPTH_STENCIL: 8,

    new: function(view, mask, color)
    {
        var rt = new gb.Render_Target();
        rt.bounds = gb.rect.new();
        gb.rect.eq(rt.bounds, view);
        if(gb.has_flag_set(mask, gb.render_target.COLOR) === true)
        {
            rt.color = gb.texture.rgba(view.width, view.height, null, gb.webgl.default_sampler, 0);
            gb.webgl.link_texture(rt.color);
        }
        if(gb.has_flag_set(mask, gb.render_target.DEPTH) === true)
        {
            rt.depth = gb.texture.depth(view.width, view.height);
            gb.webgl.link_texture(rt.depth);
        }

        gb.webgl.link_render_target(rt);
        return rt;
    },
}
