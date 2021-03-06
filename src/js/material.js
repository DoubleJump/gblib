var Material_Type = 
{
	PBR: 1,
};

function Material(name, type, inputs, shader)
{
	var r = {};
	r.name = name;
	r.type = type;
	r.inputs = inputs;
	r.shader = shader;
	return r;
}

function PBR_Material(name)
{
	var inputs = 
	{
		albedo: 1.0,
		normal: 0.0,
		metallic: 0.0,
		specular: 0.5,
		roughness: 0.0,
		ior: 1.4,
		transmission: 0
	};
	return Material(name, Material_Type.PBR, inputs);
}
