function Font()
{
    var r = {};
    r.name;
    r.atlas = null; //GL.LINEAR
    r.num_glyphs;
    r.glyhs;
    r.unicode_start;
    r.has_kerning;
    r.kerning;
    r.ascent;
    r.descent;
    r.space_advance;
    r.tab_advance;
    r.x_height;
    r.cap_height;
    return r;
}

function Glyph()
{
    var r = {};
    r.code_point = 0;
    r.uv;
    r.size;
    r.horizontal_bearing;
    r.vertical_bearing;
    r.advance;
    return r;
}

function Kerning_Table()
{
    var r = {};
    r.count;
    r.capacity;
    r.keys;
    r.values;
    r.max_tries;
    r.num_values;
    r.min_hash;
    r.max_hash;
    return r;
}

function Kern_Key()
{
    var r = {};
    r.code_point_a = 0;
    r.code_point_b = 0;
    r.key_index = 0;
    return r;
}

function get_glyph_metric(font, code_point)
{
    //str.codePointAt()
    //hash it
    //look it up
    //for now...
    
    var n = font.glyphs.length;
    for(var i = 0; i < n; ++i)
    {
        var g = font.glyphs[i];
        if(g.code_point === code_point) return g;
    }
    
    var character = String.fromCodePoint(code_point);
    console.warn('Could not find glyph: ' +  character + ' in ' + font.name);
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
