#pragma pack(push, 1)
struct Kern_Key
{
    u32 code_point_a;
    u32 code_point_b;
    i32 key;
};
#pragma pack(pop)

#pragma pack(push, 1)
struct Glyph
{
    u32 code_point;
    Vec4 uv;
    Vec2 size;
    Vec2 horizontal_bearing;
    Vec2 vertical_bearing;
    Vec2 advance;
};
#pragma pack(pop)

#pragma pack(push, 1)
struct Font
{
    u32 num_glyphs;
    Glyph* glyphs;
    f32 ascent;
    f32 descent;
    f32 space_advance;
    f32 tab_advance;
    f32 x_height;
    f32 cap_height;
};
#pragma pack(pop)

#pragma pack(push, 1)
struct Kerning_Table
{
    i32 count;
    i32 capacity;
    Kern_Key* keys;
    f32* values;
    i32 max_tries;
    i32 num_values;
    i32 min_hash;
    i32 max_hash;
};
#pragma pack(pop)