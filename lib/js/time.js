gb.time = 
{
	start: 0,
    elapsed: 0,
    now: 0,
    last: 0,
    dt: 0,
    at: 0,
    scale: 1,
    paused: false,

    init: function(t)
    {
        var _t = gb.time;
    	_t.elapsed = 0;
        _t.start = t;
    },
    update: function(t)
    {
        var _t = gb.time;
    	_t.now = t;
    	_t.dt = ((t - _t.last) / 1000) * _t.scale;
    	_t.last = t;
        _t.elapsed += _t.dt * _t.scale;
        _t.at += _t.dt * _t.scale;
        if(_t.at > 1) _t.at -=1;
    },
}