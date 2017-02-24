function Font()
{
    var r = {};
    r.name;
    r.atlas = null;
    r.unicode_start;
    r.unicode_end;
    r.num_glyphs;
    r.grid_width;
    r.glyph_stride;
    r.num_glyphs;
    r.has_kerning;
    r.num_kerning_values;
    r.max_tries;
    r.glyhs;
    return r;
}

function GlyphMetric()
{
    var r = {};
    r.x  = 0;
    r.y  = 0;
    r.w  = 0;
    r.h  = 0;
    r.bx = 0; 
    r.by = 0; 
    r.ha = 0;
    r.kerning = 0;
    //TODO: line height // r.va??
    return r;
}

function get_kerning(font, a,b)
{
    if(font.has_kerning === false) return 0;

    var result = 0;

    var h = 5381;
    h = ((h << 5) + h) + a;
    h = ((h << 5) + h) + b;
    h = h % font.kerning_table_size;
 
    var tries = font.num_tries;
    while(true)
    {
        if(tries === 0) break;
        tries--;

        var i = font.indices[h];
        if(i === -1) break; 

        if(font.a_keys[i] === a && font.b_keys[i] === b)
        {
            result = font.kerning[i];
            break;
        }

        h++;
    }

    return result;
}

function read_font(ag)
{
    var r = Font();
    r.name = read_string();
    r.unicode_start = read_i32();
    r.unicode_end = read_i32();
    r.num_glyphs = read_i32();
    r.grid_width = read_i32();
    r.glyph_stride = read_i32();
    r.glyphs = read_f32(r.num_glyphs * r.glyph_stride);

    r.has_kerning = read_boolean();
    if(r.has_kerning === true)
    {
        r.kerning_table_size = read_i32();
        r.num_kerning_values = read_i32();
        r.max_tries = read_i32();        
        r.indices = read_i32(r.kerning_table_size);
        r.a_keys = read_i32(r.num_kerning_values);
        r.b_keys = read_i32(r.num_kerning_values);
        r.kerning = read_f32(r.num_kerning_values);
    }

    r.atlas = read_texture('png');
    r.glyph_metric = GlyphMetric();

    if(ag) ag.fonts[r.name] = r;
    return r;
}