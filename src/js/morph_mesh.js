function morph_mesh(a,b)
{   
    var length_a = a.vertex_buffer.count;
    var length_b = b.vertex_buffer.count;
    var total_length = max(length_a, length_b);

    //just try positions for now
    var attributes = 
    {
        position: VertexAttribute(3, false),
        normal: VertexAttribute(3, false),
        positionB: VertexAttribute(3, false),
        normalB: VertexAttribute(3, false),
    };
    var vertices = new Float32Array(total_length * 12);

    var da = a.vertex_buffer.data;

    //copy a verts
    var stride = 3;
    var src = 0;
    var dst = 0;
    for(var i = 0; i < length_a; ++i)
    {
        vertices[dst] = da[src];
        vertices[dst+1] = da[src+1];
        vertices[dst+2] = da[src+2];

        vertices[dst+3] = da[src+3];
        vertices[dst+4] = da[src+4];
        vertices[dst+5] = da[src+5];

        src += a.vertex_buffer.stride;
        dst += 12;
    }

    var db = b.vertex_buffer.data;

    src = 0;
    dst = 6;
    for(var i = 0; i < length_b; ++i)
    {
        vertices[dst] = db[src];
        vertices[dst+1] = db[src+1];
        vertices[dst+2] = db[src+2];

        vertices[dst+3] = db[src+3];
        vertices[dst+4] = db[src+4];
        vertices[dst+5] = db[src+5];

        src += b.vertex_buffer.stride;
        dst += 12;
    }
    
    var vb = VertexBuffer(vertices, attributes);
    var mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
    return mesh;
}