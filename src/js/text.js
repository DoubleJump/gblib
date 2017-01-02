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

function TextMesh(font, text, length)
{
    var r = Entity();
    r.font = font;
    r.color = Vec4(0.5,0.5,0.5,1);
    r.index = 0;
    r.size = 0.02;

    r.buffer = 0.11554385134588423;
    r.gamma = 0.18013594596044236;
    r.theta = 0.3419931999832623;
    r.zeta = 1.2979221000045087;

    r.last_line = 0;
    r.last_break = 0;
    r.pen_break = 0;
    r.px = 0;
    r.py = 0;
    r.line_width = 0.0;
    r.line_height = 0.24;
    r.letter_spacing = 0.0;
    r.width = 0;
    r.height = 0;
    r.vertical_alignment = TextVerticalAlignment.TOP;
    r.horizontal_alignment = TextHorizontalAlignment.LEFT;

    var attributes = 
    {
        position: VertexAttribute(2),
        uv: VertexAttribute(2),
        index: VertexAttribute(1)
    };

    var vb;
    if(text)
    {
        r.text = text;
        vb = VertexBuffer(null, attributes);
        alloc_vertex_buffer_memory(vb, text.length * 6);
        r.mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
        bind_mesh(r.mesh);
        update_text(r);
    }
    else
    {
        vb = VertexBuffer(null, attributes);
        alloc_vertex_buffer_memory(vb, length * 6);
        r.mesh = Mesh(vb, null, MeshLayout.TRIANGLES);
        bind_mesh(r.mesh);
    }

    return r;
}

function add_glyph(tm, str, index)
{
    var font = tm.font;
    var metric = font.glyphs;
    var glyph = str[index];

    var char_code = glyph.charCodeAt(0);
    var m = char_code * font.glyph_stride;
    //LOG(m);

    var scale = tm.size;

    var x  = metric[m+0];
    var y  = metric[m+1];
    var w  = font.grid_width * scale;
    var h  = w;
    var gw = metric[m+2] * scale;
    var gh = metric[m+3] * scale;
    var bx = metric[m+4] * scale; 
    var by = metric[m+5] * scale; 
    var ha = metric[m+6] * scale;

    var hh = h / 2;
    var hw = w / 2;

    var kerning = 0;
    if(index > 0)// && font.has_kerning === true)
    {
        kerning = get_kerning(font, str.charCodeAt(index-1), str.charCodeAt(index));
        //LOG(kerning);
        kerning *= scale;
    }

    var vb = tm.mesh.vertex_buffer;
    var d = vb.data;  
    var i = vb.offset;

    // uvs
    
    var px = x / font.atlas.width; //uvx
    var py = y / font.atlas.height; //uvy
    var pw = px + ((font.grid_width) / font.atlas.width);
    var ph = py + ((font.grid_width) / font.atlas.height);
    
    var cx = tm.px + bx + kerning + tm.letter_spacing + (gw / 2);
    var cy = (tm.py + by) - (gh / 2);
    var left   = cx - hw;
    var right  = cx + hw;
    var top    = cy + hh;
    var bottom = cy - hh;

    d[i+0] = left;
    d[i+1] = top;
    d[i+2] = px;
    d[i+3] = ph;
    d[i+4] = index;

    d[i+5] = left;
    d[i+6] = bottom;
    d[i+7] = px;
    d[i+8] = py;
    d[i+9] = index;
   
    d[i+10] = right;
    d[i+11] = bottom;
    d[i+12] = pw;
    d[i+13] = py;
    d[i+14] = index;

    d[i+15] = right;   
    d[i+16] = top;
    d[i+17] = pw;
    d[i+18] = ph;
    d[i+19] = index;

    d[i+20] = left; 
    d[i+21] = top;
    d[i+22] = px;
    d[i+23] = ph;
    d[i+24] = index;
   
    d[i+25] = right;
    d[i+26] = bottom;
    d[i+27] = pw;
    d[i+28] = py;
    d[i+29] = index;

    // TODO: switch to mesh indices as this is getting heavy

    vb.offset += 30;
    
    tm.px += ha + kerning;// + tm.letter_spacing;

    tm.width = right;
    /*
    var is_break = false;
    if(glyph === " ")
    {
        tm.last_break = i;
        tm.pen_break = tm.px;
        is_break = true;
    }

    // line break or last char then do line shift
    if(tm.line_width > 0)
    {
        if(((tm.px > tm.line_width) && is_break) || index === (tm.text.length - 1))
        {
            var offset = 0;
            switch(tm.horizontal_alignment)
            {
                case TextHorizontalAlignment.CENTER:
                {
                    offset = -right / 2;
                    break;
                }
                case TextHorizontalAlignment.RIGHT:
                {
                    offset = -right;
                    break;
                }
            }

            var line_start = tm.last_line;
            var line_end = i + 26; 
            for(var i = line_start; i < line_end; i += vb.stride) d[i] += offset;
        }

        // line breaks

        if((tm.px > tm.line_width) && is_break)
        {
            tm.width = right;

            var start = tm.last_break + vb.stride;
            var end = i + 26;
            var x_shift = -tm.pen_break;
            var y_shift = -tm.line_height;

            for(var i = start; i < end; i += vb.stride) 
            {
                d[i] += x_shift;
                d[i+1] += y_shift;
            }

            //go back to last break and adjust x and y

            tm.px += x_shift;
            tm.py += y_shift;
            tm.last_line = tm.last_break;
        }
        else if(tm.width < tm.line_width) tm.width = right;
    }
    else tm.width = right;

    tm.height = Math.abs(bottom);
    */
}

function reset_text(tm)
{
    clear_mesh_buffers(tm.mesh);

    tm.px = 0;
    tm.py = 0;
    tm.width = 0;
    tm.height = 0;
    tm.last_line = 0;
    tm.index = 0;
    tm.text = "";
}

function append_text(tm, str)
{
    tm.text += str;
    update_text(tm);
}

function set_text(tm, str)
{
    reset_text(tm);
    tm.text = str;
    update_text(tm); 
}

function update_text(tm)
{
    for(var i = tm.index; i < tm.text.length; ++i) add_glyph(tm, tm.text, i);
    tm.index = tm.text.length;

    var y_offset = 0;
    switch(tm.vertical_alignment)
    {
        case TextVerticalAlignment.CENTER:
        {
            y_offset = tm.height / 2;
            break;
        }
        case TextVerticalAlignment.BOTTOM:
        {
            y_offset = tm.height;
            break;
        }
    }

    var vb = tm.mesh.vertex_buffer;
    for(var i = 0; i < vb.data.length; i += vb.stride) vb.data[i+1] += y_offset; 

    update_mesh(tm.mesh);
}


function draw_text(text, shader, camera)
{
    // TODO: reduce this AMAP
    use_shader(shader);

    var mvp = _Mat4();
    mat4_mul(mvp, text.world_matrix, camera.view_projection);

    set_uniform('mvp', mvp);
    set_uniform('buffer', text.buffer);
    set_uniform('gamma', text.gamma);
    set_uniform('theta', text.theta);
    set_uniform('zeta', text.zeta);
    set_uniform('color', text.color);
    set_uniform('texture', text.font.atlas);

    draw_mesh(shader, text.mesh);

    mat4_stack.index--;
}