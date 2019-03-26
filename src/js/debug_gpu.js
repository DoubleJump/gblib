function Debug_GPU()
{
	var info = app.gl_info;

	var r = {};
	var container = div('div', 'debug-info ns hidden');
	r.container = container;

	//extensions

	for(var k in info.extensions)
	{
		var item = div('p');
		item.innerHTML = k;
		if(info.extensions[k] === true)
		{
			item.setAttribute('class', 'enabled');
		}
		else
		{
			item.setAttribute('class', 'disabled');
		}
		container.appendChild(item);
	}

	//params

	for(var k in info.parameters)
	{
		var item = div('p');
		item.innerHTML = k + ': ' + info.parameters[k];
		container.appendChild(item);
	}

	//gpu

	for(var k in info.info)
	{
		var item = div('p');
		item.innerHTML = k + ': ' + info.info[k];
		container.appendChild(item);
	}

	return r;
}