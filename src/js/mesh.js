gb.Vertex_Attribute_Info = function(name, size, normalized)
{
	this.name = name;
	this.size = size;
	this.normalized = normalized;
}
gb.vertex_attributes =
[
	new gb.Vertex_Attribute_Info("position", 3, false),
	new gb.Vertex_Attribute_Info("normal", 3, false),
	new gb.Vertex_Attribute_Info("uv", 2, false),
	new gb.Vertex_Attribute_Info("uv2", 2, false),
	new gb.Vertex_Attribute_Info("color", 4, true),
];
gb.Vertex_Buffer = function()
{
	this.id = 0;
	this.data;
	this.mask;
	this.update_mode;
}
gb.Index_Buffer = function()
{
	this.id = 0;
	this.data;
	this.update_mode;
}
gb.Mesh = function()
{
	this.layout;
	this.vertex_buffer;
	this.vertex_count;
	this.index_buffer;
	this.index_count;
	this.dirty;
}
gb.new_mesh = function(vertex_count, vertices, mask, indices)
{
    var m = new gb.Mesh();
    m.layout = gb.webgl.ctx.TRIANGLES;

    var vb = new gb.Vertex_Buffer();
    vb.data = vertices;
    vb.mask = mask;
    vb.update_mode = gb.webgl.ctx.STATIC_DRAW;
    m.vertex_buffer = vb;
    m.vertex_count = vertex_count;

    var ib = new gb.Index_Buffer();
    ib.data = indices;
    ib.update_mode = gb.webgl.ctx.STATIC_DRAW;    
    m.index_buffer = ib;

    m.index_count = indices.length;
    m.dirty = true;
    return m;
}
gb.mesh = 
{
	get_stride: function(vb)
	{
		var stride = 0;
		var index = 1;
		for(var i = 0; i < 5; ++i)
		{
			var mr = (index & vb.mask) === index;
			stride += mr * (gb.vertex_attributes[i].size);
			index *= 2;
		}
		return stride;
	},
	get_bounds: function(b, m)
	{
		var v3 = gb.vec3;
		var d = m.vertex_buffer.data;
		v3.set(b.min, d[0], d[1], d[2]);
		v3.set(b.max, d[0], d[1], d[2]);

		var stride = gb.mesh.get_stride(m.vertex_buffer);
		var n = m.vertex_count;
		var p = v3.tmp(0,0,0);
		var c = stride;
		for(var i = 1; i < n; ++i)
		{
			v3.set(p, d[c], d[c+1], d[c+2]);

			if(p[0] < b.min[0]) b.min[0] = p[0];
			if(p[1] < b.min[1]) b.min[1] = p[1];
			if(p[2] < b.min[2]) b.min[2] = p[2];

			if(p[0] > b.max[0]) b.max[0] = p[0];
			if(p[1] > b.max[1]) b.max[1] = p[1];
			if(p[2] > b.max[2]) b.max[2] = p[2];

			c += stride;
		}
	},
}
gb.serialize.r_mesh = function(br)
{
	var s = gb.serialize;
	var h = s.r_i32_array(br, 4);
	var vertices = s.r_f32_array(br, h[1]);
	var indices = s.r_u32_array(br, h[2]);
	return gb.new_mesh(h[0], vertices, h[3], indices);
}