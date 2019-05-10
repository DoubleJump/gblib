function read_ktx(ag)
{
	/*
	https://www.khronos.org/opengles/sdk/tools/KTX/file_format_spec/

	Byte[12] identifier
	UInt32 endianness
	UInt32 glType
	UInt32 glTypeSize
	UInt32 glFormat
	Uint32 glInternalFormat
	Uint32 glBaseInternalFormat
	UInt32 pixelWidth
	UInt32 pixelHeight
	UInt32 pixelDepth
	UInt32 numberOfArrayElements
	UInt32 numberOfFaces
	UInt32 numberOfMipmapLevels
	UInt32 bytesOfKeyValueData
	  
	for each keyValuePair that fits in bytesOfKeyValueData
	    UInt32   keyAndValueByteSize
	    Byte     keyAndValue[keyAndValueByteSize]
	    Byte     valuePadding[3 - ((keyAndValueByteSize + 3) % 4)]
	end
	  
	for each mipmap_level in numberOfMipmapLevels1
	    UInt32 imageSize; 
	    for each array_element in numberOfArrayElements2
	       for each face in numberOfFaces3
	           for each z_slice in pixelDepth2
	               for each row or row_of_blocks in pixelHeight2
	                   for each pixel or block_of_pixels in pixelWidth
	                       Byte data[format-specific-number-of-bytes]4
	                   end
	               end
	           end
	           Byte cubePadding[0-3]
	       end
	    end
	    Byte mipPadding[0-3]
	end
	*/

	var KTX_HEADER_LENGTH = 12 + (13*4);

	var file_size = read_i32();
	var name = read_string();
	var reader_offset = get_reader_offset();

	var identifier = read_u8(12);
	var header = read_u32(13);
	var width = header[5];
	var height = header[6];

	var num_mipmaps = header[11];
	var mipmaps = new Array(num_mipmaps);
	var data_offset = KTX_HEADER_LENGTH + header[12];
	var num_faces = header[10];

	var s_width = width;
	var s_height = height;
	for(var i = 0; i < num_mipmaps; ++i) 
	{
		var data_size = read_u32();

		for(var f = 0; f < num_faces; ++f)
		{
			reader_seek(reader_offset + data_offset);
			var data = read_bytes(data_size)
			mipmaps[i] = Mipmap(s_width, s_height, data);
			data_offset += data_size + 4;
			data_offset += 3 - ((data_size + 3) % 4);
		}
	}
	
	var t = Texture();
	t.width = width;
	t.heigh = height;
	t.num_mipmaps = num_mipmaps;
	t.data = mipmaps;
	t.format = TextureFormat.KTX;
	t.internal_format = header[5];
	t.compressed = true;
	t.flip = true;
	ag.Texture[name] = t;

	reader_seek(reader_offset + file_size);
}