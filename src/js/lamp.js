var Lamp_Type = 
{
	POINT: 0,
	SUN: 1,
	SPOT: 2,
	AREA: 3
};

function Lamp()
{
	var r = {};
	r.entity_type = Entity_Type.LAMP;
	r.lamp_type = Lamp_Type.POINT;
	r.energy = 0;
	r.distance = 0;
	return r;
}