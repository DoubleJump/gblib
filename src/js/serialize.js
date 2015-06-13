gb.Binary_Reader = function(buffer)
{
	this.buffer = buffer;
	this.bytes = new DataView(buffer);
	this.offset = 0;
}

gb.serialize =
{
	r_i32: function(br)
	{
		var r = br.bytes.getInt32(br.offset, true);
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
}

/*
	r_wav: function(br)
	{
		var s = gb.Searalize;
        var n = s.r_string(br);
		var header = new Uint32Array(br.buffer, br.offset, 13);
		var sound = new gb.Sound();
		sound.data = 
	},
	r_ogg: function(br)
	{
		var s = gb.Searalize;
        var n = s.r_string(br);
		var header = new Uint32Array(br.buffer, br.offset, 13);
		var sound = new gb.Sound();
		sound.data = 

	},
	*/