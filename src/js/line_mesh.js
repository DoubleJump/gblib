function LineMesh(points)
{
	var m = {};
	m.stride = 2;
	m.num_points = 0;

	var attributes = 
	{
		position: VertexAttribute(m.stride),
		normal: VertexAttribute(m.stride),
		length: VertexAttribute(1),
		distance: VertexAttribute(1)
	};

	var vb = VertexBuffer(null, attributes, BufferUpdateRate.DYNAMIC);

	alloc_vertex_buffer_memory(vb, points * 2);

	m.mesh = Mesh(vb, null, MeshLayout.TRI_STRIP);
	m.thickness = 0.1;
	m.color = Vec4(0,0,0,1);
	m.index = 0;
	m.distance = 0;

	return m;
}

function add_line_point(lm, x,y)
{
	//LOG('Adding point: ' + x + ', ' + y);

	var flip = 1;
	var vb = lm.mesh.vertex_buffer;
	var d = vb.data;

	if(vb.count === vb.capacity)
	{
		vb.offset = 0;
		lm.num_points = 0;
		lm.index = 0;
	}

	var i = lm.index;

	//[cx,cy, nx,ny, f, d][cx,cy, nx,ny, f, d]
	//[cx,cy, nx,ny, f, d][cx,cy, nx,ny, f, d]
	//[cx,cy, nx,ny, f, d][cx,cy, nx,ny, f, d]

	var stack = vec3_stack.index;
	var previous = _Vec3();
	var current = _Vec3();
	var next = _Vec3();
	var dir = _Vec3();
	var perp = _Vec3();
	var tangent = _Vec3();
	var miter = _Vec3();

	var distance = 0;

	// PREVIOUS

	if(lm.num_points > 1) // third or more
	{
		// set the mitre normal for previous node

		set_vec3(previous, d[i-24], d[i-23]);
		set_vec3(current,  d[i-12], d[i-11]);
		set_vec3(next, x,y);

		var A = _Vec3();
		var B = _Vec3();

		vec_sub(A, current, previous);
		vec_sub(B, next, current);
		vec_normalized(A,A);
		vec_normalized(B,B);

		vec_add(tangent, A, B);
		vec_perp(perp, A);
		vec_perp(miter, tangent);

		var extra = 1 / vec_dot(miter, perp);
		vec_eq(dir, tangent);

		// set previous node normal

		d[i-10] =  miter[0] * extra;
		d[i-9]  =  miter[1] * extra;
		d[i-4]  = -miter[0] * extra;
		d[i-3]  = -miter[1] * extra;

		// set the direction for this node

		dir[0] = x - d[i-12];
		dir[1] = y - d[i-11];
		vec_normalized(dir, dir);
		vec_perp(perp, dir);

		d[i+2] = perp[0];
		d[i+3] = perp[1];

		distance = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
	}
	else if(lm.num_points > 0) // second point added
	{
		dir[0] = x - d[i-12];
		dir[1] = y - d[i-11];
		vec_normalized(dir, dir);
		vec_perp(perp, dir);

		d[i-8] =  perp[0];
		d[i-7] =  perp[1];
		d[i-3] = -perp[0];
		d[i-2] = -perp[1];
		
		// set current node normal

		d[i+2] = perp[0];
		d[i+3] = perp[1];

		distance = Math.sqrt(dir[0] * dir[0] + dir[1] * dir[1]);
	}

	// set current node position

	d[i  ] = x;
	d[i+1] = y;

	// set current node length

	d[i+4] = 1;

	// set current node distance

	lm.distance += distance;

	d[i+5] = lm.distance;

	// create a copy vertex and flip the direction

	d[i+6] =  d[i  ];
	d[i+7] =  d[i+1];
	d[i+8] = -d[i+2];
	d[i+9] = -d[i+3];
	d[i+10] = -d[i+4];
	d[i+11] = lm.distance;

	lm.index += 12;
	lm.num_points++;
	vb.count = lm.num_points * 2;

	if(lm.num_points > 2)
	{
		vb.offset = (lm.num_points * 2) - 4;
	}
	else vb.offset = 0;

	vec3_stack.index = stack;
}