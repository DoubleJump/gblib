function read_mesh(ag)
{
	var name = read_string();
	var vb_size = read_i32();
	var vb_data = read_f32(vb_size);
	var ib_size = read_i32();
	var ib_data = null;
	if(ib_size > 0) ib_data = read_i32(ib_size);

	var attributes = {};
	var num_attributes = read_i32();
	for(var i = 0; i < num_attributes; ++i)
	{
		var attr_name = read_string();
		var attr_size = read_i32();
        var attr_norm = read_boolean();
        attributes[attr_name] = VertexAttribute(attr_size, attr_norm);
	}

	var vb = VertexBuffer(vb_data, attributes);
	var ib = null;
	if(ib_data) ib = IndexBuffer(ib_data);

	var mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
    mesh.name = name;
	if(ag) ag.meshes[name] = mesh;
	return mesh;
}

function read_shader(ag)
{
    var name = read_string();
    var vs = read_string();
    var fs = read_string();
    var shader = Shader(vs, fs);
    shader.name = name;
    if(ag) ag.shaders[name] = shader;
    return shader;
}

function read_material_input()
{
	var result;
	var type = read_i32();
	switch(type)
	{
		case 1: //FLOAT
			result = read_f32();
			return result;
		case 2: //TEXTURE
			var name = read_string();
			var sampler = Sampler();
			var interpolation = read_i32();
			if(interpolation === 0)
			{
				sampler.up = GL.NEAREST;
				sampler.down = GL.NEAREST; 
			}
			else
			{
				sampler.up = GL.LINEAR;
				sampler.down = GL.LINEAR;
			}

			var clamping = read_i32();
			if(clamping === 0)
			{
				sampler.s = GL.REPEAT;
				sampler.t = GL.REPEAT;
			}
			else
			{
				sampler.s = GL.CLAMP_TO_EDGE;
				sampler.t = GL.CLAMP_TO_EDGE;
			}
			return [name, sampler];
		break;
		case 3: //COLOR
			result = read_f32(4);
			return result;
		break;
		case 4: // EMPTY
			return null;
	}
}

function read_material(ag)
{
	var name = read_string();
	var type = read_i32();
	if(type === Material_Type.PBR)
	{
		var m = PBR_Material(name);
		m.inputs.albedo = read_material_input();
		m.inputs.normal = read_material_input();
		m.inputs.metallic = read_material_input();
		m.inputs.specular = read_material_input();
		m.inputs.roughness = read_material_input();
		m.inputs.ior = read_material_input();
		m.inputs.transmission = read_material_input();
		ag.materials[name] = m; 
	}
}

function read_transform(e)
{
	var has_parent = read_i32();
	if(has_parent) e.parent = read_string();
	read_vec(e.position);
	read_vec(e.scale);
	read_vec(e.rotation);
}

function read_camera(scene)
{
	var c = Camera(0.0, 100.0, 60, app.view, false, 1);

	c.name = read_string(ob.name);
	read_transform(c);

	var type = read_i32();
	if(type === 0)
	{
		c.ortho = true;
		c.size = read_f32();
	}

	c.near = read_f32();
	c.far = read_f32();
	c.fov = read_f32();

	add_to_scene(scene, c);
}

function read_lamp(scene)
{
	var l = Lamp();
	l.name = read_string();
	read_transform(l);
	l.lamp_type = read_i32();
	read_vec(l.color);
	lamp.energy = read_f32();
	lamp.distance = read_f32();
	add_to_scene(scene, l);	
}

function read_entity(scene)
{
	var e = Entity(0,0,0);
	e.entity_type = Entity_Type.OBJECT;
	e.name = read_string();
	read_transform(e);
	
	var has_mesh = read_boolean();
	if(has_mesh)
	{
		e.draw_info.mesh = read_string();
	}
		
	var has_material = read_boolean();
	if(has_material)
	{
		e.draw_info.material = read_string();
	}

	add_to_scene(scene, e);
}

function read_font(ag)
{
    var file_size = read_i32();

    var r = Font();
    r.name = read_string();
    var offset = get_reader_offset();

    r.num_glyphs = read_i32();

    r.glyphs = new Array(r.num_glyphs);
    for(var i = 0; i < r.num_glyphs; ++i)
    {
        var glyph = Glyph();
        glyph.code_point = read_u32();
        glyph.uv = read_f32(4);
        glyph.size = read_f32(2);
        glyph.horizontal_bearing = read_f32(2);
        glyph.vertical_bearing = read_f32(2);
        glyph.advance = read_f32(2);
        r.glyphs[i] = glyph;
    }

    r.has_kerning = read_boolean();

    if(r.has_kerning === true)
    {
        var kt = Kerning_Table();
        kt.count = read_i32();
        kt.capacity = read_i32();
        kt.keys = new Array(kt.capacity);

        for(var i = 0; i < kt.capacity; ++i)
        {
            var key = Kern_Key();
            key.code_point_a = read_u32();
            key.code_point_b = read_u32();
            key.key_index = read_i32();
            kt.keys[i] = key;
        }
        
        kt.values = read_f32(kt.count);
        r.max_tries = read_i32();   
        r.kerning = kt;
    }

    r.ascent = read_f32();
    r.descent = read_f32();
    r.space_advance = read_f32();
    r.tab_advance = read_f32();
    r.x_height = read_f32();
    r.cap_height = read_f32();

    if(ag) ag.fonts[r.name] = r;

    // Font buffers are packed so need to add padding back in
    var pad = get_padding(_BR.alignment, file_size);
    reader_seek(offset + file_size + pad);

    return r;
}

function read_curve(ag)
{
	var name = read_string();
    var is_2d = read_boolean();
    var num_points = read_i32();
    var data;
    var dimensions = 2;
    if(is_2d === false) dimensions = 3; 
    data = read_f32(num_points * (dimensions * 3));
    var curve = Curve(dimensions, data);
    if(ag) ag.curves[name] = curve;
    return curve;
}