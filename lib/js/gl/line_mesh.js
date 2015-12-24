gb.LineMesh = function()
{
	this.entity;
	this.thickness;
	this.color;
	this.num_points;
	this.points = [];
}

gb.line_mesh = 
{
	new: function(thickness, color, points)
	{
		var lm = new gb.LineMesh();
		lm.thickness = thickness;
		lm.color = gb.color.new();
		if(color) lm.color.eq(color);

		var e, vb, ib, m;

		e = gb.entity.new();
		e.entity_type = gb.EntityType.ENTITY;
		//e.update = gb.line_mesh.update;
	    lm.entity = e;
	    e.line_mesh = lm;

		if(points)
	    {
	    	lm.points = points;
	    	gb.line_mesh.update(e);
	    }
	    return lm;
	},
	update: function(e)
	{
		var lm = e.line_mesh;

		ASSERT(lm.points.length > 1, "Line does not contain enought points");

		var VS = 2;
		var vec = gb.vec2;
		var vb, ib, m;
		var num_points = lm.points.length / VS;
		var num_faces = num_points - 1;
		var vertex_count = num_faces * 4;
		var index_count = num_faces * 6;

		if(!lm.entity.mesh)
		{
			vb = gb.vertex_buffer.new();
			gb.vertex_buffer.add_attribute(vb, 'position', VS);
			gb.vertex_buffer.add_attribute(vb, 'normal', VS);
			gb.vertex_buffer.add_attribute(vb, 'mitre', 1);
			gb.vertex_buffer.alloc(vb, vertex_count);

			//ib = gb.index_buffer.new(index_count);
			m = gb.mesh.new(vb, null, 'TRIANGLES', 'DYNAMIC_DRAW');
			lm.entity.mesh = m;
		}
		else
		{
			vb = m.vertex_buffer;
			//ib = m.index_buffer;
			m = lm.entity.mesh;

			if(lm.num_points !== lm.points.length)
			{
				gb.vertex_buffer.resize(vb, vertex_count, false);
				//gb.index_buffer.resize(index_buffer, index_count, false);
				lm.num_points = lm.points.length;
			}
		}

		var stack = vec.stack.index;
		var p0 = vec.tmp();
		var p1 = vec.tmp();
		var p2 = vec.tmp();

		var N  = vec.tmp();
		var LA = vec.tmp();
		var LB = vec.tmp();
		var tangent = vec.tmp();
		var mitre = vec.tmp();
		var mitre_dist;

		//set first
		var index = 0;
		vec.set(p0, lm.points[0], lm.points[1]);
		vec.set(p1, lm.points[2], lm.points[3]);
		vec.sub(LA, p1, p0);
		vec.perp(N, LA);

		//gb.mesh.set_vertex(mesh, 'position', 0, p0);

		for(var j = 0; j < VS; ++j) vb.data[index + j] = p0[j];
		index += VS;
		for(var j = 0; j < VS; ++j) vb.data[index + j] = N[j];
		index += VS;
		vb.data[index] = 1.0;
		index += 1;

		for(var j = 0; j < VS; ++j) vb.data[index + j] = p1[j];
		index += VS;
		for(var j = 0; j < VS; ++j) vb.data[index + j] = -N[j];
		index += VS;
		vb.data[index] = 1.0;
		index += 1;

		for(var i = 1; i < num_points; ++i)
		{
			var ii = i * VS;
	
			vec.set(p0, lm.points[ii-2], lm.points[ii-1]);
			vec.set(p1, lm.points[ii], lm.points[ii+1]);
			vec.sub(LA, p1, p0);

			if(i === num_points - 1) //last
			{
				vec.perp(N, LA);
				mitre_dist = 1.0;

				// A1
				for(var j = 0; j < VS; ++j) vb.data[index + j] = p1[j];
				index += VS;
				for(var j = 0; j < VS; ++j) vb.data[index + j] = -N[j];
				index += VS;
				vb.data[index + j] = mitre_dist;
				index ++;

				
				// A2
				for(var j = 0; j < VS; ++j) vb.data[index + j] = p1[j];
				index += VS;
				for(var j = 0; j < VS; ++j) vb.data[index + j] = N[j];
				index += VS;
				vb.data[index + j] = mitre_dist;
				index ++;
			}
			else
			{
				vec.set(p2, lm.points[ii+2], lm.points[ii+3]);
				vec.sub(LB, p2, p1);
				vec.normalized(LA, LA);
				vec.normalized(LB, LB);
				vec.perp(N, LA);
				vec.add(tangent, LB,LA);
				vec.perp(mitre, tangent);
				mitre_dist = lm.thickness / vec.dot(mitre, N);

				// A1
				for(var j = 0; j < VS; ++j) vb.data[index + j] = p1[j];
				index += VS;
				for(var j = 0; j < VS; ++j) vb.data[index + j] = -N[j];
				index += VS;
				vb.data[index + j] = mitre_dist;
				index ++;

				
				// A2
				for(var j = 0; j < VS; ++j) vb.data[index + j] = p1[j];
				index += VS;
				for(var j = 0; j < VS; ++j) vb.data[index + j] = N[j];
				index += VS;
				vb.data[index + j] = mitre_dist;
				index ++;


				// B1 
				for(var j = 0; j < VS; ++j) vb.data[index + j] = p1[j];
				index += VS;
				for(var j = 0; j < VS; ++j) vb.data[index + j] = -N[j];
				index += VS;
				vb.data[index + j] = mitre_dist;
				index ++;


				// B2
				for(var j = 0; j < VS; ++j) vb.data[index + j] = p1[j];
				index += VS;
				for(var j = 0; j < VS; ++j) vb.data[index + j] = N[j];
				index += VS;
				vb.data[index + j] = mitre_dist;
				index ++;
			}	
		}

		/*
		index = 0;
		var offset = 0;
		for(var i = 0; i < num_faces; ++i)
		{
			ib.data[index  ] = offset + 0;
			ib.data[index+1] = offset + 1;
			ib.data[index+2] = offset + 3;
			ib.data[index+3] = offset + 0;
			ib.data[index+4] = offset + 3;
			ib.data[index+5] = offset + 2;
			offset += 4;
			index += 6;
		}
		*/

	    gb.mesh.update(m);
		vec.stack.index = stack;
	},
	//circle: function(r)

}