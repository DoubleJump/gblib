function cube_mesh(width, height, depth)
{
	var x = width  / 2;
	var y = height / 2;
	var z = depth  / 2;

	var attributes = 
    {
        position: VertexAttribute(3, false),
        mask: VertexAttribute(1, false)
    };

	var vertices = new Float32Array(
	[
		// POS    MASK
		-x,-y, z, 0,
		 x,-y, z, 0,
		 x, y, z, 0,
		-x, y, z, 0,

		-x,-y,-z, 1.1,
		-x, y,-z, 1.1,
		 x, y,-z, 1.1,
		 x,-y,-z, 1.1,

		-x, y,-z, 2.1,
		-x, y, z, 2.1,
		 x, y, z, 2.1,
		 x, y,-z, 2.1,

		-x,-y,-z, 3.1,
		 x,-y,-z, 3.1,
		 x,-y, z, 3.1,
		-x,-y, z, 3.1,

		 x,-y,-z, 4.1,
		 x, y,-z, 4.1,
		 x, y, z, 4.1,
		 x,-y, z, 4.1,

		-x,-y,-z, 5.1,
		-x,-y, z, 5.1,
		-x, y, z, 5.1,
		-x, y,-z, 5.1
	]);

	var triangles = new Uint32Array(
	[
		0,  1,  2,  0,  2,  3,
		4,  5,  6,  4,  6,  7,
		8,  9,  10, 8,  10, 11,
		12, 13, 14, 12, 14, 15,
		16, 17, 18, 16, 18, 19,
		20, 21, 22, 20, 22, 23
	]);

    var vb = VertexBuffer(vertices, attributes);
    var ib = IndexBuffer(triangles);
    var mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
	return mesh;
}