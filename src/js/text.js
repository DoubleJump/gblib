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

function Text_Style(font)
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

function Text_Mesh(style, text, length)
{
    var r = Entity();
    r.entity_type = Entity_Type.TEXT;
    r.str = "";
    r.style = style;
    r.index = 0;
    r.index_start = 0;
    r.px = 0;
    r.py = 0;
    r.pz = 0;
    r.bounds = Vec4(0,0,4,0);
    r.last_white_space_index = 0;
    r.last_white_space_px = 0;
    r.last_white_space_advance = 0;
    r.last_line_index = 0;
    r.last_line_px = 0;

    var attributes = 
    {
        position: PositionAttribute(),
        uv: UVAttribute(),
        color: ColorAttribute(),
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
        append_text(r, text);     
    }

    return r;
}

function is_whitespace(char_code)
{
    return char_code === 32;
}

function push_glyph_vertex(vb, x,y,z,u,v, color, index)
{
    var i = vb.offset;
    var d = vb.data;

    d[i  ] = x;
    d[i+1] = y;
    d[i+2] = z;
    d[i+3] = u;
    d[i+4] = v;
    d[i+5] = color[0];
    d[i+6] = color[1];
    d[i+7] = color[2];
    d[i+8] = color[3];
    d[i+9] = index;

    vb.offset += 10;
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

    var glyph = get_glyph_metric(font, char_code);
    //var kerning = get_kerning(char_code, prev_code);
    var kerning = 0;

    //quad dimensions
    var hw = 16.0;
    var hh = hw;

    //console.log(glyph.horizontal_bearing[1])

    // uvs
    var px = glyph.uv[0];
    var py = glyph.uv[1];
    var pw = glyph.uv[2];
    var ph = glyph.uv[3];
    
    var cx = (tm.px + glyph.horizontal_bearing[0] + kerning + style.letter_spacing) + (glyph.size[0] / 2);
    var cy = (tm.py + glyph.horizontal_bearing[1]) - (glyph.size[1] / 2);
    var lft = cx - hw;
    var rht = cx + hw;
    var top = cy + hh;
    var btm = cy - hh;

    //var abs_btm = Math.abs(btm);
    //if(abs_btm > tm.height) tm.height = abs_btm;

    var vb = tm.mesh.vertex_buffer;
    push_glyph_vertex(vb, lft, btm, tm.pz, px,py, style.color, tm.index);
    push_glyph_vertex(vb, rht, btm, tm.pz, pw,py, style.color, tm.index);
    push_glyph_vertex(vb, lft, top, tm.pz, px,ph, style.color, tm.index);
    push_glyph_vertex(vb, rht, top, tm.pz, pw,ph, style.color, tm.index);
    push_glyph_triangle(tm.mesh.index_buffer);

    //var x_advance = glyph.advance[0]  style.letter_spacing;
    var x_advance = glyph.advance[0] + kerning + style.letter_spacing;

    /*
    if(is_whitespace(char_code)) 
    {
        tm.last_white_space_index = tm.index+1;
        tm.last_white_space_px = tm.px;
        tm.last_white_space_advance = x_advance;
    }
    */


    // if we are fixed bounds and we are outside those bounds with whitespace to break from
    /*
    if(tm.bounds[2] > 0 && 
       tm.px > tm.bounds[2] &&
       tm.last_white_space_index > tm.last_line_index)
    {
        tm.width = tm.bounds[2];

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
    */

    tm.px += x_advance;
    tm.index++;

    /*
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
        tm.width = Math.abs(tm.width - tm.bounds[0]);

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
    */
}

function reset_text(tm)
{
    clear_mesh_buffers(tm.mesh);

    tm.px = 0;
    tm.py = 0;
    tm.pz = 0;
    tm.width = 0;
    tm.height = 0;
    tm.index = 0;
    tm.index_start = 0;
    tm.last_white_space_index = 0;
    tm.last_white_space_px = 0;
    tm.last_white_space_advance = 0;
    tm.last_line_index = 0;
    tm.last_line_px = 0;
    set_vec4(tm.bounds, 0,0,0,0);
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
    update_mesh(tm.mesh)
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
    set_shader(shader);

    var mvp = _Mat4();
    mat4_mul(mvp, text.world_matrix, camera.view_projection);
    set_uniform('mvp', mvp);
    set_uniform('texture', text.style.font.atlas);

    draw_mesh(text.mesh);

    mat4_stack.index--;
}