gb.time = 
{
	began: 0,
    elapsed: 0,
    now: 0,
    last: 0,
    dt: 0,
    at: 0,
    scale: 1,
    paused: false,

    init: function()
    {
        var _t = gb.time;
    	_t.time_elapsed = 0;
        if(window.performance) _t.time_start = window.performance.now();
        else _t.time_start = Date.now();
    },
    update: function(t)
    {
        var _t = gb.time;
    	_t.now = t;
    	_t.dt = ((t - _t.last) / 1000) * _t.scale;
    	_t.last = t;
        _t.at += _t.dt * _t.scale;
        if(_t.at > 1) _t.at -=1;
    },
}