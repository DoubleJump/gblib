function Debug_Console()
{
	var r = {};
	r.log = console.log;
	r.warn = console.warn;
	r.error = console.error;
	r.slots = new Array(10);
	r.slot_index = 0;
	r.container = div('div', 'debug-console ns np hidden');

	for(var i = 0; i < r.slots.length; ++i)
	{
		var item = document.createElement('p');
		r.container.appendChild(item);
		r.slots[i] = item;
	}

	console.log = function(e)
	{
		var item = r.slots[r.slot_index];
		item.style.background = '#1a1a1a';
		item.style.color = 'white';
		item.innerHTML = e.toString();
		r.slot_index++;
		if(r.slot_index > 8)
		{
			r.slot_index = 0
		}
		r.log(e);
	}
	console.warn = function(e)
	{
		var item = r.slots[r.slot_index];
		item.style.background = 'rgba(255,255,0,0.5)';
		item.style.color = 'white';
		item.innerHTML = e.toString();
		r.slot_index++;
		if(r.slot_index > 8)
		{
			r.slot_index = 0
		}
		r.warn(e);
	}
	console.error = function(e)
	{
		var item = r.slots[r.slot_index];
		item.style.background = 'red';
		item.style.color = 'black';
		item.innerHTML = e.toString();
		r.slot_index++;
		if(r.slot_index > 8)
		{
			r.slot_index = 0
		}
		r.error(e);
	}

	return r;
}
