var TextureFormat = 
{
	RGBA: 0,
	DEPTH: 1,
	GRAYSCALE: 2,
}
function Sampler(s,t,up,down,anisotropy)
{
	var r = {};
	r.s = s;
	r.t = t;
	r.up = up;
	r.down = down;
	r.anisotropy = anisotropy;
	return r;
}
function default_sampler()
{
	return Sampler(GL.CLAMP_TO_EDGE, GL.CLAMP_TO_EDGE, GL.LINEAR, GL.LINEAR, 16);
}

function Texture(width, height, data, sampler, format, bytes_per_pixel)
{
	var t = {};
	t.id = null;
	//t.index = 0;
	t.data = data;
	t.format = format;
	t.width = width;
	t.height = height;
	t.bytes_per_pixel = bytes_per_pixel;
	t.compressed = false;
	t.from_element = false;
	t.sampler = sampler;
	t.flip = false;
	t.loaded = false;
	t.gl_releasable = false;
	return t;
}

function texture_from_dom(img, sampler, format, flip)
{
	format = format || TextureFormat.RGBA;
	var t = Texture(img.width, img.height, img, sampler, format, 4);
	t.from_element = true;
	t.use_mipmaps = false;
	t.flip = flip || false;
	return t;
}
function rgba_texture(width, height, pixels, sampler)
{
	var t = Texture(width, height, pixels, sampler, TextureFormat.RGBA, 4);
	return t;
}
function depth_texture(width, height, sampler)
{
	var t = Texture(width, height, null, sampler, TextureFormat.DEPTH, 4);
	return t;
}

function read_texture(type, ag)
{
    var name = read_string();
    var num_bytes = read_f64();
    var bytes = read_bytes(num_bytes);
    var img = new Image();

    var encoding = 'data:image/' + type + ';base64,';

    img.src = encoding + uint8_to_base64(bytes);

    var t = Texture(img.width, img.height, img, app.sampler, TextureFormat.RGBA, 4);
	t.from_element = true;
	t.use_mipmaps = false;
	t.flip = true;
	
	if(ag) ag.textures[name] = t;
    return t;
}