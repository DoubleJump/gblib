function Time()
{
    var r = {};
    r.start = 0;
    r.elapsed = 0;
    r.accumulator = 0;
    r.fixed_dt = 0.02;
    r.max_frame = 0.05;
    r.now = 0;
    r.last = 0;
    r.dt = 0;
    r.at = 0;
    r.st = 0;
    r.nst = 0;
    r.frame = 0;
    r.scale = 1;
    r.paused = false;
    return r;
}

function set_time(time, t)
{
    time.frame++;
    time.now = t;
    time.dt = ((t - time.last) / 1000) * time.scale;
    if(time.dt > time.max_frame) time.dt = 0.016;
    time.last = t;
    time.elapsed += time.dt * time.scale;
    
    time.at += time.dt;
    if(time.at > 1) time.at -= 1;
    time.st = Math.sin(time.elapsed);
    time.nst = time.st / 2 + 0.5;
}