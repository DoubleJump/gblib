struct Out_Buffer
{
    u8* base;
    u8* current;
    memsize size;
};

static Out_Buffer
new_out_buffer(memsize size)
{
    Out_Buffer out; 
    out.base = (u8*)malloc(size);
    out.current = out.base;
    return out;
}

static void
write_bytes(Out_Buffer* ob, void* src, memsize size)
{
    auto sp = (u8*)src;
    auto dp = ob->current;
    for(auto i = 0; i < size; ++i)
    {
        *ob->current++ = *sp++;
    }
    ob->size += size;
}