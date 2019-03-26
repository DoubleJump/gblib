function Ticker()
{
    var now = window.performance.now();

    var r = {};
    r.frames_to_tick = 0;
    r.fixed_update = true;
    r.start = now;
    r.elapsed = 0;
    r.accumulator = 0;
    r.fixed_dt = 1/60;
    r.now = now;
    r.last = now;
    r.dt = 0;
    r.frame = 0;
    r.advance = 0;
    return r;
}

function advance_ticker(t)
{
    var now = window.performance.now();

    t.frames_to_tick = 0;
    t.now = now;
    t.dt = ((now - t.last) / 1000);
    t.last = now;
    t.elapsed += t.dt;    
    
    if(t.fixed_update === true)
    {
        t.advance = t.fixed_dt;
        t.accumulator += t.dt;
        while(t.accumulator >= t.fixed_dt)
        {
           t.frames_to_tick++;
           t.accumulator -= t.fixed_dt;
        }
    }
    else
    {
        t.advance = t.dt;
        t.frame++;
        t.frames_to_tick = 1;
    }
}

function Timer(start)
{
    var r = {};
    r.start = 0;
    r.elapsed = 0;
    r.last = 0;
    r.dt = 0;
    r.scale = 1;
    r.paused = false;
    return r;
}

function advance_timer(t, dt)
{
    t.last = t.elapsed;
    t.dt = dt * t.scale;
    t.elapsed += t.dt;
}
