function DOMText(container, val, ox, oy, bold)
{
	var r = {};
	r.position = Vec3();
	r.offset = Vec3(ox, oy);
	r.element = document.createElement('div');
	r.element.textContent = val;
	r.element.classList.add('gl-text');
	if(bold === true) r.element.classList.add('bold');
	container.appendChild(r.element);
	return r;
}
function set_dom_text(t, val)
{
	t.element.textContent = val;
}
function draw_dom_text(t, camera, view)
{
	var wp = _Vec3();
	world_to_screen(wp, camera.view_projection, t.position, view);

	t.element.style.transform = 'translate(' + (wp[0] + t.offset[0])  + 'px, ' + (wp[1] + t.offset[1]) + 'px)';
	vec3_stack.index--;
}