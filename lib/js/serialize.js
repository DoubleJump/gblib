gb.Binary_Reader = function(buffer)
{
	this.buffer = buffer;
	this.bytes = new DataView(buffer);
	this.offset = 0;
}

gb.binary_reader =
{
	b32: function(br)
	{
		var r = br.bytes.getInt32(br.offset, true);
		br.offset += 4;
		if(r === 1) return true;
		return false;
	},
	i32: function(br)
	{
		var r = br.bytes.getInt32(br.offset, true);
		br.offset += 4;
		return r;
	},
	u32: function(br)
	{
		var r = br.bytes.getUint32(br.offset, true);
		br.offset += 4;
		return r;
	},
	f32: function(br)
	{
		var r = br.bytes.getFloat32(br.offset, true);
		br.offset += 4;
		return r;
	},
	string: function(br)
	{
		var _t = gb.binary_reader;
		var pad = _t.i32(br);
        var l = _t.i32(br);
    	var r = String.fromCharCode.apply(null, new Uint8Array(br.buffer, br.offset, l));
        br.offset += l;
        br.offset += pad;
        return r;
	},
	f32_array: function(br, l)
	{
		var r = new Float32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	u8_array: function(br, l)
	{
		var r = new Uint8Array(br.buffer, br.offset, l);
		br.offset += l;
		return r;
	},
	u32_array: function(br, l)
	{
		var r = new Uint32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	i32_array: function(br, l)
	{
		var r = new Int32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	vec3: function(br)
	{
		return gb.binary_reader.f32_array(br, 3);
	},
	vec4: function(br)
	{
		return gb.binary_reader.f32_array(br, 4);
	},
	mat3: function(br)
	{
		return gb.binary_reader.f32_array(br, 9);
	},
	mat4: function(br)
	{
		return gb.binary_reader.f32_array(br, 16);
	},
}