gb.serialize.r_dds = function(t, br)
{
	// http://msdn.microsoft.com/en-us/library/bb943991.aspx/
	var s = gb.serialize;
	var dxt = gb.webgl.extensions.dxt;
    var DXT1 = 827611204;
   	var DXT5 = 894720068;

	var h = new Int32Array(br.buffer, br.offset, 31);

	ASSERT(h[0] === 0x20534444, "Invalid magic number in DDS header");
	ASSERT(!h[20] & 0x4, "Unsupported format, must contain a FourCC code");

	var t = new gb.Texture();
	t.name = s.r_string(br);
    t.height = h[3];
	t.width = h[4];
	
	var four_cc = h[21];
	ASSERT(four_cc === DXT1 || four_cc === DXT5, "Invalid FourCC code");
	
	var block_size = 0;
	switch(four_cc)
	{
		case DXT1:
			block_size = 8;
			t.format = dxt.COMPRESSED_RGBA_S3TC_DXT1_EXT;
			t.byte_size = dxt.UNSIGNED_BYTE;
		break;
		case DXT5:
			block_size = 16;
			t.format = dxt.COMPRESSED_RGBA_S3TC_DXT5_EXT;
			t.byte_size = dxt.UNSIGNED_SHORT;
		break;
	}
	
	var size = Math.max(4, t.width) / 4 * Math.max(4, t.height) / 4 * block_size;

	br.offset += h[1] + 4;
    t.pixels = new Uint8Array(br.buffer, br.offset, size);
    t.sampler = gb.webgl.default_sampler;
    t.compressed = true;

    if(h[2] & 0x20000) 
    {
        t.mipmaps = Math.max(1, h[7]);
    }
    br.offset += size;

    gb.webgl.link_texture(t);
    LOG("Loaded Texture: " + t.name);
    LOG("Width: " + t.width);
	LOG("Height: " + t.height);

    return t;
}