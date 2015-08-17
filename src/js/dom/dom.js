gb.dom = 
{
	insert: function(type, parent)
	{
		var el = document.createElement(type);
        parent.appendChild(el);
        return el;
	},
	div: function(parent, classes)
	{
		var e = gb.dom.insert('div', parent);
		if(classes !== null) gb.dom.set_class(e, classes);
		return e;
	},
	add_stylesheet: function(url)
	{
		var l = document.createElement('link');
        l.rel = 'stylesheet';
        l.type =  'text/css';
        l.href =  url;
        document.head.appendChild(l);
	},
	set_class: function(el, c)
	{
		el.className = c;
	},
	add_class: function(el, c)
	{
		el.classList.add(c);
	},
	remove_class: function(el, c)
	{
		el.classList.remove(c);
	},
	find: function(query)
	{
		return document.querySelector(query);
	},
	set_transform: function(el, sx, sy, tx, ty, r)
	{
		var ang = r * gb.math.DEG2RAD;
		var a = Math.cos(ang) * sx;
		var b = -Math.sin(ang);
		var c = tx;
		var d = Math.sin(ang);
		var e = Math.cos(ang) * sy;
		var f = ty;

		var matrix = "matrix("+a+","+b+","+d+","+e+","+c+","+f+")";

		el.style["webkitTransform"] = matrix;
		el.style.MozTransform = matrix;
		el.style["oTransform"] = matrix;
		el.style["msTransform"] = matrix;
	},
	add_event: function(el, event, handler)
	{
		el.addEventListener(event, handler, false);
	},
}