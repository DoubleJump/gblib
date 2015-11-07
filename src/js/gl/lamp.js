gb.Lamp = function()
{
	this.entity;
	this.type = gb.LampType.POINT;
	this.energy = 1;
	this.distance = 1;
}

gb.lamp = 
{
	new: function(type, energy, distance)
	{
		var e = gb.entity.new();
	    var l = new gb.Lamp();
	    l.type = type;
	    l.energy = energy;
	    l.distance = distance;
	    e.lamp = l;
	    l.entity = e;
	    return e;
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
    var entity = s.r_entity(br, ag);
    entity.type = gb.EntityType.LAMP;
    var lamp = new gb.Lamp();
    lamp.energy = s.r_f32(br);
    lamp.distance = s.r_f32(br);
    entity.lamp = lamp;
    lamp.entity = entity;
    return entity;
}