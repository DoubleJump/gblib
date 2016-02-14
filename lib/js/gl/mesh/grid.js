gb.mesh.grid = function(width, height, rows, cols)
{
    var x_step = width / cols;
    var y_step = height / rows;

    var vb = gb.vertex_buffer.new(width * height * 2);
    var ib = gb.index_buffer.new(rows * cols * 6);

    var i = 0;
    for(var x = 0; x < cols; ++x)
    {
        for(var y = 0; y < rows; ++y)
        {
            vb.data[i  ] = x * x_step;
            vb.data[i+1] = y * y_step;
            i+=2;
        }
    }

    gb.vertex_buffer.add_attribute(vb, 'position', 2);

    var num_triangles = rows * cols * 2;
    for(i = 0; i < num_triangles; ++i)
    {
        
    }

    return gb.mesh.new(vb, ib);
}