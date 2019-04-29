#include "manifest.cpp"

using namespace msdfgen;

u32 read_utf8(const char* src, u32* result)
{
    if(!src) 
    {
        printf("nope!\n");
        return 0;
    }
    /*
    0xxx xxxx    A single-byte US-ASCII code (from the first 127 characters)
    110x xxxx    One more byte follows
    1110 xxxx    Two more bytes follow
    1111 0xxx    Three more bytes follow
    10xx xxxx    A continuation of one of the multi-byte characters
    */

    unsigned char byte = src[0];

    if(byte == 0U) 
    {
        //printf("0\n");
        return 0;
    }

    if(byte < 128U) 
    {
        *result = (u32)*src;
        //printf("1\n");
        return 1;
    }

    if(byte < 192U) 
    {
        //printf("too low\n");
        return 0;
    }

    if(byte < 224U) 
    {
        unsigned char b1 = src[1];

        if(b1 >= 128U && b1 < 192U)
        {
            *result = (((byte - 192U) << 6U) | b1-128U);
            //printf("2\n");
            return 2;
        }
        //printf("2 error\n");

        return 0;
    }

    if(byte < 240U) 
    {
        unsigned char b1 = src[1];
        unsigned char b2 = src[2];

        if(b1 >= 128U && b1 < 192U && b2 >= 128U && b2 < 192U) 
        {
            *result = ((byte-224U) << 12U)|((b1-128U) << 6U)|(b2-128U);
            //printf("3\n");
            return 3;
        }
        //printf("3 error\n");

        return 0;
    }

    if(byte < 248U) 
    {
        unsigned char b1 = src[1];
        unsigned char b2 = src[2];
        unsigned char b3 = src[3];

        if(b1 >= 128U && b1 < 192U && b2 >= 128U && b2 < 192U && b3 >= 128U && b3 < 192U) 
        {
            *result = ((byte-240U) << 18U)|((b1-128U) << 12U)|((b2-128U) << 6U)|(b3-128U); 
            //printf("4\n");
            return 4;
        }
        //printf("4 error\n");
        return 0;
    }

    if(byte < 252U) 
    {
        unsigned char b1 = src[1];
        unsigned char b2 = src[2];
        unsigned char b3 = src[3];
        unsigned char b4 = src[4];

        if(b1 >= 128U && b1 < 192U && b2 >= 128U && b2 < 192U && b3 >= 128U && b3 < 192U && b4 >= 128U && b4 < 192U) 
        {
            *result = ((byte-248U) << 24U)|((b1-128U) << 18U)|((b2-128U) << 12U)|((b3-128U) << 6U)|(b4-128U); 
            //printf("5\n");
            return 5;
        }
        //printf("5 error\n");
        return 0;
    }

    if(byte < 254U) 
    {
        unsigned char b1 = src[1];
        unsigned char b2 = src[2];
        unsigned char b3 = src[3];
        unsigned char b4 = src[4];
        unsigned char b5 = src[4];

      if (b1 >= 128U && b1 < 192U &&
          b2 >= 128U && b2 < 192U &&
          b3 >= 128U && b3 < 192U &&
          b4 >= 128U && b4 < 192U &&
          b5 >= 128U && b5 < 192U)
      {
          *result = ((byte - 252U)<<30U)|((b1-128U)<<24U)|((b2-128U)<<18U)|((b3-128U)<<12U)|((b4-128U)<<6U)|(b5 - 128U); 
      }
      //printf("6\n");
      return 6;
    }

    printf("errr\n");

    return 0;
}

i32 main(int argc, char* argv[]) 
{
    printf("Running...\n");

    /*
    if(argc != 2)
    {
        printf("%s %i\n", "Incorrect number of arguments: expected 2 got", argc-1);
        return -1;
    }
    */

    // READ CONFIG FILE

    /*
    {
        auto CONFIG_PATH = argv[1];
        FILE* file = fopen(CONFIG_PATH, "rb"); //UTF8 is binary
        if(!file)
        {
            printf("Could not open config file\n");
            return -1;
        }

        wchar_t line[256];
        for(i32 i = 0; i < 4; ++i)
        {
            wchar_t* got_line = fgetws(line, sizeof line, file);
            if(!got_line)
            {
                printf("%s\n", "No line");
                return -1;
            }
            wprintf(L"%s", got_line);
        }

        printf("\n");
        fclose(file);
    }
    */
    

    
    FT_Library library;
    i32 error = FT_Init_FreeType(&library);
    if(error) 
    {
        printf("Could not init Freetype\n");
        return -1;
    }

    // build dir relative

    auto SRC_PATH = "fonts/NotoSansCJKjp-Regular.otf";
    auto DST_PATH = "output/noto_jp.font";
    auto PNG_PATH = "output/noto_jp.png";
    auto characters = "こんにちはÇéâêîôûàèùëïü";
    
    printf("%s\n", SRC_PATH);
    printf("%s\n", DST_PATH);     
    printf("%s\n", PNG_PATH);     

    FT_Face face; 
    error = FT_New_Face(library, SRC_PATH, 0, &face);
    if(error) 
    {
        printf("Could not load font\n");
        return -1;
    }

    i32 buffer_width = 512;
    i32 buffer_height = 512;
    f32 inv_w = 1.0 / (f32)buffer_width;
    f32 inv_h = 1.0 / (f32)buffer_height;
    i32 pixel_width = 30;

    i32 num_glyphs = 0;//strlen(characters);
    const char* char_buffer = &characters[0];
    while(true)
    {
        u32 code_point = 0;
        u32 stride = read_utf8(char_buffer, &code_point);
        if(stride == 0) break;
        num_glyphs++;
        char_buffer += stride;
    }

    u32* utf_chars = (u32*)malloc(num_glyphs * sizeof(u32));
    int code_index = 0;
    char_buffer = &characters[0];
    while(true)
    {
        u32 code_point = 0;
        u32 stride = read_utf8(char_buffer, &code_point);
        if(stride == 0) break;
        utf_chars[code_index] = code_point;
        code_index++;
        char_buffer += stride;
    }

    
    
    f32 fixed_point_scale = 64.0;
    f32 range = 4.0;
    f32 scale = 2.0;
    f32 max_angle = 3.0;
    Vector2 translation = Vector2(0,0);
    
    Font font = {};
    font.num_glyphs = num_glyphs;
    font.ascent = face->size->metrics.ascender;
    font.descent = face->size->metrics.descender;

    Bitmap<FloatRGB> msdf(pixel_width, pixel_width);
    RGB* buffer = (RGB*)malloc(buffer_width * buffer_height * sizeof(RGB));
    Glyph* glyphs = (Glyph*)malloc(num_glyphs * sizeof(Glyph));

    
    i32 padding = 1;
    i32 px = padding;
    i32 py = padding;
    //i32 step_x = 32;
    //i32 step_y = 32;

    auto glyph = glyphs;

    b32 invert = true;

    for(i32 i = 0; i < num_glyphs; ++i)
    {
        int character = utf_chars[i];

        Shape shape;
        load_glyph(&shape, face, character);
   
        f64 l = 0;
        f64 b = 0;
        f64 r = 0;
        f64 t = 0;
        shape.bounds(l, b, r, t);

        Vector2 frame(pixel_width, pixel_width);
        l -= range; b -= range; r += range; t += range;
        if(l >= r || b >= t) 
        {
            l = 0; b = 0; r = 1; t = 1;
        }
        Vector2 dims(r-l, t-b);
        translation = 0.5 * (frame / scale - dims) - Vector2(l,b);

        //printf("%i", character);

        auto seed = 156168132;
        shape.normalize();
        edgeColoringSimple(shape, max_angle, seed);
        generateMSDF(msdf, shape, range, scale, translation);

        for(i32 y = 0; y < pixel_width; ++y)
        for(i32 x = 0; x < pixel_width; ++x)
        {
            i32 src = x + (y * pixel_width);
            i32 dst = (px + x) + ((py + y) * buffer_width);
            
            auto frgb = msdf.content[src];
            auto pixel = buffer + dst;

            pixel->r = clamp(i32(frgb.r*0x100), 0xff);
            pixel->g = clamp(i32(frgb.g*0x100), 0xff);
            pixel->b = clamp(i32(frgb.b*0x100), 0xff);
            
            if(invert)
            {
                pixel->r = 255 - pixel->r;
                pixel->g = 255 - pixel->g;
                pixel->b = 255 - pixel->b;
            }
        }


        auto gm = face->glyph->metrics;
        glyph->code_point = character;
        glyph->uv.x = (f32)px / (f32)buffer_width;
        glyph->uv.y = (f32)py / (f32)buffer_height;
        glyph->uv.z = glyph->uv.x + ((f32)pixel_width / (f32)buffer_width);
        glyph->uv.w = glyph->uv.y + ((f32)pixel_width / (f32)buffer_height);
        glyph->size.x = ((f32)gm.width / fixed_point_scale) * scale;
        glyph->size.y = ((f32)gm.height / fixed_point_scale) * scale;
        glyph->horizontal_bearing.x = ((f32)gm.horiBearingX / fixed_point_scale) * scale;
        glyph->horizontal_bearing.y = ((f32)gm.horiBearingY / fixed_point_scale) * scale;
        glyph->vertical_bearing.x = ((f32)gm.vertBearingX / fixed_point_scale) * scale;
        glyph->vertical_bearing.y = ((f32)gm.vertBearingY / fixed_point_scale) * scale;
        glyph->advance.x = ((f32)gm.horiAdvance / fixed_point_scale) * scale;
        glyph->advance.y = ((f32)gm.vertAdvance / fixed_point_scale) * scale;

        px += pixel_width + (padding * 2);
        if((px + (pixel_width + padding)) > buffer_width)
        {
            printf("\n");
            px = padding;
            py += pixel_width + (padding * 2);
            if(py > buffer_height)
            {
                printf("%s\n", "Too many characters to fit on image");
                return -1;
            }
        }

        glyph++;
    }

    auto white_space = get_font_whitespace_width(face);
    font.space_advance = (f32)white_space.space_advance * scale;
    font.tab_advance = (f32)white_space.tab_advance * scale;

    // KERNING
    
    b32 has_kerning = false;
    auto table = new_kerning_table(4096);
    {
        for(i32 a = 0; a < num_glyphs; ++a)
        for(i32 b = 0; b < num_glyphs; ++b)
        {
            auto code_point_a = characters[a];
            auto code_point_b = characters[b];

            f32 kerning = (f32)get_kerning(face, code_point_a, code_point_b) * scale;
            if(kerning == 0.0) continue; 
            has_kerning = true;
            //printf("Kerning: %f\n", kerning);
            write_kerning(&table, code_point_a, code_point_b, kerning);
        }
    }
    

    // WRITE PNG
    
    {
        auto error = lodepng_encode_file(PNG_PATH, (u8*)buffer, buffer_width, buffer_height,LCT_RGB, 8);
        if(error)
        {
            printf("Could not save png\n");
        }
    }
    
    printf("\n");
    printf("Num Glyphs: %u\n", font.num_glyphs);
    printf("Has kerning: %i\n", has_kerning);
    printf("Ascent: %f\n", font.ascent);
    printf("Descent: %f\n", font.descent);
    printf("Space advance: %f\n", font.space_advance);
    printf("Tab advance: %f\n", font.tab_advance);
    printf("X Height: %f\n", font.x_height);
    printf("Cap height: %f\n", font.cap_height);


    // POPULATE OUTPUT BUFFER

    auto out = new_out_buffer(MEGABYTES(4)); 
    write_bytes(&out, &font.num_glyphs, sizeof(u32));
    write_bytes(&out, glyphs, sizeof(Glyph) * num_glyphs);
    write_bytes(&out, &has_kerning, sizeof(i32));
    if(has_kerning)
    {
        printf("Writing kerning table...\n");
        write_bytes(&out, &table.count, sizeof(u32));
        write_bytes(&out, &table.capacity, sizeof(u32));
        write_bytes(&out, table.keys, sizeof(Kern_Key) * table.capacity);
        write_bytes(&out, table.values, sizeof(f32) * table.count);
        write_bytes(&out, &table.max_tries, sizeof(u32));
    }
    write_bytes(&out, &font.ascent, sizeof(f32));
    write_bytes(&out, &font.descent, sizeof(f32));
    write_bytes(&out, &font.space_advance, sizeof(f32));
    write_bytes(&out, &font.tab_advance, sizeof(f32));
    write_bytes(&out, &font.x_height, sizeof(f32));
    write_bytes(&out, &font.cap_height, sizeof(f32));
    
    // SAVE FONT FILE
    
    {
        FILE* file;
        file = fopen(DST_PATH, "wb+");
        if(!file)
        {
            printf("Could not save font file\n");
            return -1;
        }
        fwrite(out.base, out.size, 1, file);
        fclose(file);
    }
    

    FT_Done_Face(face);
    FT_Done_FreeType(library);

    free(buffer);
    free(glyphs);

    printf("\n");
    
    return 0;
}