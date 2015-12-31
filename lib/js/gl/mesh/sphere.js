gb.mesh.sphere = function(radius, segments, rings)
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