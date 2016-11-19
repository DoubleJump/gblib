function quad_mesh(width, height)
{
	var w = width / 2;
	var h = height / 2;

    var attributes = 
    {
        position: VertexAttribute(2, false),
        uv: VertexAttribute(2, false)
    };
    var vertices = new Float32Array(
    [
        -w,-h, 0,0,
         w,-h, 1,0,
         w, h, 1,1,
        -w,-h, 0,0,
         w, h, 1,1,
        -w, h, 0,1
    ]);
    
    var vb = VertexBuffer(vertices, attributes);
    var mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
	return mesh;
}