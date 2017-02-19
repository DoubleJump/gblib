function RenderTarget(view, sampler)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.color = rgba_texture(view[2], view[3], null, sampler);
	r.depth = depth_texture(view[2], view[3], sampler);
	r.view = view;
	bind_render_target(r);
	return r;
}