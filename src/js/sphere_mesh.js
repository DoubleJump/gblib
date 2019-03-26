function sphere_mesh(radius, segments, rings, col)
{
	var elements = (rings + 1) * (segments + 1);

    var attributes = 
    {
        position: VertexAttribute(3, false),
        uv: VertexAttribute(2, false),
    };

    var data = new Float32Array(elements * 5);

	var lat;
	var lng;
	var t = 0;
	for(lat = 0; lat <= rings; ++lat)
	{      
        var theta = lat * PI / rings;
        var sintheta = Math.sin(theta);
        var costheta = Math.cos(theta);

        for(lng = 0; lng <= segments; ++lng)
        {
            var phi = lng * TAU / segments;
            var sinphi = Math.sin(phi);
            var cosphi = Math.cos(phi);

           	var x = cosphi * sintheta;
          	var y = costheta;
            var z = sinphi * sintheta;
            
            data[  t] = x * radius;
            data[t+1] = y * radius;
            data[t+2] = z * radius;

            data[t+3] = 1.0 - (lng / segments);
            data[t+4] = 1.0 - (lat / rings);

            t += 5;
        }
    }

    var tris = new Uint32Array(elements * 6);
    t = 0;
    for(lat = 0; lat < rings; ++lat)
	{ 
		for(lng = 0; lng < segments; ++lng)
        {
        	var i = lat * (segments + 1) + lng;
        	var j = i + segments + 1;

		    tris[  t] = i;
		    tris[t+1] = i+1;
		    tris[t+2] = j;
		    tris[t+3] = j;
		    tris[t+4] = i+1;
		    tris[t+5] = j+1;

		    t += 6;
        }
    }

    var vb = VertexBuffer(data, attributes);
    var ib = IndexBuffer(tris);

    var mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
    bind_mesh(mesh);
    update_mesh(mesh);
    return mesh;
}
