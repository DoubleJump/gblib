gb.load_file = function(url, type, callback)
{
	var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = callback;
    request.responseType = type;
    request.send();
}
gb.save_file = function(url, type, data, callback)
{
	var request = new XMLHttpRequest();
    request.open('POST', url, true);
    request.onload = callback;
    request.responseType = type;
    request.data = data;
    request.send();
}