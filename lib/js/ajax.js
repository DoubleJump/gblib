gb.ajax = 
{
	GET: function(url, on_load, on_progress)
	{
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.onload = on_load;
		request.onprogress = on_progress || gb.event_load_progress;
		request.responseType = 'arraybuffer';
		request.upload.callback = on_load;
		return request;
	}
}