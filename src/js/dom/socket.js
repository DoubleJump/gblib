gb.socket = 
{
	new: function(url, protocol, open, error, message)
	{
		var ws =  new WebSocket("ws://" + url, protocol);
		ws.onopen = open;
		ws.onerror = error;
		ws.onmessage = message;
		return ws;
	}
}