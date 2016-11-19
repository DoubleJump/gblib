var _stacks = [];
var Stack = function(T, count)
{
	this.data = [];
	this.index = 0;
	this.count = count;

	for(var i = 0; i < count; ++i) this.data.push(new T());

	_stacks.push(this);
	return this;
}
Stack.prototype.get = function()
{
	var r = this.data[this.index];
	this.index++;
	//DEBUG
	if(this.index === this.count)
	{
		console.error("Stack overflow");
		console.error(this);
	}
	//END
	return r;
}

function clear_stacks()
{
	var n = _stacks.length;
	for(var i = 0; i < n; ++i)
	{
		_stacks[i].index = 0;
	}
}