/*
Desktop:
BC1(DXT1) - opaque
BC3(DXT5) - transparent
iOS:
PVR2, PVR4 - opaque or transparent
Android:
ETC1 - opaque
ASTC_4x4, ASTC8x8 - transparent
*/

var TextureFormat = 
{
	RGB: 0,
	RGBA: 1,
	DEPTH: 2,
	GRAYSCALE: 3,

	RGB_PVRTC_2BPPV1: 4,
	RGBA_PVRTC_2BPPV1: 5,
	RGB_PVRTC_4BPPV1: 6,
	RGBA_PVRTC_4BPPV1: 7,

	RGB_S3TC_DXT1: 8,
	RGBA_S3TC_DXT1: 9,
	RGBA_S3TC_DXT3: 10,
	RGBA_S3TC_DXT5: 11,
	RGB_ETC1: 12,

	KTX: 13,
};

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
	return Sampler(GL.CLAMP_TO_EDGE, GL.CLAMP_TO_EDGE, GL.LINEAR, GL.LINEAR, 1);
}

function repeat_sampler()
{
	return Sampler(GL.REPEAT, GL.REPEAT, GL.LINEAR, GL.LINEAR, 1);
}

function Mipmap(width, height, data)
{
	var r = {};
	r.width = width;
	r.height = height;
	r.data = data;
	return r;
}

function Texture(width, height, data, sampler, format, bytes_per_pixel)
{
	var t = {};
	t.id = null;
	t.data = data;
	t.format = format;
	t.internal_format = null;
	t.width = width;
	t.height = height;
	t.depth = null;
	t.bytes_per_pixel = bytes_per_pixel;
	t.compressed = false;
	t.from_element = false;
	t.sampler = sampler;
	t.flip = false;
	t.num_mipmaps = 1;
	t.cubemap = false;
	t.loaded = false;
	t.gl_releasable = false;
	return t;
}

function empty_texture(sampler, format)
{
	format = format || TextureFormat.RGBA;
	sampler = sampler || app.sampler;
	return Texture(0, 0, null, sampler, format, 4);
}

function texture_from_dom(img, sampler, format, flip)
{
	format = format || TextureFormat.RGBA;
	var t = Texture(img.width, img.height, img, sampler, format, 4);
	t.from_element = true;
	t.flip = flip || false;
	return t;
}

function load_texture_group(base_path, urls)
{
	var path = '';
	for(var u in urls)
	{
		if(base_path) path = base_path + urls[u];
		load_texture_async(path);
	}
}

function load_texture_async(url, ag, compressed)
{
	var t = empty_texture();
	//t.loaded = false;
	t.from_element = true;
	t.flip = true;
	t.compressed = compressed || false;

	var img = new Image();
    img.onload = function(e)
    {
    	t.width = img.width;
    	t.height = img.height;
    	t.data = img;
    	//t.loaded = true;

    	ag.load_count--;
    	update_load_progress(ag);
    }
	img.src = url;
	return t;
}

function load_video_async(url, width, height, sampler, format, mute, autoplay)
{
	var t = empty_texture(sampler, format);
	t.from_element = true;
	t.flip = false;

    var video = document.createElement('video');
    video.setAttribute('width', width);
    video.setAttribute('height', height);
    video.style.display = 'none';
    video.preload = 'auto';
    if(mute) video.muted = 'true';
    document.body.append(video); //shuts warnings up

	var name = url.match(/[^\\/]+$/)[0];
	name = name.split(".")[0];
    app.assets.textures[name] = t;

    video.addEventListener('canplaythrough', function()
    {
        t.width = video.width;
        t.height = video.height;
        t.data = video;
        t.loaded = true;
        bind_texture(t);
        update_texture(t);
    });
    
    video.src = url;
    if(autoplay) video.play();
    return t;
}

function rgba_texture(width, height, pixels, sampler)
{
	var t = Texture(width, height, pixels, sampler, TextureFormat.RGBA, 4);
	bind_texture(t);
	update_texture(t);
	return t;
}
function depth_texture(width, height, sampler)
{
	var t = Texture(width, height, null, sampler, TextureFormat.DEPTH, 8);
	bind_texture(t);
	update_texture(t);
	return t;
}

function resize_texture(t, w, h)
{
	t.width = w;
	t.height = h;
	update_texture(t);
}