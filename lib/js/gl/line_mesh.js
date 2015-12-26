gb.LineMesh = function()
{
	this.entity;
	this.thickness;
	this.color;
	this.num_points;
	this.points = [];
	this.length;
}

gb.line_mesh = 
{
	new: function(points, thickness, color)
	{
		var lm = new gb.LineMesh();
		lm.thickness = thickness || 0.2;
		lm.color = gb.color.new();
		lm.legth = 0;
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

		var VS = 3;
		var v3 = gb.vec3;
		var vb, ib, m;
		var num_points = lm.points.length / VS;
		var num_faces = num_points - 1;
		var num_node_verts = 2;
		var vertex_count = num_faces * 4;
		var index_count = num_faces * 6;

		if(!lm.entity.mesh)
		{
			vb = gb.vertex_buffer.new();
			gb.vertex_buffer.add_attribute(vb, 'position', VS);
			gb.vertex_buffer.add_attribute(vb, 'previous', VS);
			gb.vertex_buffer.add_attribute(vb, 'next', VS);
			gb.vertex_buffer.add_attribute(vb, 'direction', 1);
			gb.vertex_buffer.add_attribute(vb, 'dist', 1);
			gb.vertex_buffer.alloc(vb, vertex_count);

			ib = gb.index_buffer.new(index_count);
			m = gb.mesh.new(vb, ib, 'TRIANGLES', 'DYNAMIC_DRAW');
			lm.entity.mesh = m;
		}
		else
		{
			vb = m.vertex_buffer;
			ib = m.index_buffer;
			m = lm.entity.mesh;

			if(lm.num_points !== lm.points.length)
			{
				gb.vertex_buffer.resize(vb, vertex_count, false);
				gb.index_buffer.resize(index_buffer, index_count, false);
				lm.num_points = lm.points.length;
			}
		}

		var stack = v3.stack.index;
		var current = v3.tmp();
		var previous = v3.tmp();
		var next = v3.tmp();
		var segment = v3.tmp();
		var distance = 0;
		var flip = 1;

		var index = 0;
		for(var i = 0; i < num_points; ++i)
		{
			var ii = i * VS;
	
			v3.set(current, lm.points[ii], lm.points[ii+1], lm.points[ii+2])

			if(i === 0) //first
			{
				v3.set(previous, lm.points[0], lm.points[1], lm.points[2]);
				v3.set(next, lm.points[3], lm.points[4], lm.points[5]);
			}
			else if(i === num_points - 1) //last
			{
				v3.set(previous, lm.points[ii-3], lm.points[ii-2], lm.points[ii-1]);
				v3.set(next, lm.points[ii], lm.points[ii+1], lm.points[ii+2]);
			}
			else
			{
				v3.set(previous, lm.points[ii-3], lm.points[ii-2], lm.points[ii-1]);
				v3.set(next, lm.points[ii+3], lm.points[ii+4], lm.points[ii+5]);
			}

			v3.sub(segment, current, previous);
			distance += v3.length(segment);

			for(var j = 0; j < num_node_verts; ++j)
			{
				//current
				for(var k = 0; k < VS; ++k)
				{
					vb.data[index] = current[k];
					index++;
				}
				//previous
				for(var k = 0; k < VS; ++k)
				{
					vb.data[index] = previous[k];
					index++;
				}
				//next
				for(var k = 0; k < VS; ++k)
				{
					vb.data[index] = next[k];
					index++;
				}
				//direction
				vb.data[index] = flip;
				index++;
				flip *= -1;

				vb.data[index] = distance;
				index++;
			}
		}
		lm.length = distance;
		LOG(lm.length);

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
			offset += 2;
			index += 6;
		}
	    gb.mesh.update(m);
		v3.stack.index = stack;
	},
	ellipse: function(rx, ry, segments, thickness, color)
	{
		var points = [];
		var theta = gb.math.TAU / segments;
		for(var i = 0; i < segments + 1; ++i)
		{
			var sin_theta = gb.math.sin(theta * i);
			var cos_theta = gb.math.cos(theta * i);
			points.push(sin_theta * rx);
			points.push(cos_theta * ry);
			points.push(0.0);
		}
		return gb.line_mesh.new(points, thickness, color);
	},
	circle: function(r, segments, thickness, color)
	{
		return gb.line_mesh.ellipse(r, r, segments,thickness, color)
	},

}