gb.LineMesh = function()
{
	this.entity;
	this.thickness;
	this.color;
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

		var vb, ib, m;
		var num_points = lm.points.length / 3;
		var vb_size = (num_points - 1) * 24;
		var ib_size = (num_points - 1) * 6;

		if(!lm.entity.mesh)
		{
			vb = gb.vertex_buffer.new(vb_size);
			gb.vertex_buffer.add_attribute(vb, 'normal', 3);
			ib = gb.index_buffer.new(ib_size);
			m = gb.mesh.new(vb, ib, 'TRIANGLES', 'DYNAMIC_DRAW');
			lm.entity.mesh = m;
		}
		else
		{
			m = lm.entity.mesh;
			vb = m.vertex_buffer;
			ib = m.index_buffer;

			if(vb.data.length !== vb_size) vb.data = new Float32Array(vb_size);
			if(ib.data.length !== ib_size) ib.data = new Uint32Array(ib_size);
		}

		
		var stack = gb.vec3.stack.index;
		var A = gb.vec3.tmp();
		var B = gb.vec3.tmp();
		var C = gb.vec3.tmp(0,0,1);
		var N = gb.vec3.tmp(0,0,0);
		var AB = gb.vec3.tmp();
		var AC = gb.vec3.tmp();

		for(var i = 1; i < num_points; ++i)
		{
			var ii = i * 3;
			gb.vec3.set(B, lm.points[ii], lm.points[ii+1], lm.points[ii+2]);
			gb.vec3.set(A, lm.points[ii-3], lm.points[ii-2], lm.points[ii-1]);

			gb.vec3.sub(AB, B, A);
			gb.vec3.sub(AC, C, A);
			gb.vec3.cross(N, AB, AC);
			gb.vec3.normalized(N, N);

			var index = (i - 1) * 24;

			// A1
			for(var j = 0; j < 3; ++j) vb.data[index + j] = A[j];
			index += 3;
			for(var j = 0; j < 3; ++j) vb.data[index + j] = -N[j];
			index += 3;
			
			// A2
			for(var j = 0; j < 3; ++j) vb.data[index + j] = A[j];
			index += 3;
			for(var j = 0; j < 3; ++j) vb.data[index + j] = N[j];
			index += 3;

			// B1 
			for(var j = 0; j < 3; ++j) vb.data[index + j] = B[j];
			index += 3;
			for(var j = 0; j < 3; ++j) vb.data[index + j] = -N[j];
			index += 3;

			// B2
			for(var j = 0; j < 3; ++j) vb.data[index + j] = B[j];
			index += 3;
			for(var j = 0; j < 3; ++j) vb.data[index + j] = N[j];

			index = (i-1) * 6;
			var b = (i-1) * 4;
			ib.data[index] = b + 0;
			ib.data[index+1] = b + 1;
			ib.data[index+2] = b + 3;
			ib.data[index+3] = b + 0;
			ib.data[index+4] = b + 3;
			ib.data[index+5] = b + 2;
		}

	    gb.mesh.update(m);
		gb.vec3.stack.index = stack;
	},
	//circle: function(r)

}