gb.Sprite = function()
{
	this.start;
	this.end;
	this.playing;
	this.speed;
	this.frame;
	this.loop_count;
	this.rows;
	this.cols;
	this.entity;
}

gb.sprite = 
{
	new: function(texture, w, h)
	{
		var s = new gb.Sprite();
		s.start = 0;
		s.end = 0;
		s.playing = false;
		s.speed = 0;
		s.frame = 0;
		s.loop_count = 0;
		s.rows = gb.math.round(texture.width / w);
		s.cols = gb.math.round(texture.height / h);
		s.frame_skip = 0;
		s.frame_width = 1 / (texture.width / w); 
		s.frame_height = 1 / (texture.height / h);

		var e = new gb.Entity();
		e.mesh = gb.mesh.generate.quad(1,1);
		e.mesh.vertex_buffer.update_mode = gb.webgl.ctx.DYNAMIC_DRAW;
		s.entity = e;
		return s;
	},
	set_animation: function(s, start, end, speed, loops)
	{
		s.start = start;
		s.frame = start;
		s.end = end;
		s.speed = speed;
		s.loops = loops;
	},
	play: function(s)
	{
		s.playing = true;
		s.frame_skip = s.speed;
		s.frame = s.start;
	},
	update: function(s, dt)
	{
		if(s.playing === false) return;

		s.frame_skip -=1;
		if(s.frame_skip == 0)
		{
			s.frame++;
			s.frame_skip = s.speed;

			if(s.frame === s.end)
			{
				s.loop_count -= 1;
				if(s.loop_count === 0) // -1 = continuous loop
					s.playing = false;

				s.frame = s.start;
			}

			var ix = s.frame % s.cols;
			var iy = gb.math.floor(s.frame / s.cols);

			var x = ix * s.frame_width;
			var y = iy * s.frame_height;
			var w = x + s.frame_width;
			var h = y + s.frame_height;

			var pos = gb.mesh.get_stride(s.entity.mesh, 2); //3
			var stride = gb.mesh.get_stride(s.entity.mesh); //5
			var vb = s.entity.mesh.vertex_buffer.data;

			var i = pos;
			vb[  i] = x;
			vb[i+1] = h;

			i += stride;
			vb[  i] = w;
			vb[i+1] = h;

			i += stride;
			vb[  i] = x;
			vb[i+1] = y;

			i += stride;
			vb[  i] = w;
			vb[i+1] = y;

			s.entity.mesh.dirty = true;
		}
	},
}