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

gb.texture = 
{
	sampler: function(x,y,up,down)
	{
		var s = new gb.Sampler();
	    s.x = x;
	    s.y = y;
	    s.up = up;
	    s.down = down;
	    return s;
	},
	rgba: function(width, height, pixels, sampler, mipmaps)
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
	},
	depth: function(width, height)
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
	},
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

gb.serialize.r_pvr = function(br)
{
	//https://developer.apple.com/library/ios/samplecode/PVRTextureLoader/Listings/Classes_PVRTexture_m.html#//apple_ref/doc/uid/DTS40008121-Classes_PVRTexture_m-DontLinkElementID_12

	var s = gb.serialize;
	var pvr = gb.webgl.extensions.pvr;

	var header = new Uint32Array(br.buffer, br.offset, 13);
	var header_size = header[12];
	
	var PVRTC_3 = 55727696;
	//var PVRTC_2 = 0x21525650;
	var version = header[0];

	ASSERT(version === PVRTC_3, "Unsupported PVRTC format");

	/*
	for(var i = 0; i < 13; ++i)
	{
		console.log("Header " + i + ": " + header[i]);
	}
	*/

	var t = new gb.Texture();
	t.width = header[7];
	t.height = header[6];
	t.mipmaps = header[11];

	var format = header[2];
	var block_width = 8;
	var block_height = 4;
	switch(format)
	{
		case 0:
			t.format = pvr.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
			t.byte_size = 2;
		break;
		case 1:
			t.format = pvr.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
			t.byte_size = 2;
		break;
		case 2:
			t.format = pvr.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
			t.byte_size = 4;
			block_width = 4;
		break;
		case 3:
			t.format = pvr.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
			t.byte_size = 4;
			block_width = 4;
		break;
	}

	var block_size = (block_width * block_height) * t.byte_size / 8;

	br.offset += header_size; //+52?

	var size = t.width * t.height;
	t.pixels = new Uint8Array(br.buffer, br.offset, 10);
	for(var i = 0; i < 10; ++i)
	{
		console.log(t.pixels[i]);
	}
    t.compressed = true;
    br.offset += size * t.byte_size;

	gb.renderer.link_texture(t, gb.default_sampler);
    gb.textures[n] = t;
    return t;
}
