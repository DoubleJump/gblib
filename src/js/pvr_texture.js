function read_pvr(ag) 
{
	var file_size = read_i32();
	var name = read_string();
	var header = read_u32(13);
	var reader_offset = get_reader_offset();

	var PVR_V3 = 0x03525650;
	var PVR_V2 = 0x21525650;
	var bpp;
	var format;
	var pixel_format;
	var height;
	var width;
	var num_surfs;
	var num_mipmaps;
	var data_offset;

	if(header[0] === PVR_V3) 
	{
		pixel_format = header[2];
		height = header[6];
		width = header[7];
		num_surfs = header[9];
		num_mipmaps = header[11];

		switch(pixel_format) 
		{
			case 0:
				bpp = 2;
				format = TextureFormat.RGB_PVRTC_2BPPV1;
			break;
			case 1:
				bpp = 2;
				format = TextureFormat.RGBA_PVRTC_2BPPV1;
			break;
			case 2:
				bpp = 4;
				format = TextureFormat.RGB_PVRTC_4BPPV1;
			break;
			case 3:
				bpp = 4;
				format = TextureFormat.RGBA_PVRTC_4BPPV1;
			break;
			default:
				console.error('Unsupported PVR format:', pixel_format);
		}

		data_offset = 52 + header[12];
	}
	else if(header[11] === PVR_V2) 
	{
		var flags = header[4];
		height = header[1];
		width = header[2];
		num_mipmaps = header[3];
		bpp = header[6];
		num_surfs = header[12];

		var PVRTC_2 = 24;
		var PVRTC_4 = 25;
		var format_flags = flags & 0xff;;

		var has_alpha = header[10] > 0;
		if(format_flags === PVRTC_4) 
		{
			bpp = 4;
			if(has_alpha) format = TextureFormat.RGBA_PVRTC_4BPPV1;
			else format = TextureFormat.RGB_PVRTC_4BPPV1;
		} 
		else if(format_flags === PVRTC_2) 
		{
			bpp = 2;
			if(has_alpha) format = TextureFormat.RGBA_PVRTC_2BPPV1;
			else format = TextureFormat.RGB_PVRTC_2BPPV1;
		}
		else console.error('Unknown PVRTC format');
		
		data_offset = header[0];
	}
	else console.error('Unknown PVR format');
	
	var data_size = 0;
	var block_width = 4;
	var block_height = 4;
	var width_blocks = 0;
	var height_blocks = 0;

	if(bpp === 2) block_width = 8;
	var block_size = (block_width * block_height) * bpp / 8;

	var mipmaps = new Array(num_mipmaps * num_surfs);
	var mip_level = 0;
	while(mip_level < num_mipmaps) 
	{
		var s_width = width >> mip_level;
		var s_height = height >> mip_level;
		var width_blocks = s_width / block_width;
		var height_blocks = s_height / block_height;

		if(width_blocks < 2) width_blocks = 2;
		if(height_blocks < 2) height_blocks = 2;

		data_size = width_blocks * height_blocks * block_size;
		for(var i = 0; i < num_surfs; ++i) 
		{
			reader_seek(reader_offset + data_offset);
			var data = read_bytes(data_size);
			var index = i * num_mipmaps + mip_level;
			mipmaps[index] = Mipmap(s_width, s_height, data);
			data_offset += data_size;
		}

		mip_level ++;
	}

	var sampler = default_sampler();
	var t = Texture(width, height, mipmaps, sampler, format, bpp);
	t.num_mipmaps = mipmap_count;
	t.compressed = true;
	ag.textures[name] = t;

	reader_seek(reader_offset + file_size);
};