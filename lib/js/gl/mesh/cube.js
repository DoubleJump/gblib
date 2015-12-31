gb.mesh.cube = function(width, height, depth)
{
	var x = width / 2;
	var y = height / 2;
	var z = depth / 2;

	var vb = gb.vertex_buffer.new(
	[
		// POS    NORMAL  UV
		-x,-y, z, 0,0,1, 0,0, 
		 x,-y, z, 0,0,1, 1,0, 
		-x, y, z, 0,0,1, 0,1, 
		 x, y, z, 0,0,1, 1,1, 
		 x,-y, z, 1,0,0, 0,0, 
		 x,-y,-z, 1,0,0, 1,0, 
		 x, y, z, 1,0,0, 0,1, 
		 x, y,-z, 1,0,0, 1,1, 
		-x,-y,-z, 0,-1,0,0,0, 
		 x,-y,-z, 0,-1,0,1,0, 
		-x,-y, z, 0,-1,0,0,1, 
		 x,-y, z, 0,-1,0,1,1, 
		-x,-y,-z, -1,0,0,0,0, 			
		-x,-y, z, -1,0,0,1,0, 			
		-x, y,-z, -1,0,0,0,1, 			
		-x, y, z, -1,0,0,1,1, 			
		-x, y, z, 0,1,1, 0,0, 
		 x, y, z, 0,1,1, 1,0, 
		-x, y,-z, 0,1,1, 0,1, 
		 x, y,-z, 0,1,1, 1,1, 
		 x,-y,-z, 0,0,-1,0,0, 
		-x,-y,-z, 0,0,-1,1,0, 
		 x, y,-z, 0,0,-1,0,1, 
		-x, y,-z, 0,0,-1,1,1 		
	]);

	gb.vertex_buffer.add_attribute(vb, 'position', 3);
	gb.vertex_buffer.add_attribute(vb, 'normal', 3);
    gb.vertex_buffer.add_attribute(vb, 'uv', 2);
			
	var ib = gb.index_buffer.new(
	[
		0,1,3,0,3,2, 
		4,5,7,4,7,6, 
		8,9,11,8,11,10, 
		12,13,15,12,15,14, 
		16,17,19,16,19,18, 
		20,21,23,20,23,22 
	]);

    return gb.mesh.new(vb, ib);
}