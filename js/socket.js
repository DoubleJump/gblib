function create_websocket(url)
{
	var socket = new WebSocket(url);
	
	socket.onopen = function(e)
	{
		console.log('Connected to: ' + e.currentTarget.url);
	};

	socket.onerror = function(error) 
	{
  		console.log('WebSocket Error: ' + error);
	};

	return socket;
}