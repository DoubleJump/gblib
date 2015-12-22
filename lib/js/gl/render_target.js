gb.Render_Target = function()
{
	this.bounds;
	this.frame_buffer;
	this.render_buffer;
	this.color = null;
	this.depth = null;
	this.stencil = null;
    this.linked = false;
}

gb.render_target = 
{
    COLOR: 1,
    DEPTH: 2,
    STENCIL: 4,
    DEPTH_STENCIL: 8,

    new: function(view, mask)
    {
        var rt = new gb.Render_Target();

        if(!view) view = gb.webgl.view;

        rt.bounds = gb.rect.new();
        gb.rect.eq(rt.bounds, view);

        if(!mask) mask = gb.render_target.COLOR | gb.render_target.DEPTH;
        
        if(gb.has_flag_set(mask, gb.render_target.COLOR) === true)
        {
            rt.color = gb.texture.rgba(view.width, view.height, null, gb.webgl.samplers.linear, 0);
        }
        if(gb.has_flag_set(mask, gb.render_target.DEPTH) === true)
        {
            rt.depth = gb.texture.depth(view.width, view.height);
        }

        gb.webgl.link_render_target(rt);
        return rt;
    },
}
