gb.Sprite = function()
{
	this.start;
	this.end;
	this.playing;
	this.speed;
	this.t;
	this.texture;
	this.mesh;
	this.rect = gb.Rect();
}

gb.new_sprite = function(mesh, texture, cols, rows)
{
	var s = new gb.Sprite();
	s.start = 0;
	s.end = 0;
	s.playing = false;
	s.speed = 0;
	s.t = 0;
	s.texture = texture;
	s.mesh = mesh;
	var w = texture.width / cols;
	var h = texture.height / rows;
	gb.rect.set(s.rect, 0,0,w,h);
	return s;
}

gb.sprite = 
{
	set_texture: function(s, t, cols, rows)
	{
		var w = t.width / cols;
		var h = t.height / rows;
		gb.rect.set(0,0,w,h);
	},
	update: function(s, dt)
	{
		s.t += dt * s.speed;
		if(s.t > 1.0)
		{
			var w = s.width;
			s.x += w;
			if(s.x + w > s.texture.width) 
			{
				s.x = 0;
				s.y += s.height;
				if(s.y + s.height > s.texture.height)
				{
					s.y = 0;
				}
			}

			s.t = 0;
		}

		var vb = s.mesh.vertex_buffer.data;

		vb[4] = s.rect.x;
		vb[5] = s.rect.y;

		vb[9] = s.rect.x + s.rect.width;
		vb[10] = s.rect.y;

		vb[14] = s.rect.x;
		vb[15] = s.rect.y + s.rect.height;

		vb[19] = s.rect.x + s.rect.width;
		vb[20] = s.rect.y + s.rect.height;
	},
}