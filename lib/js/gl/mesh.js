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
	new gb.Vertex_Attribute_Info("color2", 4, true),
	new gb.Vertex_Attribute_Info("weight", 4, false),
];
gb.NUM_VERTEX_ATTRIBUTES = gb.vertex_attributes.length;

gb.Vertex_Buffer = function()
{
	this.id = 0;
	this.data;
	this.mask = 0;
	this.update_mode;
	this.stride = 0;
	this.offsets = new Uint32Array(gb.NUM_VERTEX_ATTRIBUTES);
}
gb.Index_Buffer = function()
{
	this.id = 0;
	this.data;
	this.update_mode;
}
gb.Mesh = function()
{
	this.name;
	this.layout;
	this.vertex_buffer = null;
	this.vertex_count = 0;
	this.index_buffer = null;
	this.index_count = 0;
	this.dirty = true;
	this.linked = false;
}

gb.mesh = 
{
	new: function(vertex_count, vertices, mask, indices)
	{
	    var m = new gb.Mesh();
	    m.layout = gb.webgl.ctx.TRIANGLES;

	    var vb = new gb.Vertex_Buffer();
	    vb.data = vertices;
	    vb.mask = mask;
	    vb.update_mode = gb.webgl.ctx.STATIC_DRAW;
	    m.vertex_buffer = vb;
	    gb.mesh.update_vertex_buffer(vb);
	    m.vertex_count = vertex_count;

	    var ib = new gb.Index_Buffer();
	    ib.data = indices;
	    ib.update_mode = gb.webgl.ctx.STATIC_DRAW;    
	    m.index_buffer = ib;

	    m.index_count = indices.length;
	    gb.webgl.link_mesh(m);
	    return m;
	},
	update_vertex_buffer: function(vb)
	{
		var index = 1;
		var n = gb.NUM_VERTEX_ATTRIBUTES;
		for(var i = 0; i < n; ++i)
		{
			var mr = (index & vb.mask) === index;
			var size = gb.vertex_attributes[i].size;
			vb.offsets[i] = vb.stride * 4; 
			vb.stride += mr * size;
			index *= 2;
		}
	},
	get_bounds: function(b, m)
	{
		var v3 = gb.vec3;
		var d = m.vertex_buffer.data;
		v3.set(b.min, d[0], d[1], d[2]);
		v3.set(b.max, d[0], d[1], d[2]);

		var stride = m.vertex_buffer.stride;
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
	var name = s.r_string(br);
	var h = s.r_i32_array(br, 4);
	var vertices = s.r_f32_array(br, h[1]);
	var indices = s.r_u32_array(br, h[2]);
	var mesh = gb.mesh.new(h[0], vertices, h[3], indices);
	mesh.name = name;
	return mesh;
}