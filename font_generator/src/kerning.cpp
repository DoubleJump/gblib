static Kerning_Table
new_kerning_table(i32 size)
{
    Kerning_Table t = {};
    t.count = 0;
    t.capacity = size;
    t.keys = (Kern_Key*)malloc(sizeof(Kern_Key) * size);
    t.values = (f32*)malloc(sizeof(f32) * size);

    for(i32 i = 0; i < size; ++i) t.keys[i] = {0,0,-1};
    for(i32 i = 0; i < size; ++i) t.values[i] = 0.0f;

    return t;
}

static u32
djb_hash(u32 a, u32 b)
{
    u32 hash = 5381;
    hash = ((hash << 5) + hash) + a;
    hash = ((hash << 5) + hash) + b;
    return hash;
}

/*
static u32
murmur_hash(u32 a, u32 b)
{
    
}
*/

static void 
write_kerning(Kerning_Table* t, char a, char b, f32 value)
{
    u32 key = djb_hash(a,b) % t->capacity;

    //printf("%i %f\n", key,(f32)value);

    int tries = 0;
    while(true)
    {
        if(tries > 1000)
        {
            printf("Too many tries\n");
            break;
        }
        if(t->count >= t->capacity)
        {
            printf("Kerning Table Maxed Out\n");
            break;
        }
        if(key >= t->capacity)
        {
            //printf("Wrapping\n");
            key = 0;
        }

        if(t->keys[key].key == -1) //emtpy
        {
            t->keys[key].code_point_a = a;
            t->keys[key].code_point_b = b;
            t->keys[key].key = t->count;
            
            //printf("%i %i %i %f\n", a,b,t->count, value);

            t->values[t->count] = value;
            t->count++;
            break;
        }
        key++;
        tries++;

    }
    if(tries > t->max_tries) t->max_tries = tries;
}