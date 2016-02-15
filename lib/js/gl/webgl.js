gb.webgl = 
{
	blend_mode:
	{
		DEFAULT: 0,
		DARKEN: 1,
		LIGHTEN: 2,
		DIFFERENCE: 3,
		MULTIPLY: 4,
		SCREEN: 5,
	},
	types:
	{
        0x8B50: 'FLOAT_VEC2',
        0x8B51: 'FLOAT_VEC3',
        0x8B52: 'FLOAT_VEC4',
        0x8B53: 'INT_VEC2',
        0x8B54: 'INT_VEC3',
        0x8B55: 'INT_VEC4',
        0x8B56: 'BOOL',
        0x8B57: 'BOOL_VEC2',
        0x8B58: 'BOOL_VEC3',
        0x8B59: 'BOOL_VEC4',
        0x8B5A: 'FLOAT_MAT2',
        0x8B5B: 'FLOAT_MAT3',
        0x8B5C: 'FLOAT_MAT4',
        0x8B5E: 'SAMPLER_2D',
        0x8B60: 'SAMPLER_CUBE',
        0x1400: 'BYTE',
        0x1401: 'UNSIGNED_BYTE',
        0x1402: 'SHORT',
        0x1403: 'UNSIGNED_SHORT',
        0x1404: 'INT',
        0x1405: 'UNSIGNED_INT',
        0x1406: 'FLOAT',
    },
    config: 
    {
    	fill_container: false,
		width: 512,
		height: 512,
		resolution: 1,
		alpha: false,
	    depth: true,
	    stencil: false,
	    antialias: true,
	    premultipliedAlpha: false,
	    preserveDrawingBuffer: false,
	    preferLowPowerToHighPerformance: false,
	    failIfMajorPerformanceCaveat: false,
	    extensions: ['WEBGL_depth_texture', 
					 'WEBGL_compressed_texture_s3tc',
					 'WEBKIT_WEBGL_compressed_texture_pvrtc',
					 'OES_standard_derivatives',
					 'OES_texture_float',
					 'OES_element_index_uint'],
	},
	canvas: null,
	extensions: {},
	ctx: null,
	view: null,
	aspect: 1.0,
	samplers: {},
	attributes: null,

	init: function(config)
	{
		var _t = gb.webgl;
		var gl;

		for(var k in config)
			_t.config[k] = config[k];

		var width = 0;
		var height = 0;
		if(_t.config.fill_container === true)
		{
			width = _t.config.container.offsetWidth * _t.config.resolution;
        	height = _t.config.container.offsetHeight * _t.config.resolution;
		}
		else
		{
        	width = _t.config.width * _t.config.resolution;
			height = _t.config.height * _t.config.resolution;
		}

		var canvas = document.createElement('canvas');
        config.container.appendChild(canvas);
        canvas.width = width;
        canvas.height = height;
        _t.view = gb.rect.new(0,0,width,height);

        gl = canvas.getContext('webgl', _t.config);
        _t.canvas = canvas;

        //DEBUG
        ASSERT(EXISTS(gl), "Could not load WebGL");
        //_t.get_context_info(gl);
        //END

		_t.ctx = gl;

		_t.attributes = gl.getContextAttributes();

        gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL); 
    	gl.clearDepth(1.0);
		
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CCW);
		gl.enable(gl.SCISSOR_TEST);

		_t.set_viewport(_t.view);

		//gl.clearColor(1.0,0.0,0.0,1.0);
        //gl.colorMask(true, true, true, false);
    	//gl.clearStencil(0);
    	//gl.depthMask(true);
		//gl.depthRange(-100, 100); // znear zfar
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        _t.samplers.default = gb.sampler.new(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.NEAREST, gl.NEAREST);
        _t.samplers.linear = gb.sampler.new(gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR);
        _t.samplers.repeat_x = gb.sampler.new(gl.WRAP, gl.CLAMP_TO_EDGE, gl.LINEAR, gl.LINEAR);
        _t.samplers.repeat_y = gb.sampler.new(gl.CLAMP_TO_EDGE, gl.WRAP, gl.LINEAR, gl.LINEAR);
        _t.samplers.repeat = gb.sampler.new(gl.WRAP, gl.WRAP, gl.LINEAR, gl.LINEAR);

		for(var i = 0; i < _t.config.extensions.length; ++i)
		{
			var extension = _t.config.extensions[i];
			_t.extensions[extension] = gl.getExtension(extension);
			//DEBUG
			if(_t.extensions[extension] === null)
				LOG('Extension: ' + extension + ' is not supported');
			//
		}
	},

	set_clear_color: function(r,g,b,a)
	{
		gb.webgl.ctx.clearColor(r,g,b,a);
	},

	update_mesh: function(m)
	{
		var gl = gb.webgl.ctx;
		
		if(m.linked === false)
		{
			m.vertex_buffer.id = gl.createBuffer();
			if(m.index_buffer) m.index_buffer.id = gl.createBuffer();
			m.linked = true;
		}

		gl.bindBuffer(gl.ARRAY_BUFFER, m.vertex_buffer.id);
		gl.bufferData(gl.ARRAY_BUFFER, m.vertex_buffer.data, m.update_mode);
		//gl.bufferSubData
		if(m.index_buffer)
		{
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.index_buffer.id);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.index_buffer.data, m.update_mode);
		}
	},
	delete_mesh: function(m)
	{
		var gl = gb.webgl.ctx;
		gl.deleteBuffer(m.vertex_buffer.id);
		if(mesh.index_buffer) gl.deleteBuffer(m.index_buffer.id);
	},

	link_shader: function(s)
	{
		ASSERT(s.linked === false, 'Shader is already linked');

		var _t = gb.webgl;
		var gl = _t.ctx;
		var vs = gl.createShader(gl.VERTEX_SHADER);
	    gl.shaderSource(vs, s.vertex_src);
	    gl.compileShader(vs);

	    //DEBUG
	    _t.shader_compile_status(vs);
	    //END

	    var fs = gl.createShader(gl.FRAGMENT_SHADER);
	    gl.shaderSource(fs, s.fragment_src);
	    gl.compileShader(fs);

	    //DEBUG
	    _t.shader_compile_status(fs);
	    //END

	    var id = gl.createProgram();
	    gl.attachShader(id, vs);
	    gl.attachShader(id, fs);
	    gl.linkProgram(id);

	    //DEBUG
	    _t.shader_link_status(id);
	    //END

	    ASSERT(s.id === 0, "Shader already bound to id " + s.id); 
	    s.id = id;
	    s.vs = vs;
	    s.fs = fs;
	    s.num_attributes = gl.getProgramParameter(id, gl.ACTIVE_ATTRIBUTES);
	    s.num_uniforms = gl.getProgramParameter(id, gl.ACTIVE_UNIFORMS);

	    for(var i = 0; i < s.num_attributes; ++i)
		{
			var attr = gl.getActiveAttrib(s.id, i);
			var sa = new gb.ShaderAttribute();
			sa.location = gl.getAttribLocation(id, attr.name);
			sa.size = attr.size;
			sa.type = attr.type;
			s.attributes[attr.name] = sa;
		}

	    var sampler_index = 0;
	    for(var i = 0; i < s.num_uniforms; ++i)
	    {
	        var uniform = gl.getActiveUniform(id, i);
	        var su = new gb.ShaderUniform();
	        su.location = gl.getUniformLocation(id, uniform.name);
	        su.type = _t.types[uniform.type];
	        if(su.type === 'SAMPLER_2D')
	        {
	        	su.sampler_index = sampler_index;
	        	sampler_index++;
	        }
	        su.size = uniform.size;
	        s.uniforms[uniform.name] = su;
	    }

	    s.linked = true;
	    return s;
	},
	use_shader: function(s)
	{
		gb.webgl.ctx.useProgram(s.id);
	},
	delete_shader: function(s)
	{
		var gl = gb.webgl.ctx;
		ASSERT(gl.getParameter(gl.CURRENT_PROGRAM) !== s.id, 'Cannot delete shader as it is in use');
	    gl.detachShader(s.vs);
	    gl.detachShader(s.fs);
	    gl.deleteShader(s.vs);
	    gl.deleteShader(s.fs);
	    gl.deleteProgram(s.id);
	},

	set_state: function(val, state)
	{
		if(state === true) gb.webgl.ctx.enable(val);
		else gb.webgl.ctx.disable(val);
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

		if(t.linked === false)
		{
			t.id = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, t.id);
			t.linked = true;
		}

		ASSERT(t.dirty === true, 'Texture already updated');

		_t.set_sampler(t.sampler);

		if(t.compressed === true)
		{
			gl.compressedTexImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.pixels);
		}
		else
		{
			gl.texImage2D(gl.TEXTURE_2D, 0, t.format, t.width, t.height, 0, t.format, t.byte_size, t.pixels);
		}
		if(t.mipmaps > 1) 
		{
			//gl.hint(gl.GENERATE_MIPMAP_HINT, t.mipmap_hint) gl.FASTEST, NICEST, DONT_CARE
			gl.generateMipmap(gl.TEXTURE_2D);
		}

		t.dirty = false;
	},
	delete_texture: function(t)
	{
		gb.webgl.ctx.deleteTexture(t.id);
	},

	set_viewport: function(v)
	{
		var gl = gb.webgl.ctx;
		gl.viewport(v.x, v.y, v.width, v.height);
		gl.scissor(v.x, v.y, v.width, v.height);
		gb.webgl.aspect = v.width / v.height;
	},

	use_alpha_blending: function(state)
	{
		gb.webgl.set_state(gl.webgl.ctx.BLEND, state);
	},
	set_blend_mode: function(mode)
	{
		// sourceColor * sourceFactor + destinationClor * destinationFactor

		var _t = gb.webgl;
		var gl = _t.ctx;
		switch(mode)
		{
			case _t.blend_mode.DARKEN:
			{
				gl.blendEquation(gl.FUNC_SUBTRACT);
				gl.blendFunc(gl.ONE, gl.ONE);
				break;
			}
			case _t.blend_mode.LIGHTEN:
			{
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.ONE, gl.ONE);
				break;
			}
			case _t.blend_mode.DIFFERENCE:
			{
				gl.blendEquation(gl.FUNC_SUBTRACT);
				gl.blendFunc(gl.ONE, gl.ONE);
				break;
			}
			case _t.blend_mode.MULTIPLY:
			{
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.DST_COLOR, gl.ZERO);
				break;
			}
			case _t.blend_mode.SCREEN:
			{
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.MINUS_DST_COLOR, gl.ONE);
				break;
			}
			default:
			{
				gl.blendEquation(gl.FUNC_ADD);
				gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
				break;
			}
		}
	},

	new_render_buffer: function(width, height)
	{
		var gl = gb.webgl.ctx;
		var rb = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, rb);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
		return rb;
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
			if(clear === true) _t.ctx.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}
		else
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, rt.frame_buffer);
			gl.bindRenderbuffer(gl.RENDERBUFFER, rt.render_buffer);
			_t.set_viewport(rt.bounds);
			if(clear === true)
			{
				var mode = 0;
				if(rt.color) mode |= gl.COLOR_BUFFER_BIT;
				if(rt.depth) mode |= gl.DEPTH_BUFFER_BIT;
				gl.clear(mode);
			}
		}
	},

	set_render_target_attachment: function(attachment, texture)
	{
		var gl = gb.webgl.ctx;
		gl.bindTexture(gl.TEXTURE_2D, texture.id);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, texture.id, 0);
	},

	link_render_target: function(rt)
	{
		ASSERT(rt.linked === false, 'Render target already linked');

		var _t = gb.webgl;
		var gl = _t.ctx;
		rt.frame_buffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, rt.frame_buffer);

		if(rt.color !== null)
		{
			_t.set_render_target_attachment(gl.COLOR_ATTACHMENT0, rt.color);
		}
		if(rt.depth !== null)
		{
			_t.set_render_target_attachment(gl.DEPTH_ATTACHMENT, rt.depth);
		}
		else
		{
			rt.render_buffer = _t.new_render_buffer(rt.bounds.width, rt.bounds.height);
		}

		//DEBUG
		_t.verify_render_target();
		//END

		rt.linked = true;
	},

	delete_render_target: function(rt)
	{
		var gl = gb.webgl.ctx;
		gl.deleteFrameBuffer(rt.frame_buffer);
		if(rt.render_buffer)
		{
			gl.deleteRenderBuffer(rt.render_buffer);
		}
	},

	draw_mesh: function(mesh)
	{
		var gl = gb.webgl.ctx;
		if(mesh.index_buffer)
		{
    		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
        	gl.drawElements(mesh.layout, mesh.index_count, gl.UNSIGNED_INT, 0);
		}
		else
		{
			gl.drawArrays(mesh.layout, 0, mesh.vertex_count);
		}
	},

	link_attributes: function(shader, mesh)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var vb = mesh.vertex_buffer;
		gl.bindBuffer(gl.ARRAY_BUFFER, vb.id);

		for(var k in shader.attributes)
		{
			var sa = shader.attributes[k];
			var va = vb.attributes[k];

			ASSERT(va !== undefined, 'Shader wants attribute ' + k + ' but mesh does not have it');

			gl.enableVertexAttribArray(sa.location);
			gl.vertexAttribPointer(sa.location, va.size, gl.FLOAT, va.normalized, vb.stride * 4, va.offset * 4);
		}
	},

	set_uniforms: function(material)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var shader = material.shader;
		for(var key in shader.uniforms)
		{
			var uniform = shader.uniforms[key];
			var loc = uniform.location;
			var val = material[key];
			ASSERT(EXISTS(val), "Could not find shader uniform " + key + " in material " + material.name);
			switch(uniform.type)
			{
				case 'FLOAT': 
		        {
					gl.uniform1f(loc, val);
					break;
				}
				case 'FLOAT_VEC2':
				{
					gl.uniform2f(loc, val[0], val[1]);
					break;
				}
		        case 'FLOAT_VEC3':
		        {
					gl.uniform3f(loc, val[0], val[1], val[2]);
					break;
				}
		        case 'FLOAT_VEC4':
		        {
					gl.uniform4f(loc, val[0], val[1], val[2], val[3]);
					break;
				}
		        case 'BOOL':
		        {
		        	if(val === true) gl.uniform1i(loc, 1);
		        	else gl.uniform1i(loc, 0);
		        	break;
		        }
		        case 'FLOAT_MAT2':
		        {
		        	gl.uniformMatrix2fv(loc, false, val);
		        	break;
		        }
		        case 'FLOAT_MAT3':
		        {
					gl.uniformMatrix3fv(loc, false, val);
					break;
				}
		        case 'FLOAT_MAT4':
		        {
					gl.uniformMatrix4fv(loc, false, val);
					break;
				}
		        case 'SAMPLER_2D':
		        {
					gl.uniform1i(loc, uniform.sampler_index);
					gl.activeTexture(gl.TEXTURE0 + uniform.sampler_index);
					gl.bindTexture(gl.TEXTURE_2D, val.id);
					break;
				}
		        case 'SAMPLER_CUBE':
		        {
		        	break;
		        }
		        case 'INT':
		        {
					gl.uniform1i(loc, val);
					break;
				}
				 case 'INT_VEC2':
		        {
		        	gl.uniform2i(loc, val[0], val[1]);
		        	break;
		        }
		        case 'INT_VEC3':
		        {
		        	gl.uniform3i(loc, val[0], val[1], val[2]);
		        	break;
		        }
		        case 'INT_VEC4':
		        {
		        	gl.uniform3i(loc, val[0], val[1], val[2], val[3]);
		        	break;
		        }
				default:
				{
					ASSERT(false, uniform.type + ' is an unsupported uniform type');
				}
			}
		}
	},

	render_scene: function(scene, camera, target, clear)
	{
		var _t = gb.webgl;
		_t.render_draw_call(camera, scene, scene.draw_items, scene.num_draw_items, null, target, clear, true);
	},

	render_mesh: function(mesh, material, camera, matrix)
	{
		var _t = gb.webgl;
		gb.material.set_camera_uniforms(material, camera);
		gb.material.set_matrix_uniforms(material, matrix, camera);
		_t.use_shader(material.shader);
		_t.link_attributes(material.shader, mesh);
		_t.set_uniforms(material);
		_t.draw_mesh(mesh);
	},

	render_entity: function(entity, camera)
	{
		var _t = gb.webgl;
		_t.render_mesh(entity.mesh, entity.material, camera, entity.world_matrix);
	},

	render_draw_call: function(camera, scene, ids, count, material, target, clear, depth)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var n = count;
		
		_t.set_state(gl.DEPTH_TEST, depth);
		_t.set_render_target(target, clear);

		gl.depthRange(camera.near, camera.far);

		if(material)
		{
			_t.use_shader(material.shader);
			gb.material.set_camera_uniforms(material, camera);
			for(var i = 0; i < n; ++i)
			{
				var id = ids[i];
				var e = scene.entities[id];
				gb.material.set_matrix_uniforms(material, e.world_matrix, camera);
				_t.link_attributes(material.shader, e.mesh);
				_t.set_uniforms(material);
				_t.draw_mesh(e.mesh);
			}
		}
		else
		{
			for(var i = 0; i < n; ++i)
			{
				var id = ids[i];
				var e = scene.entities[id];
				_t.render_entity(e, camera);
			}
		}
	},

	render_post_call: function(pc)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;

		_t.set_render_target(pc.target, true);

		gl.disable(gl.DEPTH_TEST);
		_t.use_shader(pc.material.shader);
		_t.link_attributes(pc.material.shader, pc.mesh);
		_t.set_uniforms(pc.material);
		_t.draw_mesh(pc.mesh);
	},


    //DEBUG
    get_context_info: function(gl)
	{
		LOG("AA Size: " + gl.getParameter(gl.SAMPLES));
		LOG("Shader High Float Precision: " + gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT));
		LOG("Max Texture Size: " + gl.getParameter(gl.MAX_TEXTURE_SIZE) + "px");
		LOG("Max Cube Map Size: " + gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE) + "px");
		LOG("Max Render Buffer Size: " + gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) + "px");
		LOG("Max Vertex Shader Texture Units: " + gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
		LOG("Max Fragment Shader Texture Units: " + gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS));
		LOG("Max Combined Texture Units: " + gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
		LOG("Max Vertex Shader Attributes: " + gl.getParameter(gl.MAX_VERTEX_ATTRIBS));
		LOG("Max Vertex Uniform Vectors: " + gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS));
		LOG("Max Frament Uniform Vectors: " + gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS));
		LOG("Max Varying Vectors: " + gl.getParameter(gl.MAX_VARYING_VECTORS));

		var supported_extensions = gl.getSupportedExtensions();
		for(var i = 0; i < supported_extensions.length; ++i)
		{
			LOG(supported_extensions[i]);
		}
	},
	verify_context: function()
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		if(gl.isContextLost())
		{
			gl.error("Lost WebGL context");
			// attempt recovery
		}
	},
	shader_compile_status: function(s)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
	    var success = gl.getShaderParameter(s, gl.COMPILE_STATUS);
	    if(!success)
	    {
	        console.error("Shader Compile Error: " + gl.getShaderInfoLog(s));
	    }
	},
	shader_link_status: function(p)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
	    var success = gl.getProgramParameter(p, gl.LINK_STATUS);
	    if(!success)
	    {
	        console.error("Shader Link Error: " + gl.getProgramInfoLog(p));
	    }
	},
	verify_render_target: function(gl)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if(status != gl.FRAMEBUFFER_COMPLETE)
		{
			console.error('Error creating framebuffer: ' +  status);
		}
	}
	//END
}