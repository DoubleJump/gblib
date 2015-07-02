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
	//this.mesh;
}

gb.new_sprite = function(texture, cols, rows)
{
	var s = new gb.Sprite();
	s.start = 0;
	s.end = 0;
	s.playing = false;
	s.speed = 0;
	s.frame = 0;
	s.loop_count = 0;
	s.rows = 0;
	s.cols = 0;
	s.frame_skip = 0;
	s.mesh = gb.mesh_tools.quad(1,1);
	s.mesh.vertex_buffer.update_mode = gb.webgl.ctx.DYNAMIC_DRAW;
	s.frame_width = (texture.width / cols) / texture.width; 
	s.frame_height= (texture.height / rows) / texture.height;
	return s;
}

gb.sprite = 
{
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
		if (!playing) return;

		s.frame_skip -=1 ;
		if(s.frame_skip == 0)
		{
			s.frame++;
			s.frame_skip = speed;

			if(s.frame == s.end)
			{
				s.loop_count -= 1;
				if(s.loop_count === 0) // -1 = continuous loop
					s.playing = false;

				s.frame = s.start;
			}

			var ix = s.frame % s.cols;
			var iy = s.frame / s.cols;

			var x = ix * s.frame_width;
			var y = iy * s.frame_height;
			var w = x + s.frame_width;
			var h = y + s.frame_height;

			var stride = gb.mesh.get_stride(s.mesh, 3);
			var vb = s.mesh.vertex_buffer.data;

			var i = stride;
			vb[i] = x;
			vb[i+1] = y;

			i += stride;
			vb[i] = w;
			vb[i+1] = y;

			i += stride;
			vb[i] = x;
			vb[i+1] = h;

			i += stride;
			vb[i] = w;
			vb[i+1] = h;
		}
	},
}