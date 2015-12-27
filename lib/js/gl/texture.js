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
	this.dirty = true;
	this.linked = false;
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
	new: function(w, h, pixels, sampler, format, byte_size, mipmaps, compressed)
	{
		var t = new gb.Texture();
		t.width = w;
		t.height = h;
		t.pixels = pixels;
		t.format = gb.webgl.ctx[format];
		t.byte_size = gb.webgl.ctx[byte_size];
		t.mipmaps = mipmaps || 0;
		t.sampler = sampler;
		t.compressed = compressed || false;
		gb.webgl.update_texture(t);
		return t;
	},
	rgba: function(w, h, pixels, sampler, mipmaps)
	{
		return gb.texture.new(w, h, pixels, sampler, 'RGBA', 'UNSIGNED_BYTE', mipmaps);
	},
	depth: function(w, h)
	{
		return gb.texture.new(w, h, null, gb.webgl.samplers.default, 'DEPTH_COMPONENT', 'UNSIGNED_SHORT', 0);
	},
}
gb.sampler = 
{
	new: function(x,y,up,down)
	{
		var s = new gb.Sampler();
	    s.x = x;
	    s.y = y;
	    s.up = up;
	    s.down = down;
	    return s;
	}
}