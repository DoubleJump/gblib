gb.Texture = function()
{
	this.id = 0;
	this.width;
	this.height;
	this.pixels;
	this.format;
	this.byte_size;
	this.mipmaps = 0;
	this.sampler;
	this.compressed = false;
}
gb.Sampler = function()
{
	this.x;
	this.y;
	this.up;
	this.down;
}
gb.new_sampler = function(x,y,up,down)
{
    var s = new gb.Sampler();
    s.x = x;
    s.y = y;
    s.up = up;
    s.down = down;
    return s;
}
gb.new_rgba_texture = function(width, height, pixels, sampler, mipmaps)
{
    var t = new gb.Texture();
    t.width = width;
    t.height = height;
    t.pixels = pixels;
    t.format = gb.webgl.ctx.RGBA;
    t.byte_size = gb.webgl.ctx.UNSIGNED_BYTE;
    t.mipmaps = mipmaps;
    t.sampler = sampler;
    return t;
}
gb.new_depth_texture = function(width, height)
{
    var t = new gb.Texture();
    t.width = width;
    t.height = height;
    t.pixels = null;
    t.format = gb.webgl.ctx.DEPTH_COMPONENT;
    t.byte_size = gb.webgl.ctx.UNSIGNED_SHORT;
    t.mipmaps = 0;
  	t.sampler = gb.webgl.default_sampler;
    return t;
}
gb.serialize.r_dds = function(br)
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

    return t;
}

gb.serialize.r_pvrtc = function(br)
{
	//https://developer.apple.com/library/ios/samplecode/PVRTextureLoader/Listings/Classes_PVRTexture_m.html#//apple_ref/doc/uid/DTS40008121-Classes_PVRTexture_m-DontLinkElementID_12

	var s = gb.serialize;
	var pvr = gb.webgl.extensions.pvr;
	var n = s.r_string(br);
	var header = new Uint32Array(br.buffer, br.offset, 13);
	var version = header[4] & 0xff;

	var PVRTC_2 = 24;
	var PVRTC_4 = 25;
	ASSERT(version === PVRTC_2 || version === PVRTC_4, "Unsupported PVRTC format");

	var t = new gb.Texture();
	t.height = header[1]
	t.width = header[2];
	t.mipmaps = header[3];

	var data_length = header[5];
	var block_size = 0;
	if(version === PVRTC_2)
	{
		block_size = 16;
		t.format = pvr.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
		t.byte_size = 2; 
	}
	else
	{
		 block_size = 24;
		 t.format = pvr.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
		 t.byte_size = 4;
	}

	br.offset += header[0];
	var size = header[5];
    t.pixels = new Uint8Array(br.buffer, br.offset, size);
    t.compressed = true;
    br.offset += size * bpp;

	gb.renderer.link_texture(t, gb.default_sampler);
    gb.textures[n] = t;
    return t;
}
