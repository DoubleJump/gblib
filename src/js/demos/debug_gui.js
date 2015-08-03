gb.gui = 
{
	root: null,

	init: function(parent)
	{
        gb.dom.add_stylesheet('gblib.css');
		var r = gb.dom.div(parent, 'gblib gui root');
		var s = gb.dom.insert('style', parent);
		gb.gui.root = r;
	},

	group: function(name)
	{
		var g = gb.dom.div(gb.gui.root, 'gblib gui group');
		var l = gb.dom.div(g, 'gblib gui heading');
		l.textContent = name;
		return g;
	},

	label: function(group, val)
	{
		var l = gb.dom.div(group, 'gblib gui label');
		l.textContent = val;
		return l;
	},

	toggle: function(group)
	{

	},

	slider: function(group, name, min, max, step, value)
	{
		gb.gui.label(group, name);
		var s = gb.dom.insert('input', group);
		s.type = "range";
		s.min = min.toString();
		s.max = max.toString();
		s.step = step.toString();
		s.value = value.toString();
		gb.dom.set_class(s, 'gblib gui slider');
		return s;
	},

	color: function(group)
	{

	},

	curve: function(group)
	{

	},
}