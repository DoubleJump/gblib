var TextHorizontalAlignment = 
{
    LEFT: 0,
    CENTER: 1,
    RIGHT: 2
};

var TextVerticalAlignment = 
{
    TOP: 0,
    CENTER: 1,
    BOTTOM: 2,
};

function TextStyle(font)
{
    var r = {};
    r.font = font;
    r.color = Vec4(0.5,0.5,0.5,1);
    r.size = 0.008;
    r.letter_spacing = 0;
    r.line_height = 0.4;
    r.vertical_alignment = TextVerticalAlignment.TOP;
    r.horizontal_alignment = TextHorizontalAlignment.LEFT;
    return r;
}

function TextMesh(style, text, length)
{
    var r = Entity();
    r.style = style;
    r.index = 0;
    r.index_start = 0;
    r.str = "";
    r.px = 0;
    r.py = 0;
    r.bounds = Vec4(0,0,4,0);
    r.last_white_space_index = 0;
    r.last_white_space_px = 0;
    r.last_white_space_advance = 0;
    r.last_line_index = 0;
    r.last_line_px = 0;

    var attributes = 
    {
        position: VertexAttribute(2),
        uv: VertexAttribute(2),
        color: VertexAttribute(4),
        index: VertexAttribute(1)
    };

    var vb = VertexBuffer(null, attributes);
    var ib = IndexBuffer(null);

    length = length || text.length;
    alloc_vertex_buffer_memory(vb, length * 4);
    alloc_index_buffer_memory(ib, length * 6);
    
    r.mesh = Mesh(vb, ib, MeshLayout.TRIANGLES);
    bind_mesh(r.mesh);

    if(text)
    {
        set_text_mesh(r, text);     
    }

    return r;
}

function get_glyph_metric(r, font, scale, char_code, prev_code)
{
    var i = (char_code - font.unicode_start) * font.glyph_stride;
    var m = font.glyphs;
    r.x  = m[i+0];
    r.y  = m[i+1];
    r.w  = m[i+2] * scale;
    r.h  = m[i+3] * scale;
    r.bx = m[i+4] * scale; 
    r.by = m[i+5] * scale; 
    r.ha = m[i+6] * scale;
    if(prev_code > 0) 
    {
        r.kerning = get_kerning(font, char_code, prev_code) * scale;
    }
    else r.kerning = 0;
}

function is_whitespace(char_code)
{
    return char_code === 32;
}

function push_glyph_vertex(vb, x,y,u,v, color, index)
{
    var i = vb.offset;
    var d = vb.data;

    d[i  ] = x;
    d[i+1] = y;
    d[i+2] = u;
    d[i+3] = v;
    d[i+4] = color[0];
    d[i+5] = color[1];
    d[i+6] = color[2];
    d[i+7] = color[3];
    d[i+8] = index;

    vb.offset += 9;
    vb.count = vb.offset;
}

function push_glyph_triangle(ib)
{
    var ti = ib.triangle_offset; 
    var d = ib.data;  
    var i = ib.offset;

    d[i  ] = ti + 0;
    d[i+1] = ti + 1;
    d[i+2] = ti + 3;
    d[i+3] = ti + 0;
    d[i+4] = ti + 3;
    d[i+5] = ti + 2;

    ib.offset += 6;
    ib.triangle_offset += 4;
    ib.count = ib.offset;
}

function add_glyph(tm, char_code, prev_code, is_last_glyph)
{
    var style = tm.style;
    var font = style.font;
    var scale = style.size;

    var glyph = font.glyph_metric;
    get_glyph_metric(glyph, font, scale, char_code, prev_code);

    //quad dimensions
    var hh = (font.grid_width * scale) / 2;
    var hw = hh;

    // uvs
    var px = glyph.x / font.atlas.width; 
    var py = glyph.y / font.atlas.height; 
    var pw = px + ((font.grid_width) / font.atlas.width);
    var ph = py + ((font.grid_width) / font.atlas.height);
    
    var cx = tm.px + glyph.bx + glyph.kerning + (glyph.w / 2) + style.letter_spacing;
    var cy = (tm.py + glyph.by) - (glyph.h / 2);
    var left   = cx - hw;
    var right  = cx + hw;
    var top    = cy + hh;
    var bottom = cy - hh;

    var abs_btm = Math.abs(bottom);
    if(abs_btm > tm.height) tm.height = abs_btm;

    var vb = tm.mesh.vertex_buffer;
    push_glyph_vertex(vb, left, bottom, px,py, style.color, tm.index);
    push_glyph_vertex(vb, right, bottom, pw,py, style.color, tm.index);
    push_glyph_vertex(vb, left, top, px,ph, style.color, tm.index);
    push_glyph_vertex(vb, right, top, pw,ph, style.color, tm.index);
    push_glyph_triangle(tm.mesh.index_buffer);

    var x_advance = glyph.ha + glyph.kerning + style.letter_spacing;

    if(is_whitespace(char_code)) 
    {
        tm.last_white_space_index = tm.index+1;
        tm.last_white_space_px = tm.px;
        tm.last_white_space_advance = x_advance;
    }


    // if we are fixed bounds and we are outside those bounds with whitespace to break from
    if(tm.bounds[2] > 0 && 
       tm.px > tm.bounds[2] &&
       tm.last_white_space_index > tm.last_line_index)
    {
        tm.width = tm.bounds[2] - tm.bounds[0];

        // first go back and h align the previous line
        var line_width = tm.last_white_space_px - tm.bounds[0];
        var x_offset = -line_width;
        var h_align = style.horizontal_alignment;
        
        if(h_align === TextHorizontalAlignment.CENTER) x_offset /= 2;
        else if(h_align === TextHorizontalAlignment.LEFT) x_offset = 0;

        var start = tm.last_line_index * (vb.stride * 4);
        var end = tm.last_white_space_index * (vb.stride * 4);

        for(var i = start; i < end; i += vb.stride) vb.data[i] += x_offset;

        // drop everything from the last_line_index to here down a line and shove to the left

        x_offset = -((tm.last_white_space_px + tm.last_white_space_advance) - tm.bounds[0]);
        var y_offset = -style.line_height;

        start = tm.last_white_space_index * (vb.stride * 4);
        end = (tm.index+1) * (vb.stride * 4);

        for(var i = start; i < end; i += vb.stride)
        {
            vb.data[i  ] += x_offset;
            vb.data[i+1] -= style.line_height;
        }

        tm.px += x_offset + x_advance;
        tm.py -= style.line_height;
        tm.last_line_index = tm.last_white_space_index;
        
    }
    else
    {
        tm.px += x_advance;
    }

    tm.index++;

    if(is_last_glyph === true)
    {
        var line_width = tm.px - tm.bounds[0];
        var x_offset = -line_width;
        var h_align = style.horizontal_alignment;
        
        if(h_align === TextHorizontalAlignment.CENTER) x_offset /= 2;
        else if(h_align === TextHorizontalAlignment.LEFT) x_offset = 0;

        var start = tm.last_line_index * (vb.stride * 4);
        var end = tm.index * (vb.stride * 4);

        for(var i = start; i < end; i += vb.stride)
        {
            vb.data[i] += x_offset;
        }

        var rhs = tm.px + x_advance;
        if(rhs > tm.width) tm.width = rhs;

        start = tm.index_start;
        var y_offset = tm.height;
        var v_align = style.vertical_alignment;

        if(v_align === TextVerticalAlignment.CENTER) y_offset /= 2;
        else if(v_align === TextVerticalAlignment.TOP) y_offset = 0;

        for(var i = start; i < end; i += vb.stride)
        {
            vb.data[i+1] += y_offset;
        }
    }
}

function reset_text(tm)
{
    clear_mesh_buffers(tm.mesh);

    tm.px = 0;
    tm.py = 0;
    tm.width = 0;
    tm.height = 0;
    tm.index = 0;
    tm.index_start = 0;
    tm.last_white_space_index = 0;
    tm.last_white_space_px = 0;
    tm.last_white_space_advance = 0;
    tm.last_line_index = 0;
    tm.last_line_px = 0;
    //tm.text = "";
}

function update_text_mesh(tm)
{
    update_mesh(tm.mesh);    
}

function set_text_mesh(tm, str)
{
    tm.str = str;
    reset_text(tm);
    append_text(tm, str);
}

function append_text(tm, str)
{
    var n = str.length;
    var prev_code = -1;
    for(var i = 0; i < n-1; ++i)
    {
        var char_code = str.charCodeAt(i);
        add_glyph(tm, char_code, prev_code, false);
        prev_code = char_code;
    }
    add_glyph(tm, str.charCodeAt(n-1), prev_code, true);
}


function draw_text(text, shader, camera)
{
    use_shader(shader);

    var mvp = _Mat4();
    mat4_mul(mvp, text.world_matrix, camera.view_projection);

    set_uniform('mvp', mvp);
    set_uniform('texture', text.style.font.atlas);

    draw_mesh(text.mesh);

    mat4_stack.index--;
}