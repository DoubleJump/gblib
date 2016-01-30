gb.Debug_View = function()
{
	this.root;
	this.container;
	this.observers = [];
	this.controllers = [];
}
gb.Debug_Observer = function()
{
	this.element;
	this.in_use;
	this.is_watching;
	this.label;
	this.target;
	this.property;
	this.index;
}
gb.Debug_Controller = function()
{
	this.name;
	this.label;
	this.slider;
	this.value;
}

gb.debug_view =
{
	new: function(root, x, y, opacity)
	{
		var view = new gb.Debug_View();
		view.root = root;

		var container = document.createElement('div');
		container.classList.add('gb-debug-view');
		container.style.left = x || 10;
		container.style.top = y || 10;
		container.style.opacity = opacity || 0.95;
		view.container = container;

		var MAX_OBSERVERS = 10;
		for(var i = 0; i < MAX_OBSERVERS; ++i)
		{
			var element = document.createElement('div');
			element.classList.add('gb-debug-observer');
			element.classList.add('gb-debug-hidden');
			container.appendChild(element);

			var observer = new gb.Debug_Observer();
			observer.element = element;
			observer.in_use = false;
			observer.is_watching = false;
			view.observers.push(observer);
		}
		
		root.appendChild(container);
		return view;
	},
	update: function(view)
	{
		var n = view.observers.length;
		for(var i = 0; i < n; ++i)
		{
			var observer = view.observers[i];
			if(observer.is_watching === true)
			{
				var val;
				var target = observer.target;
				var prop = observer.property;
				var index = observer.index;
				if(index === -1) 
				{
					val = target[prop];
				}
				else val = target[prop][index];
				observer.element.innerText = observer.label + ": " + val;
				continue;
			}
			if(observer.in_use === true)
			{
				observer.in_use = false;
				observer.element.classList.add('gb-debug-hidden');
			}
		}
		n = view.controllers.length;
		for(var i = 0; i < n; ++i)
		{
			var controller = view.controllers[i];
			controller.value = controller.slider.value;
			controller.label.innerText = controller.name + ': ' + controller.value;
		}
	},
	label: function(view, label, val)
	{
		var n = view.observers.length;
		for(var i = 0; i < n; ++i)
		{
			var observer = view.observers[i];
			if(observer.in_use === false)
			{
				observer.element.innerText = label + ": " + val;
				observer.element.classList.remove('gb-debug-hidden');
				observer.in_use = true;
				return;
			}
		}
		LOG('No free observers available');
	},
	watch: function(view, label, target, property, index)
	{
		var n = view.observers.length;
		for(var i = 0; i < n; ++i)
		{
			var observer = view.observers[i];
			if(observer.in_use === false)
			{
				observer.label = label;
				observer.target = target;
				observer.property = property;
				observer.index = index || -1;
				if(index === -1) observer.value = target[property];
				else observer.value = target[property][index];
				observer.in_use = true;
				observer.is_watching = true;
				observer.element.classList.remove('gb-debug-hidden');
				return;
			}
		}
		LOG('No free observers available');
	},
	control: function(view, name, min, max, step, initial_value)
	{
		initial_value = initial_value || 0;

		var label = document.createElement('div');
		label.classList.add('gb-debug-label');
		label.innerText = name + ': ' + initial_value;
		view.container.appendChild(label);

		var slider = document.createElement('input');
		slider.setAttribute('type', 'range');

		slider.classList.add('gb-debug-slider');
		slider.min = min;
		slider.max = max;
		slider.step = step;
		slider.defaultValue = initial_value;
		slider.value = initial_value;
		view.container.appendChild(slider);

		var controller = new gb.Debug_Controller();
		controller.name = name;
		controller.label = label;
		controller.slider = slider;
		controller.value = initial_value;
		view.controllers.push(controller);

		return controller;
	},
}