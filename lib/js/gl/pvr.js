gb.serialize.r_pvr = function(t, br)
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
