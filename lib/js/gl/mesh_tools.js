gb.mesh.generate = 
{
	quad: function(width, height, depth)
	{
	    var P = gb.vec3.tmp(width / 2, height / 2, depth / 2);
	    var N = gb.vec3.tmp();
	    gb.vec3.normalized(N, P);

	    var vb = gb.vertex_buffer.new(
	    [
	    	// POS  NORMAL UV
	        -P[0],-P[1], P[2], N[0], N[1], N[2], 0,0,
	         P[0],-P[1], P[2], N[0], N[1], N[2], 1,0,
	        -P[0], P[1],-P[2], N[0], N[1], N[2], 0,1,
	         P[0], P[1],-P[2], N[0], N[1], N[2], 1,1
	    ]);

	    gb.vertex_buffer.add_attribute(vb, 'normal', 3);
	    gb.vertex_buffer.add_attribute(vb, 'uv', 2);

	    var ib = gb.index_buffer.new([0,1,3,0,3,2]);

	    return gb.mesh.new(vb, ib);
	},

	cube: function(width, height, depth)
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
	},
}