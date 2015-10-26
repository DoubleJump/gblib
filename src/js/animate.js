gb.Animation = function()
{
	this.name;
	this.is_playing = false;
	this.auto_play = true;
	this.t = 0;
	this.time_scale = 1;
	this.target; 
	this.tweens = [];
	this.loops = 1;
	this.loop_count = 0;
	this.start_time;
	this.duration;
	this.callback;
	this.next;
	return this;
}
gb.Tween = function()
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
	this.handles = new Float32Array(4);
	return this;
}

gb.animation = 
{
	get_animation_start: function(animation)
	{
		if(animation.start_time) return animation.start_time;
		var result = gb.animation.get_animation_duration(animation);
		var num_tweens = animation.tweens.length;
		for(var i = 0; i < num_tweens; ++i)
		{
			var tween = animation.tweens[i];
			var num_keys = tween.keyframes.length;
			var t = tween.keyframes[0].t;
			if(t < result)
				result = t;
		}
		animation.start_time = result;
		return result;
	},
	get_animation_duration: function(animation)
	{
		if(animation.duration) return animation.duration;
		var result = 0;
		var num_tweens = animation.tweens.length;
		for(var i = 0; i < num_tweens; ++i)
		{
			var tween = animation.tweens[i];
			var num_keys = tween.keyframes.length;
			var t = tween.keyframes[num_keys-1].t;
			if(t > result)
				result = t;
		}
		animation.duration = result;
		return result;
	},
	add_tween: function(animation, property, index, keyframes)
	{
		animation.tweens.push(new gb.Tween(property, index, keyframes));
	},
	update: function(animation, dt)
	{
		if(animation.is_playing === false) return;

		if(animation.auto_play === true)
			animation.t += dt * animation.time_scale;

		//if(animation.t < animation.start_time) return;

		var in_range = false;
		var num_tweens = animation.tweens.length;
		for(var i = 0; i < num_tweens; ++i)
		{
			var tween = animation.tweens[i];
			var key_start;
			var key_end;

			var num_keys = tween.keyframes.length;
			for(var j = 1; j < num_keys; ++j)
			{
				key_start = tween.keyframes[j-1];
				key_end = tween.keyframes[j];
				if(animation.t <= key_end.t && animation.t >= key_start.t)
				{
					in_range = true;
					break;
				}
			}

			var time_range = key_end.t - key_start.t;
			var value_range = key_end.value - key_start.value;

			var nt = (animation.t - key_start.t) / time_range;
			if(nt < 0.0) nt = 0.0;
			else if(nt > 1.0) nt = 1.0;

			var ax = key_start.t;
			var ay = key_start.value;
			var bx = key_start.handles[2];
			var by = key_start.handles[3];
			var cx = key_end.handles[0];
			var cy = key_end.handles[1];
			var dx = key_end.t;
			var dy = key_end.value;

			var t = nt;
			var u = 1.0 - t;
			var tt = t * t;
			var uu = u * u;
			var uuu = uu * u;
			var ttt = tt * t;

			var value = (uuu * ay) + 
				   (3 * uu * t * by) + 
				   (3 * u * tt * cy) + 
				   (ttt * dy);

			if(tween.index === -1)
			{
				animation.target[tween.property] = value;
			}
			else
			{
				animation.target[tween.property][tween.index] = value;
			}
		}
		if(in_range === false)
		{
			if(animation.loops === -1)
			{
				animation.t = gb.animation.get_animation_start(animation);
			}
			else
			{
				animation.loop_count++;
				if(animation.loop_count === animation.loops)
				{
					if(animation.callback) animation.callback(animation);
					if(animation.next) animation.next.is_playing = true;
					animation.is_playing = false;
				}
				else
				{
					animation.t = gb.animation.get_animation_start(animation);
				}
			}
		}
	},
}

gb.serialize.r_action = function(br)
{
    var s = gb.serialize;
    var animation = new gb.Animation();
    animation.name = s.r_string(br);
   
    var num_curves = s.r_i32(br);
    for(var i = 0; i < num_curves; ++i)
    {
    	var tween = new gb.Tween();
    	tween.property = s.r_string(br);
    	tween.index = s.r_i32(br);

    	var num_frames = s.r_i32(br);
    	for(var j = 0; j < num_frames; ++j)
    	{
    		var kf = new gb.Keyframe();
    		kf.t = s.r_f32(br);
    		kf.value = s.r_f32(br);
    		kf.handles[0] = s.r_f32(br);
    		kf.handles[1] = s.r_f32(br);
    		kf.handles[2] = s.r_f32(br);
    		kf.handles[3] = s.r_f32(br);
    		tween.keyframes.push(kf);
    	}
    	animation.tweens.push(tween);
    }
    return animation;	
}