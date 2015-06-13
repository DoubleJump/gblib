gb.Sound = function()
{
	this.data;
	this.volume;
	//this.src;??
}

gb.audio = 
{
	ctx: null,
	decode_count: 0,
	//oscillator: null,
	//gain: null,

	init: function()
	{
		try 
		{
		    window.AudioContext = window.AudioContext || window.webkitAudioContext;
		    this.ctx = new AudioContext();
		}
		catch(e) 
		{
		    console.error('Web Audio API could not be initialised: ' + e);
		}
	},

	/*
	decode: function(sounds)
	{
		this.decode_count = sounds.length;
		for(var i = 0; i < this.decode_count; ++i)
		{
			this.ctx.decodeAudio(sounds[i].buffer, on_decode);
		}
	},

	on_decode: function(n, buffer)
	{
		this.decode_count--;
		if(this.decode_count === 0)
		{
			gb.load_complete(1);
		}
	}

	play: function(s)
	{
		var src = this.ctx.createBufferSource();
		src.buffer = s.buffer;
		src.connect(this.ctx.destination);
		src.start(0);
	},

	cross_face: function(s)
	{

	},
	*/
}