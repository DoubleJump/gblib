function RenderTarget(view)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.color = null;
	r.depth = null;
	r.view = view;
	return r;
}

function standard_render_target(view)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.color = rgba_texture(view[2], view[3], null, app.sampler);
	r.depth = depth_texture(view[2], view[3], app.sampler);
	r.view = view;
	bind_render_target(r);
	set_render_target(r);
	set_render_target_color(r.color);
	set_render_target_depth(r.depth);
	verify_frame_buffer();
	set_render_target(null);
	return r;
}

function depth_render_target(view)
{
	var r = {};
	r.frame_buffer = null;
	r.render_buffer = null;
	r.depth = depth_texture(view[2], view[3], app.sampler);
	r.view = view;
	bind_render_target(r);
	set_render_target(r);
	set_render_target_depth(r.depth);
	verify_frame_buffer();
	set_render_target(null);
	return r;
}

function resize_render_target(target, view)
{
	if(target.color) resize_texture(target.color, view[2], view[3]);
	if(target.depth) resize_texture(target.depth, view[2], view[3]);
}