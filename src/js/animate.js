/*
plx.Animation = function(tweens)
{
	this.tweens = tweens || [];
	this.curve = plx.ease;
	this.loops = 1;
	this.loops_count = 0;
	this.is_playing = false;
	this.manual_play = false;
	this.callback = callback;
	this.t = 0;
	this.time_scale = 1;
	return this;
}
*/

gb.Tween = function()
{
	this.name;
	this.t = 0;
	this.targets = []; 
	this.timelines = [];
	return this;
}
gb.Timeline = function()
{
	this.property;
	this.index = -1;
	this.keyframes = [];
	return this;
}
gb.Keyframe = function()
{
	this.value;
	this.t;
	return this;
}


//advance the animation
//for each channel in a tween
//evaluate the value for each channel
//tween.target[channel.property][channel.index] = evaluate(channel.keyframes, t)


/*
gb.Keyframe = function()
{
	this.value;
	this.curve;
	this.t;
}
gb.Tween = function()
{
	this.t = 0;
	this.frame = 1;
	this.target;

	this.frames;
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
*/

gb.serialize.r_action = function(br)
{
    var s = gb.serialize;
    var tween = new gb.Tween();
    tween.name = s.r_string(br);
    //console.log(tween.name);
    var num_curves = s.r_i32(br);
    for(var i = 0; i < num_curves; ++i)
    {
    	var timeline = new gb.Timeline();
    	timeline.property = s.r_string(br);
    	//console.log(timeline.property);

    	timeline.index = s.r_i32(br);
    	//console.log("Index: " + timeline.index);

    	var num_frames = s.r_i32(br);
    	//console.log("Frames: " + num_frames);
    	for(var j = 0; j < num_frames; ++j)
    	{
    		var kf = new gb.Keyframe();
    		kf.time = s.r_f32(br);
    		//console.log("Time: " + kf.time);
    		kf.value = s.r_f32(br);
    		//console.log("Value: " + kf.value);
    		timeline.keyframes.push(kf);
    	}
    	tween.timelines.push(timeline);
    }
    return tween;	
}