var lv = 
{
	launch_count: 0,
	nations: [],
	rockets: [],
	operators: [],
	orbits: [],
	sites: [],
	providers: [],
	launches: [],
	outcomes: [],
};

gb.LatLng = function()
{
	this.lat;
	this.lng;
}
lv.Orbit = function()
{
	this.name;
	this.apogee;
	this.perigee;
}
lv.Rocket = function()
{
	this.name;
}
lv.Payload = function()
{
	this.name;
	this.operator;
	this.mission;
	this.orbit;
	this.decay;
}
lv.Nation = function()
{
	this.name;
	this.flag;
}
lv.Operator = function()
{
	this.name;
	this.nation;
}
lv.Provider = function()
{
	this.name;
	this.nation;
}
lv.Launch_Site = function()
{
	this.name;
	this.location;
	this.nation;
}
lv.Outcome = function()
{
	this.name;
}
lv.Date = function()
{
	this.day;
	this.month;
	this.year;
	this.hour;
	this.minute;
	this.second;
}
lv.Launch = function()
{
	this.id;
	this.date;
	this.rocket;
	this.operator;
	this.site;
	this.orbit;
	this.payloads = [];
	this.description;
	this.provider;
	this.video;
	this.outcome;
}


lv.load_data = function(br)
{
	var s = gb.binary_reader;
	var n;

	// NATIONS
	n = s.i32(br);
	for(var i = 0; i < n; ++i) lv.nations.push(s.nation(br));

	// ROCKETS
	n = s.i32(br);
	for(var i = 0; i < n; ++i) lv.rockets.push(s.rocket(br));

	// LAUNCH SITES
	n = s.i32(br);
	for(var i = 0; i < n; ++i) lv.sites.push(s.launch_site(br));

	// ORBITS
	n = s.i32(br);
	for(var i = 0; i < n; ++i) lv.orbits.push(s.orbit(br));

	// OPERATORS
	n = s.i32(br);
	for(var i = 0; i < n; ++i) lv.operators.push(s.operator(br));
	
	//PROVIDERS
	n = s.i32(br);
	for(var i = 0; i < n; ++i) lv.providers.push(s.provider(br));

	//OUTCOMES
	n = s.i32(br);
	for(var i = 0; i < n; ++i) lv.outcomes.push(s.outcome(br));

	//LAUCHES
	n = s.i32(br);
	for(var i = 0; i < n; ++i) lv.launches.push(s.launch(br));
}

gb.binary_reader.date = function(br)
{
	var s = gb.binary_reader;
	var d = new lv.Date();
	d.day = s.i32(br);
	d.month = s.i32(br);
	d.year = s.i32(br);
	d.hour = s.i32(br);
	d.minute = s.i32(br);
	d.second = s.i32(br);
	return d;	
}
gb.binary_reader.latlng = function(br)
{
	var s = gb.binary_reader;
	var c = new gb.LatLng();
	c.lat = s.f32(br);
	c.lng = s.f32(br);
	return c;
}
gb.binary_reader.orbit = function(br)
{
	var s = gb.binary_reader;
	var c = new lv.Orbit();
	c.name = s.string(br);
	c.apogee = s.f32(br);
	c.perogee = s.f32(br);
	return c;
}
gb.binary_reader.nation = function(br)
{
	var s = gb.binary_reader;
	var n = new lv.Nation();
	n.name = s.string(br);
	return n;
}
gb.binary_reader.rocket = function(br)
{
	var s = gb.binary_reader;
	var r = new lv.Rocket();
	r.name = s.string(br);
	return r;
}
gb.binary_reader.operator = function(br)
{
	var s = gb.binary_reader;
	var o = new lv.Operator();
	o.name = s.string(br);
	o.nation = lv.nations[s.i32(br)];
	return o;
}
gb.binary_reader.provider = function(br)
{
	var s = gb.binary_reader;
	var p = new lv.Provider();
	p.name = s.string(br);
	p.nation = lv.nations[s.i32(br)];
	return p;	
}
gb.binary_reader.launch_site = function(br)
{
	var s = gb.binary_reader;
	var site = new lv.Launch_Site();
	site.name = s.string(br);
	site.location = s.latlng(br);
	site.nation = lv.nations[s.i32(br)];
	return site;
}
gb.binary_reader.payload = function(br)
{
	var s = gb.binary_reader;
	var pl = new lv.Payload();
	pl.name = s.string(br);
	pl.operator = lv.operators[s.i32(br)];
	pl.orbit = lv.orbits[s.i32(br)];
	pl.mission = s.string(br);
	var will_decay = s.b32(br);
	if(will_decay === true)
	{
		pl.decay = s.date(br);
	}
	pl.outcome = lv.outcomes[s.i32(br)];
	return pl;
}
gb.binary_reader.outcome = function(br)
{
	var s = gb.binary_reader;
	var o = new lv.Outcome();
	o.name = s.string(br);
	LOG(o);
	return o;
}
gb.binary_reader.launch = function(br)
{
	var s = gb.binary_reader;
	var l = new lv.Launch();
	l.id = lv.launch_count;
	lv.launch_count++;

	l.date = s.date(br);
	l.rocket = lv.rockets[s.i32(br)];
	l.provider = lv.providers[s.i32(br)];
	l.site = lv.sites[s.i32(br)];

	var n_payloads = s.i32(br);
	for(var i = 0; i < n_payloads; ++i)
	{
		l.payloads.push(s.payload(br));
	}

	var has_video = s.b32(br);
	if(has_video === true)
	{
		l.video = s.string(br);
	}
	l.details = s.string(br);
	LOG(l);
	return l;
}