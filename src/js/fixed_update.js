function tick_fixed_update(dt, callback)
{
	var time = app.time;
	time.acculumator += dt;

	while(time.accumulator >= time.fixed_dt)
	{
		callback();
		time.accumulator -= time.fixed_dt;
	}
}