gb.dom =
{
	get: function(selector)
	{
		return document.querySelector(selector);
	},
	all: function(selector)
	{
		return document.querySelectorAll(selector);
	},
}