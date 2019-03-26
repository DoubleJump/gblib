function quad_mesh(width, height, depth, x_offset, y_offset, z_offset)
{
    var w = width / 2;
    var h = height / 2;
    var d = depth / 2;
    var x = x_offset || 0;
    var y = y_offset || 0;
    var z = z_offset || 0;

    var attributes = 
    {
        position: VertexAttribute(3, false),
        uv: VertexAttribute(2, false)
    };
    var vertices = new Float32Array(
    [
        -w + x,-h + y, +d + z, 0,0,
         w + x,-h + y, +d + z, 1,0,
         w + x, h + y, -d + z, 1,1,
        -w + x,-h + y, +d + z, 0,0,
         w + x, h + y, -d + z, 1,1,
        -w + x, h + y, -d + z, 0,1
    ]);
    
    var vb = VertexBuffer(vertices, attributes);
    var mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
    return mesh;
}