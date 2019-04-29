#include "manifest.cpp"

b32 is_lower_case(i32 val)
{
    return (val > 96 && val < 123);
}

i32 main() 
{
    FT_Library library;
    i32 error = FT_Init_FreeType(&library);

    if(error)
    {
        printf("Could not initialize freetype\n");
        return -1;
    }
    //printf("Loaded freetype\n");

    // build dir relative
    //auto path = "Akrobat-Regular.otf";
    auto path = "Aldrich-Regular.ttf";

    FT_Face face; 
    error = FT_New_Face(library, path, 0, &face);

    /*
    if(error == FT_Err_Unknown_File_Format)
    {
        printf("Unrecognised file format\n");
        return -2;
    }
    else
    {
        printf("Coud not load font face\n");
        return -2;
    }
    */

    //printf("Num Glyphs: %i\n", (int)face->num_glyphs);

    
    i32 font_size = 42;
    i32 dpi = 72;
    error = FT_Set_Char_Size(face, font_size * 64, font_size * 64, dpi,dpi); 

    if(error)
    {
        printf("Could not set character size\n");
    }

    //printf("SUCCESS\n");

    /*
    i32 ascii_start = 0;
    i32 ascii_end = 128;
    f32 buffer_width = 512;
    f32 buffer_height = 512;
    f32 pixel_width = font_size;
    f32 pixel_height = font_size;
    f32 inv_scale = 1.0f / 64.0f;
    f32 inv_w = (1.0f / buffer_width);
    f32 inv_h = (1.0f / buffer_height);

    memsize num_pixels = buffer_width * buffer_height;
    u8* pixel_buffer = (u8*)malloc(sizeof(u8) * num_pixels);
    for(auto i = 0; i < num_pixels; i++)
    {
        pixel_buffer[i]  = 0;
    }

    Font font;
    font.num_glyphs = ascii_end - ascii_start;
    font.glyphs = (Glyph*)malloc(sizeof(Glyph) * font.num_glyphs);
    font.has_kerning = (face->face_flags & FT_FACE_FLAG_KERNING) == 1;
    font.num_kerning_pairs = 0;
    font.kerning_pairs = 0;
    font.aspect = buffer_width / buffer_height;
    font.ascent = face->size->metrics.ascender;// * inv_h * inv_scale;
    font.descent = face->size->metrics.descender;// * inv_h * inv_scale;
    font.row_height = face->height;// * inv_h * inv_w; //??
    font.x_height = 0;
    font.cap_height = 0;
    font.space_advance = 0;
    font.ix = 0;
    font.iy = 0;

    f32 px = 0;
    f32 py = 0;
    f32 padding = 1;
    */

    /*
    auto glyphs = font.glyphs;
    for(i32 i = ascii_start; i < ascii_end; ++i)
    {
        error = FT_Load_Char(face, i, FT_LOAD_RENDER);
        if(error)
        {
            printf("Could not load glyph: %i\n", i);
        }

        auto glyph = face->glyph->metrics;
        glyphs->flags = is_lower_case(i);
        glyphs->code_point = i;
        glyphs->bounds.x = px * inv_w;
        glyphs->bounds.y = py * inv_h;
        glyphs->bounds.z = glyphs->bounds.x + ((px + (f32)glyph.width) * inv_w * inv_scale);
        glyphs->bounds.w = glyphs->bounds.y + ((py + (f32)glyph.height) * inv_h * inv_scale);
        glyphs->bearing.x = (f32)glyph.horiBearingX * inv_w * inv_scale;
        glyphs->bearing.y = (f32)glyph.horiBearingY * inv_h * inv_scale;
        glyphs->advance.x = (f32)glyph.horiAdvance * inv_w * inv_scale;
        glyphs->advance.y = (f32)glyph.vertAdvance * inv_h * inv_scale;


        if(i == 32)
        {
            font.space_advance = (f32)glyph.horiAdvance * inv_w * inv_scale;
        }
        if(i == 120) //'x'
        {
            font.x_height = (f32)glyph.height;// * inv_h * inv_scale;
        }
        if(i == 72) //'H'
        {
            font.cap_height = (f32)glyph.height;// * inv_h * inv_scale;
        }

        auto bitmap = face->glyph->bitmap;

        u32 width = bitmap.width;
        u32 height = bitmap.rows;
        u32 pitch = bitmap.pitch;

        if(width && height && pitch)
        {
            auto dst = pixel_buffer;
            auto src = bitmap.buffer;
            for(u32 x = 0; x < width; x++)
            for(u32 y = 0; y < height; y++)
            {
                u32 dst_index = (py + y) * buffer_width + (px + x);
                u32 src_index = y * pitch + x;
                dst[dst_index] = src[src_index];
            }
        }
        else
        {
            glyphs->bounds = {0,0,0,0};
        }

        //printf("W:%f H:%f \n", glyphs->advance.x, glyphs->advance.y);

        
	 	px += pixel_width + padding;
	    if((px + (pixel_width + padding)) >= buffer_width)
	    {
	    	//printf("\n");
	    	px = padding;
	    	py += pixel_height + padding;
	    }

        glyphs++;
    }
    */
    //TODO: kerning

    /*
    error = lodepng_encode_file("build/font.png", pixel_buffer, buffer_width, buffer_height,LCT_GREY, 8);
    if(error)
    {
        printf("Could not save png\n");
    }
    */

    /*
    FILE* file;
    file = fopen("build/font.font", "wb+");

    if(!file)
    {
        printf("Could not save font file\n");
        return -1;
    }
    */

    /*
    printf("Aspect: %f\n", font.aspect);
    printf("Ascent: %f\n", font.ascent);
    printf("Descent: %f\n", font.descent);
    printf("Row Height: %f\n", font.row_height);
    printf("X Height: %f\n", font.x_height);
    printf("Cap height: %f\n", font.cap_height);
    printf("Space Advacne: %f\n", font.space_advance);
    printf("ix: %f\n", font.ix);
    printf("iy: %f\n", font.iy);
    */

    /*
    auto fptr = file;
    fwrite(&font.num_glyphs, sizeof(u32), 1, file);
    fwrite(font.glyphs, sizeof(Glyph), font.num_glyphs, file);
    
    // fwrite(&font.has_kerning, sizeof(b32), 1, file);
    // fwrite(&font.num_kerning_pairs, sizeof(u32), 1, file);
    // if(font.num_kerning_pairs > 0)
    // {
    //     fwrite(font.kerning_pairs, sizeof(Kerning_Pair), font.num_kerning_pairs, file);
    // }
    
    fwrite(&font.aspect, sizeof(f32), 1, file);
    fwrite(&font.ascent, sizeof(f32), 1, file);
    fwrite(&font.descent, sizeof(f32), 1, file);
    fwrite(&font.row_height, sizeof(f32), 1, file);
    fwrite(&font.x_height, sizeof(f32), 1, file);
    fwrite(&font.cap_height, sizeof(f32), 1, file);
    fwrite(&font.space_advance, sizeof(f32), 1, file);
    fwrite(&font.ix, sizeof(f32), 1, file);
    fwrite(&font.iy, sizeof(f32), 1, file);

    fclose(file);

    FT_Done_Face(face);
    //FT_Done_Library(library);
    */


    return 0;
}

