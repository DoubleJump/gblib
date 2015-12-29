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

	    gb.vertex_buffer.add_attribute(vb, 'position', 3);
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
	},

	grid: function(width, height, res_x, res_y)
	{
		var num_cells = res_x * res_y;

		var vb = gb.vertex_buffer.new();
		gb.vertex_buffer.add_attribute(vb, 'position', 3);
		//gb.vertex_buffer.add_attribute(vb, 'normal', 3);
	    //gb.vertex_buffer.add_attribute(vb, 'uv', 2);
	    gb.vertex_buffer.alloc(vb, num_cells);

	    var w = width / res_x;
	    var h = height / res_y;
	    var hw = w / 2;
	    var hh = h / 2;
	    var u = 1 / w;
	    var v = 1 / h;

	    var i = 0;
	    for(var y = 0; y < res_y; ++y)
	    {
	    	for(var x = 0; x < res_x; ++x)
	    	{
	    		// position
                vb.data[  i] = (x * w) - hw;
                vb.data[i+1] = (y * h) - hh;
                vb.data[i+2] = 0.0;
                i += 3;

                // normal
                /*
                vb.data[  i] = 0;
                vb.data[i+1] = 0;
                vb.data[i+2] = 1;
                i += 3;
                */
                // uv
                /*
                vb.data[  i] = x * u;
                vb.data[i+1] = x * v;
                i += 2;
                */
	    	}
	    }

	    var ib = gb.index_buffer.new(num_cells * 6);
	    for(var n = 0; n < num_cells; ++n)
	    {
	    	ib.data[  i] = n + 0;
		    ib.data[i+1] = n + 1;
		    ib.data[i+2] = n + 3;
		    ib.data[i+3] = n + 0;
		    ib.data[i+4] = n + 3;
		    ib.data[i+5] = n + 2;
		    i += 6
	    }

	    return gb.mesh.new(vb, ib);
	},

	sphere: function(radius, segments, rings)
	{
		var lat, lng;
		var vb = gb.vertex_buffer.new();
		gb.vertex_buffer.add_attribute(vb, 'position', 3);
		gb.vertex_buffer.add_attribute(vb, 'normal', 3);
	    gb.vertex_buffer.add_attribute(vb, 'uv', 2);
	    gb.vertex_buffer.alloc(vb, rings * segments);

		var i = 0;
		for(lat = 0; lat <= rings; ++lat)
		{      
            var theta = lat * gb.math.PI / rings;
            var sin_theta = gb.math.sin(theta);
            var cos_theta = gb.math.cos(theta);

            for(lng = 0; lng <= segments; ++lng)
            {
                var phi = lng * gb.math.TAU / segments;
                var sin_phi = gb.math.sin(phi);
                var cos_phi = gb.math.cos(phi);

               	var x = cos_phi * sin_theta;
              	var y = cos_theta;
                var z = sin_phi * sin_theta;
                
                // position
                vb.data[  i] = x * radius;
                vb.data[i+1] = y * radius;
                vb.data[i+2] = z * radius;
                i += 3;

                // normal
                vb.data[  i] = x;
                vb.data[i+1] = y;
                vb.data[i+2] = z;
                i += 3;

                // uv
                uvs[  i] = 1.0 - (lng / segments);
                uvs[i+1] = 1.0 - (lat / rings);
                i += 2;
		    }
        }

	    var ib = gb.index_buffer.new(rings * segments * 6);
        i = 0;
        for(lat = 0; lat < rings; ++lat)
		{ 
			for(lng = 0; lng < segments; ++lng)
            {
            	var a = lat * (segments + 1) + lng;
            	var b = a + segments + 1;

			    ib.data[  i] = a;
			    ib.data[i+1] = b;
			    ib.data[i+2] = a+1;
			    ib.data[i+3] = b;
			    ib.data[i+4] = b+1;
			    ib.data[i+5] = a+1;
			    i += 6
            }
        }
        return gb.mesh.new(vb, ib);
	}
}