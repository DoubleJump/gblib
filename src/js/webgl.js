//INCLUDE mesh.js
//INCLUDE mesh_tools.js
//INCLUDE texture.js
//INCLUDE shader.js
//INCLUDE render_target.js

gb.webgl = 
{
	extensions: 
	{
		depth_texture: null,
		dxt: null,
		pvr: null,
		fp_texture: null,
		uint: null,
	},
	ctx: null,
	m_offsets: null,
	view: null,
	default_sampler: null,
    screen_mesh: null,
    screen_shader: null,

	init: function(container, config)
	{
		var _t = gb.webgl;
		var gl;

		var width = container.offsetWidth * config.resolution;
        var height = container.offsetHeight * config.resolution;
        var canvas = gb.dom.insert('canvas', container);
        canvas.width = width;
        canvas.height = height;
        _t.view = gb.rect.new(0,0,width,height);

        try
        {
            gl = canvas.getContext('experimental-webgl', config);
            if(gl == null)
            {
                gl = canvas.getContext('webgl', config);
            }
        }
        catch(e)
        {
            console.error("Not WebGL compatible: " + e);
            return;
        }

        //DEBUG
        ASSERT(gl != null, "Could not load WebGL");
        gb.debug.get_context_info(gl);
        //END

		_t.ctx = gl;

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); //works with premultiplied alpha
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL); 
    	gl.clearDepth(1.0);
		
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CCW);
		gl.enable(gl.SCISSOR_TEST);
		gl.scissor(0,0, canvas.width, canvas.height);
		
        gl.viewport(0,0, canvas.width, canvas.height);
        gl.clearColor(0.0,0.0,0.0,0.0);
        //gl.colorMask(true, true, true, false);
    	//gl.clearStencil(0);
    	//gl.depthMask(true);
		//gl.depthRange(-100, 100); // znear zfar
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        _t.default_sampler = gb.texture.sampler(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);

		var ex = _t.extensions;
		ex.depth_texture = gl.getExtension("WEBGL_depth_texture");
		ex.dxt = gl.getExtension("WEBGL_compressed_texture_s3tc");
		//ex.pvr = gl.getExtension("WEBGL_compressed_texture_pvrtc");
		ex.pvr = gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
		ex.fp_texture = gl.getExtension("OES_texture_float");
		ex.uint = gl.getExtension("OES_element_index_uint");

		_t.screen_mesh = gb.mesh.generate.quad(2,2);
		_t.link_mesh(_t.screen_mesh);

        var v_src = "attribute vec3 position;\n attribute vec2 uv;\n varying vec2 _uv;\n void main()\n {\n _uv = uv;\n gl_Position = vec4(position, 1.0);\n }";
        var f_src = "precision mediump float;\n varying vec2 _uv;\n uniform sampler2D tex;\n void main()\n {\n gl_FragColor = texture2D(tex, _uv);\n }";

        _t.screen_shader = gb.shader.new(v_src, f_src);
        _t.link_shader(_t.screen_shader);
		_t.m_offsets = new Uint32Array(5);
	},

	link_mesh: function(m)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		m.vertex_buffer.id = gl.createBuffer();
		if(m.index_buffer)
			m.index_buffer.id = gl.createBuffer();
		_t.update_mesh(m);
	},
	update_mesh: function(m)
	{
		var gl = gb.webgl.ctx;
		gl.bindBuffer(gl.ARRAY_BUFFER, m.vertex_buffer.id);
		gl.bufferData(gl.ARRAY_BUFFER, m.vertex_buffer.data, m.vertex_buffer.update_mode);
		if(m.index_buffer)
		{
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.index_buffer.id);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.index_buffer.data, m.index_buffer.update_mode);
		}
		m.dirty = false;
	},
	delete_mesh: function(m)
	{
		var gl = gb.webgl.ctx;
		gl.deleteBuffer(m.vertex_buffer.id);
		if(mesh.index_buffer)
			gl.deleteBuffer(m.index_buffer.id);
		m = null;
	},

	link_shader: function(s)
	{
		var gl = gb.webgl.ctx;
		var vs = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vs, s.vertex_src);
	    gl.compileShader(vs);

	    //DEBUG
	    gb.debug.shader_compile_status(gl, vs);
	    //END

	    var fs = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.shaderSource(fs, s.fragment_src);
	    gl.compileShader(fs);

	    //DEBUG
	    gb.debug.shader_compile_status(gl, fs);
	    //END

	    var id = gl.createProgram();
	    gl.attachShader(id, vs);
	    gl.attachShader(id, fs);
	    gl.linkProgram(id);

	    //DEBUG
	    gb.debug.shader_link_status(gl, id);
	    //END

	    ASSERT(s.id === 0, "Shader already bound to id " + s.id); 
	    s.id = id;
	    s.num_attributes = gl.getProgramParameter(id, gl.ACTIVE_ATTRIBUTES);
	    s.num_uniforms = gl.getProgramParameter(id, gl.ACTIVE_UNIFORMS);

	    var c = 0;
	    var n = gb.vertex_attributes.length;
	    for(var i = 0; i < n; ++i)
	    {
	    	var attr = gb.vertex_attributes[i];
	    	var loc = gl.getAttribLocation(id, attr.name);
	    	if(loc !== -1) 
	    	{
	    		var sa = new gb.Shader_Attribute();
	    		sa.location = loc;
	    		sa.index = i;
	    		s.attributes[c] = sa;
	    		c++;
	    	}
	    }

	    for(var i = 0; i < s.num_uniforms; ++i)
	    {
	        var uniform = gl.getActiveUniform(id, i);
	        var location = gl.getUniformLocation(id, uniform.name);
	        s.uniforms[uniform.name] = location;
	    }

	    return s;
	},

	set_shader: function(s)
	{
		gb.webgl.ctx.useProgram(s.id);
	},
	
	link_texture: function(t)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		ASSERT(t.id === 0, "Texture is already bound to id " + t.id);
		t.id = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, t.id);
		_t.update_texture(t);
		_t.set_sampler(t.sampler);
	},

	set_sampler:function(s)
	{
		var gl = gb.webgl.ctx;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, s.x);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, s.y);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, s.up);
    	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, s.down);
	},
	
	update_texture: function(t)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;

		/*
		switch(t.format)
		{
			case _t.extensions.dxt.COMPRESSED_RGBA_S3TC_DXT1_EXT:
				gl.compressedTexImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.pixels);
			break;
			case _t.extensions.dxt.COMPRESSED_RGBA_S3TC_DXT5_EXT:
				gl.compressedTexImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.pixels);
			break;
			default:
				gl.texImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.format, t.byte_size, t.pixels);
			break;
		}
		*/
		if(t.compressed === true)
		{
			gl.compressedTexImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.pixels);
		}
		else
		{
			gl.texImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.format, t.byte_size, t.pixels);
		}

		if(t.mipmaps > 1) 
			gl.generateMipmap(gl.TEXTURE_2D);
	},

	set_viewport: function(v)
	{
		var gl = gb.webgl.ctx;
		gl.viewport(v.x, v.y, v.width, v.height);
		//scissor?
	},

	set_render_target: function(rt, clear)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		if(rt === null)
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
			_t.set_viewport(_t.view);
			if(clear === true)
			{
				_t.ctx.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			}
		}
		else
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, rt.frame_buffer);
			if(rt.depth)
			{
				gl.enable(gl.DEPTH_TEST);
			}
			if(rt.render_buffer)
				gl.bindRenderbuffer(gl.RENDERBUFFER, rt.render_buffer);
			_t.set_viewport(rt.bounds);

			if(clear === true)
			{
				_t.clear(rt);
			}
		}
	},

	set_render_target_attachment: function(rt, attachment, t)
	{
		var gl = gb.webgl.ctx;
		gl.bindTexture(gl.TEXTURE_2D, t.id);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, t.id, 0);
	},

	new_render_buffer: function(width, height)
	{
		var gl = gb.webgl.ctx;
		var rb = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
		return rb;
	},

	link_render_target: function(rt)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		rt.frame_buffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, rt.frame_buffer);

		if(rt.color)
		{
			_t.set_render_target_attachment(rt, gl.COLOR_ATTACHMENT0, rt.color);
		}
		if(rt.depth)
		{
			_t.set_render_target_attachment(rt, gl.DEPTH_ATTACHMENT, rt.depth);
		}
		else
		{
			rt.render_buffer = _t.new_render_buffer(rt.bounds.width, rt.bounds.height);
		}

		//DEBUG
		gb.debug.verify_render_target(gl);
		//END
	},

	clear: function(rt)
	{
		var gl = gb.webgl.ctx;
		var mode = 0;
		if(rt.color) mode |= gl.COLOR_BUFFER_BIT;
		if(rt.depth) mode |= gl.DEPTH_BUFFER_BIT;
		gl.clear(mode);
	},

	draw_mesh_elements: function(mesh)
	{
		var gl = gb.webgl.ctx;
        ASSERT(mesh.indices !== null, "Mesh has no index buffer");
    	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
        gl.drawElements(mesh.layout, mesh.index_count, gl.UNSIGNED_INT, 0);
	},

	draw_mesh_arrays: function(mesh)
	{
		gb.webgl.ctx.drawArrays(mesh.layout, 0, mesh.vertex_count);
	},
	
	link_attributes: function(shader, mesh)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var vb = mesh.vertex_buffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, vb.id);

		var stride = 0;
		var index = 1;
		for(var i = 0; i < 5; ++i)
		{
			var mr = (index & vb.mask) === index;
			_t.m_offsets[i] = stride;
			stride += mr * (gb.vertex_attributes[i].size * 4);
			index *= 2;
		}

		var offset = 0;
		for(var i = 0; i < shader.num_attributes; ++i)
		{
			var sa = shader.attributes[i];
			var attr = gb.vertex_attributes[sa.index]; 
			gl.enableVertexAttribArray(sa.location);
			gl.vertexAttribPointer(sa.location, attr.size, gl.FLOAT, attr.normalized, stride, _t.m_offsets[sa.index]);
		}
	},

	set_shader_texture: function(shader, name, texture, index)
	{
		var gl = gb.webgl.ctx;
		gl.bindTexture(gl.TEXTURE_2D, texture.id);
		gl.activeTexture(gl.TEXTURE0 + index);
		gl.uniform1i(shader.uniforms[name], texture.id);
	},
	set_shader_mat4: function(shader, name, m)
	{
		gb.webgl.ctx.uniformMatrix4fv(shader.uniforms[name], false, m);
	},
	set_shader_mat3: function(shader, name, m)
	{
		gb.webgl.ctx.uniformMatrix3fv(shader.uniforms[name], false, m);
	},
	set_shader_quat: function(shader, name, q)
	{
		gb.webgl.ctx.uniform4f(shader.uniforms[name], false, q[0], q[1], q[2], q[3]);
	},
	set_shader_color: function(shader, name, c)
	{
		gb.webgl.ctx.uniform4f(shader.uniforms[name], false, c[0], c[1], c[2], c[3]);
	},
	set_shader_vec3: function(shader, name, v)
	{
		gb.webgl.ctx.uniform3f(shader.uniforms[name], false, v[0], v[1], v[2]);
	},
	set_shader_vec2: function(shader, name, v)
	{
		gb.webgl.ctx.uniform2f(shader.uniforms[name], false, v[0], v[1]);
	},
	set_shader_float: function(shader, name, f)
	{
		gb.webgl.ctx.uniformf(shader.uniforms[name], false, f);
	},
	set_shader_int: function(shader, name, i)
	{
		gb.webgl.ctx.uniformi(shader.uniforms[name], false, i);
	},

	world_to_screen: function(r, camera, world, view)
    {
    	var wp = gb.vec3.tmp(); 
        gb.mat4.mul_projection(wp, camera.view_projection, world);
        r[0] = ((wp[0] + 1.0) / 2.0) * view.width;
        r[1] = ((1.0 - wp[1]) / 2.0) * view.height;
    },

    screen_to_view: function(r, point, view)
    {
        r[0] = point[0] / view.width;
        r[0] = 1.0 - (point[1] / view.height);
        r[2] = point[2];
        return r;
    },

    screen_to_world: function(r, camera, point, view)
    {
        var t = gb.vec3.tmp();
        t[0] = 2.0 * point[0] / view.width - 1.0;
        t[1] = -2.0 * point[1] / view.height + 1.0;
        t[2] = point[2];
            
        var inv = gb.mat4.tmp();
        gb.mat4.inverse(inv, camera.view_projection);
        gb.mat4.mul_projection(r, inv, t);
        //gb.mat4.mul_point(r, inv, t);
    },
}