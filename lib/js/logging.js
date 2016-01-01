gb.debug.sanitize = function(txt)
{
	var output, x;
	if(typeof txt == 'object')
	{
		output = {};
		for(x in txt)
		{
			output[x] = txt[x] + '';
		}
		output = JSON.stringify(output, null, 2);
	}
	else
	{
		output = txt;
	}
	return output;
}
gb.debug.log_to_server = function(log)
{
	console.log(log);
	var url = 'http://localhost:8080/logger/log.php';
	var params = "log=" + Date.now() + ' ' + escape(gb.debug.sanitize(log));
	var request = new XMLHttpRequest();
	request.open('POST', url, true);
	request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
	request.setRequestHeader("Content-length", params.length);
	request.setRequestHeader("Connection", "close");
	request.send(params);
}