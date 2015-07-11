gb.Tween = function()
{
	this.min;
	this.max;
	this.current; 
	this.duration;
	this.step;
	this.t;
	this.playing;
	this.modifier;
	this.next = null;
}

gb.animate = 
{
	tweens: [],

	//If javascript was a person i'd punch him in the balls.
	from_to: function(from, to, current, duration, curve, modifier, next)
	{
		var tween = new gb.Tween();
		tween.min = from;
		tween.current = current;
		tween.max = to;
		tween.duration = duration;
		tween.playing = false;
		tween.step = 1 / duration;
		tween.t = 0;
		tween.curve = curve;
		tween.modifier = modifier;
		tween.next = next;
		gb.animate.tweens.push(tween);
		return tween;
	},
	play: function(a)
	{
		a.playing = true;
		a.t = 0;
		console.log('play');
	},
	//loop: function(a, count)
	update: function(dt)
	{
		var _t = gb.animate;
		var n = _t.tweens.length;
		var cr = gb.vec3.tmp();

		for(var i = 0; i < n; ++i)
		{
			var t = _t.tweens[i];
			if(t.playing === false) continue;
			t.t += dt;

			if(t.t > 1.0)
			{
				t.t = 1.0;
				t.playing = false;
			}
			var ct = t.t;
			if(t.curve)
			{
				gb.bezier.eval(cr, t.curve, t.t);
				ct = cr[1];
			}
			t.modifier(t.current, t.min, t.max, ct);
			
			if(t.playing === false && t.next !== null) 
				t.next();
		}
	},
}


