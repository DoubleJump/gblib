function Img()
{
	var r = {};
	r.texture = null;
	r.offset = Vec3(0,0,0);
	r.size = Vec3(1, 1);
	r.color = Vec4(1,1,1,1);
	r.frame = Vec4(0,0,1,1);
	r.saturation = 1;
	r.brightness = 1;
	return r;
}

function load_images(GL, urls, container)
{
	var n = urls.length;
	app.image_load_count += n;
	for(var i = 0; i < n; ++i)
	{
		var url = urls[i];
		var name = url.substring(url.lastIndexOf("/") + 1, url.length);
		name = name.substring(0, (name.indexOf(".") == -1) ? name.length : name.indexOf("."));

		var t = Texture();
		t.sampler = app.sampler;
		t.format = TextureFormat.RGBA;
		t.bytes_per_pixel = 4;
		t.from_element = true;
		t.use_mipmaps = false;
		t.flip = true;
		container[name] = t;

		var img = new Image();
		img.name = name;

		img.onload = function(e)
		{
			var i = e.target;
			LOG(i.name);

			var tex = container[i.name];
			tex.width = i.width;
			tex.height = i.height;
			tex.data = i;
			bind_texture(GL, tex);
			tex.loaded = true;
			app.image_load_count--;
		}
		img.src = url;
	}
}

function unload_image_from_app(app, img)
{
	unbind_texture(app.GL, img);
	if(app.images[img.name]) app.images[img.name] = null
	img = null;
}


function draw_image(GL, e, img, surface, shader)
{
	var t = img.texture;
	//if(img.dirty)
	var ratio = 1;
	if(t.width > t.height)
	{
		 ratio = t.height / t.width;
		 set_vec4(img.frame, 0,0,ratio,1);
	}
	else 
	{
		ratio = t.width / t.height;
		set_vec4(img.frame, 0,0,1,ratio);
	}

	set_uniform(GL, shader.uniforms.model, e.world_matrix);
	set_uniform(GL, shader.uniforms.frame, img.frame);
	set_uniform(GL, shader.uniforms.offset, img.offset);
	set_uniform(GL, shader.uniforms.size, img.size);
	set_uniform(GL, shader.uniforms.tint, img.color);
	set_uniform(GL, shader.uniforms.saturation, img.saturation);
	set_uniform(GL, shader.uniforms.brightness, img.brightness);
	set_uniform(GL, shader.uniforms.texture, img.texture);
	
	draw_mesh(GL, shader, surface);
}