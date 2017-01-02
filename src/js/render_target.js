function RenderTarget(GL, view, sampler)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.color = rgba_texture(view.width, view.height, null, sampler);
	r.depth = depth_texture(view.width, view.height, sampler);
	r.view = view;
	return r;
}