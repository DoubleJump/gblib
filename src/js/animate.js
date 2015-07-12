gb.Keyframe = function()
{
	this.value;
	this.curve;
	this.t;
}
gb.Tween = function()
{
	this.frames;
	this.frame;
	this.current; 
	this.t;
	this.playing;
	this.modifier;
	this.loops;
	this.loops_remaining;
	this.next;
	this.callback;
}

gb.animate = 
{
	tweens: [],

	new: function(target, modifier, callback)
	{
		var t = new gb.Tween();
		t.frames = [];
		t.current = target;
		t.playing = false;
		t.frame = 0;
		t.loop_count = 0;
		t.next = null;
		t.t = 0;
		t.modifier = modifier;
		t.callback = callback;
		gb.animate.tweens.push(t);
		return t;
	},

	add_frame: function(tween, value, t, curve)
	{
		var f = new gb.Keyframe();
		f.value = value;
		f.t = t;
		f.curve = curve;
		tween.frames.push(f);
	},
	from_to: function(from, to, current, duration, curve, modifier)
	{
		var t = gb.animate.new(current, modifier, null);
		gb.animate.add_frame(t, from, 0, curve);
		gb.animate.add_frame(t, to, duration, null);
		return t;
	},
	play: function(t)
	{
		t.playing = true;
		t.t = 0;
		t.frame = 1;
	},
	set_frame: function(t, frame)
	{
		t.playing = true;
		t.frame = frame+1;
		t.t = t.frames[frame].t;
	},
	set_time: function(t, time)
	{
		var n = t.frames.length;
		for(var i = 0; i < n; ++i)
		{
			var f = t.frames[i];
			if(f.t > time)
				t.frame = i;
		}
		t.t = time;
	},
	pause: function(t)
	{
		t.playing = false;
	},
	resume: function(t)
	{
		t.playing = true;
	},
	loop: function(t, count)
	{
		t.loop_count = count || -1;
		gb.animate.play(t);	
	},

	update: function(dt)
	{
		var _t = gb.animate;
		var n = _t.tweens.length;
		var cr = gb.vec3.tmp();

		for(var i = 0; i < n; ++i)
		{
			var t = _t.tweens[i];
			if(t.playing === false) continue;

			var kfA = t.frames[t.frame-1];
			var kfB = t.frames[t.frame];

			t.t += dt;
			var alpha = (t.t - kfA.t) / (kfB.t - kfA.t);

			if(alpha > 1.0)
			{
				t.frame += 1;
				var n_frames = t.frames.length;
				if(t.frame === n_frames)
				{
					if(t.loop_count === -1)
					{
						t.t = 0;
						t.frame = 1;
					}
					else 
					{
						t.loop_count -= 1;
						if(t.loop_count === 0)
						{
							alpha = 1.0;
							t.playing = false;
						}
						else
						{
							t.t = 0;
							t.frame = 1;
						}
					}
				}
				else
				{
					kfA = t.frames[t.frame-1];
					kfB = t.frames[t.frame];
					alpha = (t - kfA.t) / (kfB.t - kfA.t);
				}
			}

			var ct = alpha;
			if(kfA.curve)
			{
				gb.bezier.eval(cr, kfA.curve, alpha);
				ct = cr[1];
			}
			t.modifier(t.current, kfA.value, kfB.value, ct);
			
			if(t.playing === false)
			{
				if(t.next !== null) _t.play(t.next);
				if(t.callback !== null) t.callback();
			} 
		}
	}
}