function read_dds(ag) 
{
	function four_CC_to_int32(v) 
	{
		return v.charCodeAt(0) + (v.charCodeAt(1) << 8) + (v.charCodeAt(2) << 16) + (v.charCodeAt(3) << 24); 
	}

	var file_size = read_i32();
	var name = read_string();
	var reader_offset = get_reader_offset();

	var header = read_i32(31);
	if(header[0] !== 0x20534444) console.error(' Invalid magic number in DDS header');
	if(!header[20] & 0x4) console.error('Unsupported format, must contain a FourCC code');
	
	var format;
	var bpp;
	var four_CC = header[21];

	var is_RGBA_uncompressed = false;
	switch(four_CC) 
	{
		case four_CC_to_int32("DXT1"):
			bpp = 8;
			format = TextureFormat.RGB_S3TC_DXT1;
		break;
		case four_CC_to_int32("DXT3"):
			bpp = 16;
			format = TextureFormat.RGBA_S3TC_DXT3;
		break;
		case four_CC_to_int32("DXT5"):
			bpp = 16;
			format = TextureFormat.RGBA_S3TC_DXT5;
		break;
		case four_CC_to_int32("ETC1"):
			bpp = 8;
			format = TextureFormat.RGB_ETC1;
		break;
		default:
			console.error('Unsupported DDS format');
		break;
	}

	var height = header[3];
	var width = header[4];
	var data;
	var data_size = 0;
	var data_offset = header[1] + 4;

	var mipmap_count = 1;
	if(header[2] & 0x20000) mipmap_count = Math.max(1, header[7]);
	var mipmaps = new Array(mipmap_count);
	
	var is_cubemap = false;
	var caps2 = header[28];
	if(caps2 & 0x200) is_cubemap = true;
	if(is_cubemap && (
		!(caps2 & 0x400) || !(caps2 & 0x800) || !(caps2 & 0x1000) || 
		!(caps2 & 0x2000) || !(caps2 & 0x4000) || !(caps2 & 0x8000)))
	{
		console.error('Incomplete cubemap faces');
	}

	var faces = 1;
	if(is_cubemap) faces = 6;
	for(var face = 0; face < faces; face++) 
	{
		var s_width = width;
		var s_height = height;
		for(var i = 0; i < mipmap_count; ++i) 
		{
			if(is_RGBA_uncompressed) data_size = s_width * s_height * 4;
			else data_size = Math.max(4, s_width) / 4 * Math.max(4, s_height) / 4 * bpp;
			
			reader_seek(reader_offset + data_offset);
			data = read_bytes(data_size)
			mipmaps[i] = Mipmap(s_width, s_height, data);

			data_offset += data_size;
			s_width = Math.max(s_width >> 1, 1);
			s_height = Math.max(s_height >> 1, 1);
		}
	}

	var sampler = default_sampler();
	var t = Texture(width, height, mipmaps, sampler, format, bpp);
	t.num_mipmaps = mipmap_count;
	t.compressed = true;
	t.flip = true;
	ag.textures[name] = t;

	reader_seek(reader_offset + file_size);
};