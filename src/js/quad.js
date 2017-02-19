function quad_mesh(width, height, x_offset, y_offset)
{
    var w = width / 2;
    var h = height / 2;
    var x = x_offset || 0;
    var y = y_offset || 0;

    var attributes = 
    {
        position: VertexAttribute(2, false),
        uv: VertexAttribute(2, false)
    };
    var vertices = new Float32Array(
    [
        -w + x,-h + y, 0,0,
         w + x,-h + y, 1,0,
         w + x, h + y, 1,1,
        -w + x,-h + y, 0,0,
         w + x, h + y, 1,1,
        -w + x, h + y, 0,1
    ]);
    
    var vb = VertexBuffer(vertices, attributes);
    var mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
    return mesh;
}