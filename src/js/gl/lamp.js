gb.Lamp = function()
{
	this.lamp_type = gb.LampType.POINT;
	this.energy = 1;
	this.distance = 1;
}

gb.lamp = 
{
	new: function(energy, distance)
	{
		var e = gb.entity.new();
	    var l = new gb.Lamp();
	    l.energy = energy;
	    l.distance = distance;
	    e.lamp = l;
	    return e;
	},
}

gb.LampType = 
{
    POINT: 0,
    SUN: 1,
}

gb.serialize.r_lamp = function(entity, br, ag)
{
    var s = gb.serialize;
    s.r_entity(entity, br, ag);
    entity.type = gb.EntityType.LAMP;
    var lamp = new gb.Lamp();
    lamp.energy = s.r_f32(br);
    lamp.distance = s.r_f32(br);
    entity.lamp = lamp;
}