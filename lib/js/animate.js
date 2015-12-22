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
	this.start_time = null;
	this.duration = null;
	this.callback;
	this.next;
}
gb.Tween = function()
{
	this.bone_index = -1;
	this.property;
	this.index = -1;
	this.curve = [];
	this.num_frames;
}

gb.animation = 
{
	new: function(target)
	{
		var a = new gb.Animation();
		a.target = target;
		return a;
	},
	from_to: function(animation, property, from, to, duration, delay, easing)
	{
		var components = 1;
		if(from.length) 
		{
			components = from.length;
			ASSERT(from.length === to.length, 'Animatable properties must be of same component length');
		}

		for(var i = 0; i < components; ++i)
		{
			var t = new gb.Tween();
			t.num_frames = 2;
			t.property = property;
			
			var A,B;
			if(components > 1) 
			{
				A = from[i];
				B = to[i];
				t.index = i;
			}
			else
			{
				A = from;
				B = to;
				t.index = -1;
			}

			var A = from[i];
			var B = to[i];
			var D = B - A;

			t.curve = new Float32Array(
			[
				-duration * easing[0], A - (D * easing[1]),
				delay, A,
				duration * easing[0], A + (D * easing[1]),
				(delay + duration) - (duration * easing[2]), B - (D * easing[3]),
				delay + duration, B,
				(delay + duration) + (duration * easing[2]), B + (D * easing[3])
			]);
			a.tweens.push(t);
		}
	},
	play: function(anim, loops)
	{
		anim.is_playing = true;
		anim.t = 0;
		anim.loops = loops || 1;
		anim.loop_count = 0;
	},
	add_keyframe: function(tween, value, t, easing)
	{
		tween.curve.push([0, 0, t, value, 0, 0]);
		tween.num_frames++;
	},
	tween: function(property, index, curve)
	{
		var t = new gb.Tween();
		t.property = property;
		t.index = index;
		t.curve = curve;
		return t;
	},
	get_start_time: function(animation)
	{
		if(animation.start_time !== null) return animation.start_time;

		var result = gb.math.MAX_F32;
		var num_tweens = animation.tweens.length;
		for(var i = 0; i < num_tweens; ++i)
		{
			var t = animation.tweens[i].curve[2];
			if(t < result) result = t;
		}
		animation.start_time = result;
		return result;
	},
	get_duration: function(animation)
	{
		if(animation.duration !== null) return animation.duration;

		var result = 0;
		var num_tweens = animation.tweens.length;
		for(var i = 0; i < num_tweens; ++i)
		{
			var tween = animation.tweens[i];
			var t = tween.curve[(tween.num_frames * 6) - 4];
			if(t > result) result = t;
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

		var in_range = false;
		var num_tweens = animation.tweens.length;
		var ax, ay, bx, by, cx, cy, dx, dy;
		for(var i = 0; i < num_tweens; ++i)
		{
			var tween = animation.tweens[i];
			for(var j = 0; j < tween.num_frames-1; ++j)
			{
				var index = j * 6;
				ax = tween.curve[index + 2];
				ay = tween.curve[index + 3];
				bx = tween.curve[index + 4];
				by = tween.curve[index + 5];
				cx = tween.curve[index + 6];
				cy = tween.curve[index + 7];
				dx = tween.curve[index + 8];
				dy = tween.curve[index + 9];

				if(animation.t <= dx && animation.t >= ax)
				{
					in_range = true;
					break;
				}
			}

			if(in_range === false) continue;

			var time_range = dx - ax;
			var value_range = dy - ay;

			var t = (animation.t - ax) / time_range;
			if(t < 0.0) t = 0.0;
			else if(t > 1.0) t = 1.0;

			var u = 1.0 - t;
			var tt = t * t;
			var uu = u * u;
			var uuu = uu * u;
			var ttt = tt * t;
			var value = (uuu * ay) + (3 * uu * t * by) + (3 * u * tt * cy) + (ttt * dy);

			if(tween.bone_index !== -1)
			{
				animation.target[tween.bone_index][tween.property][tween.index] = value;
			}
			else
			{
				if(tween.index === -1)
				{
					animation.target[tween.property] = value;
				}
				else
				{
					animation.target[tween.property][tween.index] = value;
				}
			}
			if(animation.target.dirty !== undefined) animation.target.dirty = true;
		}
		if(in_range === false)
		{
			if(animation.loops === -1)
			{
				animation.t = gb.animation.get_start_time(animation);
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
					animation.t = gb.animation.get_start_time(animation);
				}
			}
		}
	},
}

gb.serialize.r_action = function(br)
{
    var s = gb.serialize;
    var animation = new gb.Animation();
    animation.target_type = s.r_i32(br);
    animation.name = s.r_string(br);
    animation.target = s.r_string(br);

    var num_curves = s.r_i32(br);
    for(var i = 0; i < num_curves; ++i)
    {
    	var tween = new gb.Tween();
    	tween.property = s.r_string(br);
    	tween.index = s.r_i32(br);

    	tween.num_frames = s.r_i32(br);
    	tween.curve = s.r_f32_array(br, tween.num_frames * 6);
    	animation.tweens.push(tween);
    }
    gb.animation.get_start_time(animation);
    gb.animation.get_duration(animation);
    return animation;	
}
gb.serialize.r_rig_action = function(br)
{
	var s = gb.serialize;
    var animation = new gb.Animation();
    animation.target_type = 2;
    animation.name = s.r_string(br);

    var num_curves = s.r_i32(br);
    for(var i = 0; i < num_curves; ++i)
    {
    	var tween = new gb.Tween();
    	tween.bone_index = s.r_i32(br);
    	tween.property = s.r_string(br);
    	tween.index = s.r_i32(br);

    	tween.num_frames = s.r_i32(br);
    	tween.curve = s.r_f32_array(br, tween.num_frames * 6);
    	animation.tweens.push(tween);
    }
    return animation;
}