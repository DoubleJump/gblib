var MeshLayout = 
{
	TRIANGLES: 0,
	LINES: 1,
	TRI_STRIP: 2
}

var BufferUpdateRate = 
{
	STATIC: 0,
	DYNAMIC: 1,
	STREAM: 2,
}

function VertexAttribute(size, norm)
{
	var r = {};
	r.size = size;
	r.normalized = norm || false;
	r.offset = 0;
	return r;
}

function VertexBuffer(data, attributes, rate)
{
	var r = {};
	r.id = null;
	r.data = data;
	r.stride = 0;
	for(var k in attributes)
	{
		var attr = attributes[k];
		attr.offset = r.stride;
		r.stride += attr.size;
	}
	r.attributes = attributes;

	r.offset = 0;
	r.update_start = 0;
	r.count = 0;
	r.capacity = 0;
	r.update_rate = rate || BufferUpdateRate.STATIC;
	
	if(data)
	{
		r.count = r.data.length / r.stride;
		r.capacity = r.data.length / r.stride;
	}

	return r;
}

function alloc_vertex_buffer_memory(vb, count)
{
	vb.data = new Float32Array(count * vb.stride);
	vb.count = vb.data.length / vb.stride;
	vb.capacity = vb.data.length / vb.stride;
}

function resize_vertex_buffer(vb, count, copy)
{
	if(vb === null) alloc_vertex_buffer_memory(vb, count);
	else
	{
		ASSERT((vb.data.length / vb.stride) !== vertex_count, 'Buffer already correct size');

		var new_buffer = new Float32Array(vb.stride * count);
		if(copy) new_buffer.set(vb.data);
		vb.data = new_buffer;
		vb.count = vb.data.length / vb.stride;
		vb.capacity = vb.data.length / vb.stride;
	}
}


function zero_buffer(b)
{
	var n = b.data.length;
	for(var i = 0; i < n; ++i) b.data[i] = 0;
}

function clear_mesh_buffers(mesh)
{
	mesh.vertex_buffer.offset = 0;
	zero_buffer(mesh.vertex_buffer);

	if(mesh.index_buffer !== null)
	{
		mesh.index_buffer.offset = 0;
		mesh.index_buffer.triangle_offset = 0;
		zero_buffer(mesh.index_buffer);
	}
}

function IndexBuffer(data, rate)
{
	var r = {};
	r.id = null;
	r.data = data;
	r.count = 0;
	if(data) r.count = r.data.length;
	r.update_rate = rate || BufferUpdateRate.STATIC;
	return r;
}
function alloc_index_buffer_memory(ib, count)
{
	ib.data = new Uint32Array(count);
	ib.count = count;
}

function resize_index_buffer(ib, count, copy)
{
	if(ib === null) alloc_index_buffer_memory(ib, count);
	else
	{
		var new_buffer = new Uint32Array(count);
		if(copy) new_buffer.set(ib.data);
		ib.data = new_buffer;
		ib.count = ib.data.length;
	}
}

function InstancedVertexBuffer(data, stride, normalized)
{
    var r = {};
    r.id = null;
    r.data = data;
    r.stride = stride;
    r.normalized = normalized;
    r.count = data.length / stride;
    return r;
}

function Mesh(vb, ib, layout)
{
	var r = {};
	r.vertex_buffer = vb;
	r.index_buffer = ib;
	r.layout = layout || MeshLayout.TRIANGLES;
	return r;
}

function read_mesh(ag)
{
	var name = read_string();
	var vb_size = read_i32();
	var vb_data = read_f32(vb_size);
	var ib_size = read_i32();
	var ib_data = null;
	if(ib_size > 0) ib_data = read_u32(ib_size);

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