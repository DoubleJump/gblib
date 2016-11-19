function Animation(target)
{
	var r = {};
	r.name;
	r.is_playing = false;
	r.auto_play = true;
	r.t = 0;
	r.time_scale = 1;
	r.target = target;
	r.tweens = [];
	r.loops = 1;
	r.loop_count = 0;
	r.start_time = null;
	r.duration = null;
	r.callback;
	r.next;
	return r;
}

function Tween()
{
	var r = {};
	r.bone_index = -1;
	r.property;
	r.index = -1;
	r.curve = [];
	r.num_frames;
	return r;
}


function play_animation(anim, loops)
{
	anim.is_playing = true;
	anim.t = 0.0;
	anim.loops = loops || -1;
	anim.loop_count = 0;
}

function add_keyframe(tween, value, t, easing)
{
	tween.curve.push([0, 0, t, value, 0, 0]);
	tween.num_frames++;
}

function animation_start_time(anim)
{
	if(anim.start_time !== null) return anim.start_time;

	var result = Number.MAX_VALUE;
	var num_tweens = anim.tweens.length;
	for(var i = 0; i < num_tweens; ++i)
	{
		var t = anim.tweens[i].curve[2];
		if(t < result) result = t;
	}
	anim.start_time = result;
	return result;
}

function animation_duration(anim)
{
	if(anim.duration !== null) return anim.duration;

	var result = 0;
	var num_tweens = anim.tweens.length;
	for(var i = 0; i < num_tweens; ++i)
	{
		var tween = anim.tweens[i];
		var t = tween.curve[(tween.num_frames * 6) - 4];
		if(t > result) result = t;
	}
	anim.duration = result;
	return result;
}

function update_animation(anim, dt)
{
	if(anim.is_playing === false) return;

	if(anim.auto_play === true)
		anim.t += dt * anim.time_scale;

	var in_range = false;
	var num_tweens = anim.tweens.length;
	var ax, ay, bx, by, cx, cy, dx, dy;
	for(var i = 0; i < num_tweens; ++i)
	{
		var tween = anim.tweens[i];
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

			if(anim.t <= dx && anim.t >= ax)
			{
				in_range = true;
				break;
			}
		}

		if(in_range === false) continue;

		var time_range = dx - ax;
		var value_range = dy - ay;

		var t = (anim.t - ax) / time_range;
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
			anim.target[tween.bone_index][tween.property][tween.index] = value;
		}
		else
		{
			if(tween.index === -1)
			{
				anim.target[tween.property] = value;
			}
			else
			{
				anim.target[tween.property][tween.index] = value;
			}
		}
		if(anim.target.dirty !== undefined) anim.target.dirty = true;
	}
	//if(in_range === false)
	if(anim.t > animation_duration(anim))
	{
		if(anim.loops === -1)
		{
			//animation.t = animation_start_time(animation);
			anim.t = 0;
		}
		else
		{
			anim.loop_count++;
			if(anim.loop_count === anim.loops)
			{
				if(anim.callback) anim.callback(anim);
				if(anim.next) anim.next.is_playing = true;
				anim.is_playing = false;
			}
			else
			{
				//animation.t = gb.animation.get_start_time(animation);
				anim.t = 0;
			}
		}
	}
}


function read_action()
{
    var animation = Animation();
    animation.target_type = read_i32();
    animation.name = read_string();
    animation.target = read_string();

    var num_curves = read_i32();
    for(var i = 0; i < num_curves; ++i)
    {
    	var tween = Tween();
    	tween.property = read_string();
    	tween.index = read_i32();

    	tween.num_frames = read_i32();
    	tween.curve = read_f32(tween.num_frames * 6);
    	animation.tweens.push(tween);
    }
    animation_start(animation);
    animation_duration(animation);
    return animation;	
}