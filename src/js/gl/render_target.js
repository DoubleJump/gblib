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
    new: function(view, mask, color)
    {
        var rt = new gb.Render_Target();
        rt.bounds = gb.rect.new();
        gb.rect.eq(rt.bounds, view);
        if((1 & mask) === 1) //color
        {
            rt.color = gb.texture.rgba(view.width, view.height, null, gb.webgl.default_sampler, 0);
            gb.webgl.link_texture(rt.color);
        }
        if((2 & mask) === 2) //depth
        {
            rt.depth = gb.texture.depth(view.width, view.height);
            gb.webgl.link_texture(rt.depth);
        }
        /*
        if((4 & mask) === 4)
        {
        }
        */
        gb.webgl.link_render_target(rt);
        return rt;
    },
}
