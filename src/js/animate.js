gb.Tween = function()
{
	this.from = new Float32Array(4);
	this.to = new Float32Array(4);
	this.current = new Float32Array(4); 
	this.len;
	this.duration;
	this.step;
	this.t;
	this.playing;
}

gb.animate = 
{
	tweens: [],

	from_to: function(from, to, len, duration, modifier, next)
	{
		var tween = new gb.Tween();
		tween.len = len;
		for(var i = 0; i < len; ++i)
		{
			tween.from[i] = from[i];
			twee.current[i] = from[i];
			tween.to[i] = to[i];
		}
		tween.duration = duration;
		tween.playing = false;
		tween.step = 1 / duration;
		tween.t = 0;
		gb.animate.tween.push(tween);
		return tween;
	},
	update: function(dt)
	{
		var _t = gb.animate;
		var n = _t.tweens.length;
		for(var i = 0; i < n; ++i)
		{
			var t = _t.tweens[i];
			if(t.playing === false) continue;
			t.t += dt;
			if(t.t > 1.0)
			{
				t.t = 1.0;
				playing = false;
			}
			for(var j = 0; j < t.len; ++j)
			{
				t.current[j] = t.modifier(t.from[j], t.to[j], t.t);
			}
			if(t.playing === false) t.next();
		}
	},
}