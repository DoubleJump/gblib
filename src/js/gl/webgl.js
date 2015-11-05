gb.DrawCall = function()
{
	this.clear = false;
	this.depth_test = true;
	this.target;
	this.camera;
	this.material;
	this.entities = [];
	this.lights;
}
gb.PostCall = function()
{
	this.mesh;
	this.material;
}

gb.webgl = 
{
	shader_types:
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
        0x1406: 'FLOAT'
    },

	extensions: 
	{
		depth_texture: null,
		dxt: null,
		pvr: null,
		fp_texture: null,
		uint: null,
	},
	ctx: null,
	//m_offsets: null,
	view: null,
	default_sampler: null,
    screen_mesh: null,
    screen_shader: null,

	init: function(container, config)
	{
		var _t = gb.webgl;
		var gl;

		var width = 0;
		var height = 0;
		if(config.width)
		{
			width = config.width * config.resolution;
			height = config.height * config.resolution;
		}
		else
		{
			width = container.offsetWidth * config.resolution;
        	height = container.offsetHeight * config.resolution;	
		}
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
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LEQUAL); 
    	gl.clearDepth(1.0);
		
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.frontFace(gl.CCW);
		gl.enable(gl.SCISSOR_TEST);
		
		_t.set_viewport(_t.view);

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
		ex.pvr = gl.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
		ex.fp_texture = gl.getExtension("OES_texture_float");
		ex.uint = gl.getExtension("OES_element_index_uint");

		//_t.m_offsets = new Uint32Array(gb.NUM_VERTEX_ATTRIBUTES);
	},

	set_clear_color: function(r,g,b,a)
	{
		gb.webgl.ctx.clearColor(r,g,b,a);
	},

	link_mesh: function(m)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		m.vertex_buffer.id = gl.createBuffer();
		if(m.index_buffer)
			m.index_buffer.id = gl.createBuffer();
		_t.update_mesh(m);
		m.linked = true;
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
		var _t = gb.webgl;
		var gl = _t.ctx;
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
	    		var sa = new gb.ShaderAttribute();
	    		sa.location = loc;
	    		sa.index = i;
	    		s.attributes[c] = sa;
	    		c++;
	    	}
	    }

	    for(var i = 0; i < s.num_uniforms; ++i)
	    {
	        var uniform = gl.getActiveUniform(id, i);
	        var su = new gb.ShaderUniform();
	        su.location = gl.getUniformLocation(id, uniform.name);
	        su.type = _t.shader_types[uniform.type];
	        su.size = uniform.size;
	        s.uniforms[uniform.name] = su;
	        console.log(uniform.name);
	    }

	    s.linked = true;

	    return s;
	},

	use_shader: function(s)
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
		t.linked = true;
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

		t.dirty = false;
	},

	set_viewport: function(v)
	{
		var gl = gb.webgl.ctx;
		gl.viewport(v.x, v.y, v.width, v.height);
		gl.scissor(v.x, v.y, v.width, v.height);
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

		rt.linked = true;
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

		for(var i = 0; i < shader.num_attributes; ++i)
		{
			var sa = shader.attributes[i];
			var attr = gb.vertex_attributes[sa.index]; 
			gl.enableVertexAttribArray(sa.location);
			gl.vertexAttribPointer(sa.location, attr.size, gl.FLOAT, attr.normalized, vb.stride * 4, vb.offsets[sa.index]);
		}
	},

	set_uniforms: function(shader, uniforms)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var sampler_index = 0;
		for(var key in uniforms)
		{
			var uniform = shader.uniforms[key];
			var loc = uniform.location;
			var val = uniforms[key];
			switch(uniform.type)
			{
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
		        //case 'INT_VEC2':
		        //case 'INT_VEC3':
		        //case 'INT_VEC4':
		        case 'BOOL':
		        {
		        	break;
		        }
		        //case 'BOOL_VEC2':
		        //case 'BOOL_VEC3':
		        //case 'BOOL_VEC4':
		        //case 'FLOAT_MAT2':
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
		        	if(val.dirty === true)
		        	{
		        		_t.update_texture(val);
		        	}
					gl.bindTexture(gl.TEXTURE_2D, val.id);
					gl.activeTexture(gl.TEXTURE0 + sampler_index);
					gl.uniform1i(loc, val.id);
					sampler_index++;
					break;
				}
		        //case 'SAMPLER_CUBE':
		        //case 'BYTE':
		        //case 'UNSIGNED_BYTE':
		        //case 'SHORT':
		        //case 'UNSIGNED_SHORT':
		        case 'INT':
		        {
					ctx.uniformi(loc, val);
					break;
				}
		        //case 'UNSIGNED_INT':
		        case 'FLOAT': 
		        {
					ctx.uniformf(loc, val);
					break;
				}
				default:
				{
					ASSERT(false, uniform.type + ' is an unsupported uniform type');
				}
			}
		}
	},

	render_draw_call: function (dc)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;
		var mat = dc.material;
		var shader = mat.shader;
		var cam = dc.camera;
		//var lights = dc.lights;

		//TODO: obvs do this before draw call list
		
		//gl.enable(gl.DEPTH_TEST);
		if(dc.depth_test === true) gl.enable(gl.DEPTH_TEST);
		else gl.disable(gl.DEPTH_TEST);

		if(dc.target.linked === false)
		{
			_t.link_render_target(dc.target);
		}
		_t.set_render_target(dc.target, dc.clear);

		if(shader.linked === false) 
		{
			_t.link_shader(shader);
		}
		_t.use_shader(shader);

		if(shader.camera === true)
		{
			mat.uniforms.proj_matrix = cam.projection;
			mat.uniforms.view_matrix = cam.view;
			mat.uniforms.normal_matrix = cam.normal;
		}

		//if(shader.lights)
		
		var n = dc.entities.length;
		for(var i = 0; i < n; ++i)
		{
			var e = dc.entities[i];
			if(e.entity_type !== gb.EntityType.ENTITY && e.entity_type !== gb.EntityType.RIG) continue;
			ASSERT(e.mesh, "Cannot draw an entity with no mesh now can I?");
			if(e.mesh.linked === false) _t.link_mesh(e.mesh);
			if(e.mesh.dirty === true) _t.update_mesh(e.mesh);
			_t.link_attributes(shader, e.mesh);

			if(shader.mvp === true)
			{
				gb.mat4.mul(mat.uniforms.mvp, e.world_matrix, cam.view_projection);
			}
			else
			{
				mat.uniforms.model_matrix = e.world_matrix;
			}

			if(shader.rig)
			{
				var rig = mat.uniforms['rig[0]'];
				var n = e.rig.joints.length;
				var t = 0;
				for(var i = 0; i < n; ++i)
				{
					var joint = e.rig.joints[i];
					for(var j = 0; j < 16; ++j)
					{
						rig[t+j] = joint.offset_matrix[j];
					}
					t += 16;
				}
			}

			_t.set_uniforms(shader, mat.uniforms);

			if(e.mesh.index_buffer) _t.draw_mesh_elements(e.mesh);
			else _t.draw_mesh_arrays(e.mesh);
		}
	},

	render_post_call: function(pc)
	{
		var _t = gb.webgl;
		var gl = _t.ctx;

		var mesh = pc.mesh;
		var mat = pc.material;
		var shader = mat.shader;

		if(shader.linked === false) _t.link_shader(shader);
		if(mesh.linked === false) _t.link_mesh(mesh);
		if(mesh.dirty === true) _t.update_mesh(mesh);

		gl.disable(gl.DEPTH_TEST);
		_t.set_render_target(null);
		_t.use_shader(shader);
		_t.link_attributes(shader, mesh);
		_t.set_uniforms(shader, mat.uniforms);
		_t.draw_mesh_elements(mesh);
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
        r[1] = 1.0 - (point[1] / view.height);
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
    },
}