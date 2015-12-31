gb.socket = 
{
	new: function(url)
	{
		var connection = new WebSocket('ws://' + url, ['soap', 'xmpp']);
		connection.open = gb.socket.event_open;
		connection.error = gb.socket.event_error;
		connection.message = gb.socket.event_message;
		connection.binaryType = 'arraybuffer';
		LOG(connection.extensions);
		return connection;
	},
	event_open: function(e)
	{
		LOG(e);
	},
	event_error: function(error)
	{
		LOG(error);
	},
	event_message: function(e)
	{
		LOG(data);
	},
}