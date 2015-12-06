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