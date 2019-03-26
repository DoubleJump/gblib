function browser_detect()
{
	if(/ip[honead]+(?:.*os\s([\w]+)\slike\smac|;\sopera)/i.test(window.navigator.userAgent))
	{
		return 'ios';
	}
}

function find(s, e)
{
	var e = e || document;
	return e.querySelector(s);
}

function find_all(s, e)
{
	var e = e || document;
	return document.querySelectorAll(e);
}

function add_class(e, c)
{
	e.classList.add(c);
}
function remove_class(e, c)
{
	e.classList.remove(c);
}

function div(type, classes, parent)
{
	var el = document.createElement(type);
	if(classes) el.setAttribute('class', classes);
	if(parent) parent.appendChild(el);
	return el;
}

function inline_style(el, style)
{
	for(var k in style)
	{
		el.style[k] = style[k];
	}
}

function dom_hide(e)
{
	add_class(e, 'hidden');
}
function dom_show(e)
{
	remove_class(e, 'hidden');
}

function dom_to_canvas(v)
{
    return v * app.res;
}

function canvas_to_dom(v)
{
    return v / app.res;
}