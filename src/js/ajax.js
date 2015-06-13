gb.load_file = function(url, type, callback)
{
	var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.onload = callback;
    request.responseType = type;
    request.send();
}
