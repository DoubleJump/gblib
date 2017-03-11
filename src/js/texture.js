var TextureFormat = 
{
	RGB: 0,
	RGBA: 1,
	DEPTH: 2,
	GRAYSCALE: 3,
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
	t.use_mipmaps = false;
	t.flip = flip || false;
	return t;
}

function load_texture_async(url, sampler, format, flip)
{
	var t = empty_texture(sampler, format);
	t.from_element = true;
	t.use_mipmaps = false;
	t.flip = flip || false;

	var name = url.match(/[^\\/]+$/)[0];
	name = name.split(".")[0];
    app.assets.textures[name] = t;

	var img = new Image();
    img.onload = function(e)
    {
    	t.width = img.width;
    	t.height = img.height;
    	t.data = img;
    	t.loaded = true;
    	bind_texture(t);
    	update_texture(t);
    }
	img.src = url;
}

function load_video_async(url, width, height, sampler, format, mute, autoplay)
{
	var t = empty_texture(sampler, format);
	t.from_element = true;
	t.use_mipmaps = false;
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
    var width = read_i32();
    var height = read_i32();
    var format = read_i32();
    var num_bytes = read_f64();
    var bytes = read_bytes(num_bytes);
    var encoding = 'data:image/' + type + ';base64,';

    var img = new Image();
    img.src = encoding + uint8_to_base64(bytes);

    var t = Texture(width, height, img, app.sampler, format, 4);
	t.from_element = true;
	t.use_mipmaps = false;
	t.flip = true;
	
	if(ag) ag.textures[name] = t;
    return t;
}