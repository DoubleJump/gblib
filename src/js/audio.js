function AudioClip()
{
	var r = {};
	r.src;
	r.data;
	r.duration;
	r.playing = false;
	r.loaded = false;
	return r;
}

function Sound()
{
	var r = {};
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	r.ctx = new AudioContext();
	r.gain = r.ctx.createGain();
	r.gain.connect(r.ctx.destination);

	return r;
}

function play_sound(sound, at, loop)
{
	var ctx = app.sound.ctx;
	stop_sound(sound);
	sound.src = ctx.createBufferSource();
	sound.src.buffer = sound.data;
	sound.src.connect(ctx.destination);
	sound.playing = true;
	sound.src.loop = loop || false;
	sound.src.start(0, at || 0);
}

function stop_sound(sound)
{
	sound.playing = false;
	if(sound.src) sound.src.stop(0);
}

function pause_audio()
{
	var ctx = app.sound.ctx;
	ctx.suspend();
}

function resume_audio()
{
	var ctx = app.sound.ctx;
	ctx.resume();
}

function mute_audio(val)
{
	var ctx = app.sound.ctx;
	app.sound.gain.gain.setValueAtTime(0, ctx.currentTime);

	LOG('Sound is off');
}

function unmute_audio()
{
	var ctx = app.sound.ctx;
	app.sound.gain.gain.setValueAtTime(1, ctx.currentTime);

	LOG('Sound is on');
}