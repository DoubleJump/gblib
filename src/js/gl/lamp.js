gb.Lamp = function()
{
	this.lamp_type = null;
	this.energy = 1;
	this.distance = 1;
	this.entity;
}

gb.lamp = 
{
	new: function(energy, distance)
	{
	    var c = new gb.Lamp();
	    c.energy = energy;
	    c.distance = distance;
	    c.entity = new gb.Entity();
	    return c;
	},
}

gb.LampType = 
{
    POINT: 0,
    SUN: 1,
}

gb.serialize.r_lamp = function(br, ag)
{
    var s = gb.serialize;
    var lamp = new gb.Lamp();
    lamp.entity = s.r_entity(br, ag);
    lamp.energy = s.r_f32(br);
    lamp.distance = s.r_f32(br);
    return lamp;
}