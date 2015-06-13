gb.Stack = function(type, count)
{
	this.data = [];
	this.index = 0;
	this.count = count;

	for(var i = 0; i < count; ++i)
		this.data.push(new type());
}
gb.Stack.prototype.begin = function()
{
	return this.index;
}
gb.Stack.prototype.end = function(index)
{
	this.index = index;
}
gb.Stack.prototype.get = function()
{
	var r = this.data[this.index];
	this.index += 1;
	if(this.index === this.count)
	{
		console.error("Stack overflow");
	}
	return r;	
}