gb.Binary_Reader = function(buffer)
{
	this.buffer = buffer;
	this.bytes = new DataView(buffer);
	this.offset = 0;
}

gb.serialize =
{
	/*
	r_bytes: function(br, l)
	{
		var r = new Uint8Array(br.buffer, br.offset, l);
		br.offset += l;
		return r;
	},
	*/
	r_b32: function(br)
	{
		var r = br.bytes.getInt32(br.offset, true);
		br.offset += 4;
		if(r === 1) return true;
		return false;
	},
	r_i32: function(br)
	{
		var r = br.bytes.getInt32(br.offset, true);
		br.offset += 4;
		return r;
	},
	r_u32: function(br)
	{
		var r = br.bytes.getUint32(br.offset, true);
		br.offset += 4;
		return r;
	},
	r_f32: function(br)
	{
		var r = br.bytes.getFloat32(br.offset, true);
		br.offset += 4;
		return r;
	},
	r_string: function(br)
	{
		var _t = gb.serialize;
		var pad = _t.r_i32(br);
        var l = _t.r_i32(br);
    	var r = String.fromCharCode.apply(null, new Uint8Array(br.buffer, br.offset, l));
        br.offset += l;
        br.offset += pad;
        return r;
	},
	r_f32_array: function(br, l)
	{
		var r = new Float32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	r_u32_array: function(br, l)
	{
		var r = new Uint32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	r_i32_array: function(br, l)
	{
		var r = new Int32Array(br.buffer, br.offset, l);
		br.offset += l * 4;
		return r;
	},
	r_vec3: function(br)
	{
		var r = new Float32Array(br.buffer, br.offset, 3);
		br.offset += 12;
		return r;
	},
	r_vec4: function(br)
	{
		var r = new Float32Array(br.buffer, br.offset, 4);
		br.offset += 16;
		return r;
	},
	r_mat3: function(br)
	{
		var r = new Float32Array(br.buffer, br.offset, 9);
		br.offset += 36;
		return r;
	},
	r_mat4: function(br)
	{
		var r = new Float32Array(br.buffer, br.offset, 16);
		br.offset += 64;
		return r;
	},
}