function GLState()
{
	var r = {};

	r.shader = null;
	r.render_buffer = null;
	r.frame_buffer = null;
	r.array_buffer = null;
	r.index_buffer = null;
	r.texture = null;

	r.blending = null;
	r.blend_mode = null;
	r.depth_testing = null;
	r.depth_write = null;
	r.depth_mode = null;
	r.depth_min = null;
	r.depth_max = null;

	r.scissor = null;
	r.culling = null;
	r.winding_order = null;
	r.line_width = null;
	r.dither = null;

	return r;
}

var DepthMode =
{
	DEFAULT: 0,
	NEVER: 1,
	LESS: 2,
	LESS_OR_EQUAL: 3,
	EQUAL: 4,
	GREATER: 5,
	NOT_EQUAL: 6,
	GREATER_OR_EQUAL: 7,
	ALWAYS: 8,
};

var BlendMode =
{
	DEFAULT: 0,
	NONE: 1,
	DARKEN: 2,
	LIGHTEN: 3,
	DIFFERENCE: 4,
	MULTIPLY: 5,
	SCREEN: 6,
	INVERT: 7,
};


var GL = null;
function WebGL(canvas, options)
{
    GL = canvas.getContext('webgl', options) ||
    	 canvas.getContext('experimental-webgl', options);

   	GL.extensions = {};
    var supported_extensions = GL.getSupportedExtensions();
	for(var i = 0; i < supported_extensions.length; ++i)
	{
		var ext = supported_extensions[i];
		if(ext.indexOf('MOZ') === 0) continue;
	    GL.extensions[ext] = GL.getExtension(ext);
	}

    GL._parameters = {};
	GL._parameters.num_texture_units = GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);

	GL._parameters.max_anisotropy = null;
	var anisotropic = GL.extensions.EXT_texture_filter_anisotropic;
	if(anisotropic !== undefined)
	{
		GL._parameters.max_anisotropy = GL.getParameter(anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
	}

	GL._state = GLState();
	reset_webgl_state();

	return GL;
}

function reset_webgl_state()
{
	var n = GL._parameters.num_texture_units;
	for(var i = 0; i < n; ++i)
	{
		GL.activeTexture(GL.TEXTURE0 + i);
		GL.bindTexture(GL.TEXTURE_2D, null);
		GL.bindTexture(GL.TEXTURE_CUBE_MAP, null);
	}

	set_render_target(null);

	enable_backface_culling();
	enable_scissor_testing();
	GL.cullFace(GL.BACK);
	GL.frontFace(GL.CCW);

	enable_depth_testing(GL.LEQUAL);
	set_blend_mode(BlendMode.DEFAULT);
}


function set_viewport(rect)
{
	GL.viewport(rect[0], rect[1], rect[2], rect[3]);
	GL.scissor(rect[0], rect[1], rect[2], rect[3]);
}

function set_clear_color(c)
{
	GL.clearColor(c[0],c[1],c[2],c[3]);
}
function set_clear_color_f(r,g,b,a)
{
	GL.clearColor(r,g,b,a);
}

function clear_screen(mode)
{
	mode = mode || (GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
	GL.clear(mode);
}

function enable_dithering()
{
	if(GL._state.dither === true) return;
	GL._state.dither = true;

	GL.enable(GL.DITHER);
}
function disable_dithering()
{
	if(GL._state.dither === false) return;
	GL._state.dither = false;

	GL.disable(GL.DITHER);
}

function enable_backface_culling()
{
	if(GL._state.culling === true) return;
	GL._state.culling = true;

	GL.enable(GL.CULL_FACE);
}
function disable_backface_culling()
{
	if(GL._state.culling === false) return;
	GL._state.culling = false;

	GL.disable(GL.CULL_FACE);
}

function enable_depth_testing(mode)
{
	if(GL._state.depth_testing === true) return;
	GL._state.depth_testing = true;

	GL.enable(GL.DEPTH_TEST);
	if(mode) GL.depthFunc(mode);
}

function disable_depth_testing()
{
	if(GL._state.depth_testing === false) return;
	GL._state.depth_testing = false;

	GL.disable(GL.DEPTH_TEST);
}

function enable_scissor_testing()
{
	if(GL._state.scissor_testing === true) return;
	GL._state.scissor_testing = true;

	GL.enable(GL.SCISSOR_TEST);
}

function disable_scissor_testing()
{
	if(GL._state.scissor_testing === false) return;
	GL._state.scissor_testing = false;

	GL.disable(GL.SCISSOR_TEST);
}

function enable_stencil_testing()
{
	if(GL._state.stencil_testing === true) return;
	GL._state.stencil_testing = true;
	GL.enable(GL.STENCIL_TEST);
}

function disable_stencil_testing()
{
	if(GL._state.stencil_testing === false) return;
	GL._state.stencil_testing = false;
	GL.disable(GL.STENCIL_TEST);
}

function enable_alpha_blending()
{
	if(GL._state.blending === true) return;
	GL._state.blending = true;
	GL.enable(GL.BLEND);
}

function disable_alpha_blending()
{
	if(GL._state.blending === false) return;
	GL._state.blending = false;
	GL.disable(GL.BLEND);
}

function set_depth_range(min, max)
{
	var state = GL._state;
	if(state.depth_min === min && state.depth_max === max) return;
	state.depth_min = min;
	state.depth_max = max;

	GL.depthRange(min, max);
}

function set_line_width(val)
{
	if(GL._state.line_width === val) return;
	GL._state.line_width = val;

	GL.lineWidth(val);
}

function set_texture(texture)
{
	var id = texture.id;
	//if(GL._state.texture === id) return;
	//GL._state.texture = id;
	GL.bindTexture(GL.TEXTURE_2D, id);
}

function set_array_buffer(buffer)
{
	if(buffer === GL._state.array_buffer) return;

	if(buffer === null)
	{
		GL.bindBuffer(GL.ARRAY_BUFFER, null);
		GL._state.array_buffer = null;
	}
	else
	{
		GL.bindBuffer(GL.ARRAY_BUFFER, buffer.id);
		GL._state.array_buffer = buffer.id;
	}
}

function set_index_buffer(buffer)
{
	if(buffer === GL._state.index_buffer) return;

	if(buffer === null)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
		GL._state.array_buffer = null;
	}
	else
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, buffer.id);
		GL._state.array_buffer = buffer.id;
	}
}

function set_shader(shader)
{
	if(GL._state.shader === shader) return;
	GL._state.shader = shader;
    GL.useProgram(shader.id);
}

function set_render_target(target)
{
	var rb = null;
	var fb = null;

	if(target)
	{
		rb = target.render_buffer || null;
		fb = target.frame_buffer || null;
	}

	if(GL._state.frame_buffer !== fb)
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, fb);
	}

	if(GL._state.render_buffer !== rb)
	{
		GL.bindRenderbuffer(GL.RENDERBUFFER, rb);
	}

	GL._state.render_buffer = rb;
	GL._state.frame_buffer = fb;
}

function convert_update_rate(type)
{
	switch(type)
	{
		case BufferUpdateRate.STATIC:  return GL.STATIC_DRAW;
		case BufferUpdateRate.DYNAMIC: return GL.DYNAMIC_DRAW;
		case BufferUpdateRate.STREAM:  return GL.STREAM_DRAW;
		default: console.error('Invalid update rate');
	}
}
function convert_mesh_layout(type)
{
	switch(type)
	{
		case MeshLayout.TRIANGLES: return GL.TRIANGLES;
		case MeshLayout.LINES: 	   return GL.LINES;
		case MeshLayout.STRIP:	   return GL.TRIANGLE_STRIP;
		case MeshLayout.POINTS:     return GL.POINTS;

		default: console.error('Invalid mesh layout');
	}
}

function bind_mesh(mesh)
{
	if(mesh.vertex_buffer.id === null)
	{
		mesh.vertex_buffer.id = GL.createBuffer();
	}
	if(mesh.index_buffer !== null && mesh.index_buffer.id === null)
	{
		mesh.index_buffer.id = GL.createBuffer();
	}
}
/*
function unbind_mesh(mesh)
{
	var vb = mesh.vertex_buffer;
	var ib = mesh.index_buffer;

	set_array_buffer(vb);
	GL.bufferData(GL.ARRAY_BUFFER, 1, GL.STATIC_DRAW);
	GL.deleteBuffer(vb.id);

	if(ib !== null)
	{
		set_index_buffer(ib);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, 1, GL.STATIC_DRAW);
		GL.deleteBuffer(mesh.index_buffer.id);
	}

	vb.id = null;
	ib.id = null;
	set_array_buffer(null);
	set_index_buffer(null);
}
*/

function update_mesh(mesh)
{
	var vb = mesh.vertex_buffer;
	var ib = mesh.index_buffer;

	set_array_buffer(vb);
	GL.bufferData(GL.ARRAY_BUFFER, vb.data, convert_update_rate(vb.update_rate));
	set_array_buffer(null);

	if(ib !== null)
	{
		ib.byte_size = GL.UNSIGNED_INT;
		set_index_buffer(ib);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, ib.data, convert_update_rate(ib.update_rate));
		set_index_buffer(null);
	}
}

function update_mesh_range(mesh, start, end)
{
	var vb = mesh.vertex_buffer;
	//var start = vb.update_start * vb.stride;
	var view = vb.data.subarray(start, end);

	set_array_buffer(vb);
	GL.bufferSubData(GL.ARRAY_BUFFER, start * 4, view);
	set_array_buffer(null);
}


function convert_texture_size(t)
{
	if(t.format === TextureFormat.DEPTH) return GL.UNSIGNED_SHORT;

	switch(t.bytes_per_pixel)
	{
		case 4:  return GL.UNSIGNED_BYTE;
		default: console.error('Invalid texture size');
	}
}
function convert_texture_format(format)
{
	switch(format)
	{
		case TextureFormat.RGB: return GL.RGB;
		case TextureFormat.RGBA: return GL.RGBA;
		case TextureFormat.DEPTH: return GL.DEPTH_COMPONENT;
		case TextureFormat.GRAYSCALE: return GL.LUMINANCE;
		default: console.error('Invalid texture format');
	}
}

function bind_texture(texture)
{
	if(texture.id === null) texture.id = GL.createTexture();
}

function unbind_texture(texture)
{
	GL.deleteTexture(texture.id);
	texture.id = null;
}

function update_texture(t)
{
	set_texture(t);
	var size = convert_texture_size(t);
	var format = convert_texture_format(t.format);

	if(t.flip === true)
	{
		GL.pixelStorei(GL.UNPACK_FLIP_Y_WEBGL, true);
	}
	if(t.from_element === true)
	{
		GL.texImage2D(GL.TEXTURE_2D, 0, format, format, size, t.data);
	}
	else if(t.compressed === true)
	{
		GL.compressedTexImage2D(GL.TEXTURE_2D, 0, format, t.width, t.height, 0, t.data);
	}
	else
	{
		GL.texImage2D(GL.TEXTURE_2D, 0, format, t.width, t.height, 0, format, size, t.data);
	}

	if(t.use_mipmaps === true)
	{
		GL.generateMipmap(GL.TEXTURE_2D);
	}

	set_sampler(t.sampler);
}

function set_sampler(sampler)
{
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, sampler.s);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, sampler.t);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, sampler.up);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, sampler.down);

	var ext = GL.extensions.EXT_texture_filter_anisotropic;
	if(ext !== undefined)
	{
		var max_anisotropy = GL._parameters.max_anisotropy;
		var anisotropy = clamp(sampler.anisotropy, 0, max_anisotropy);

		GL.texParameterf
		(
			GL.TEXTURE_2D,
			ext.TEXTURE_MAX_ANISOTROPY_EXT,
			anisotropy
		);
	}
}

function bind_shader(s)
{
	if(s.id !== null) return;

	var vs = GL.createShader(GL.VERTEX_SHADER);
    GL.shaderSource(vs, s.vertex_src);
    GL.compileShader(vs);

    var success = GL.getShaderParameter(vs, GL.COMPILE_STATUS);
    if(success === false)
    {
    	console.error(s.name);
    	console.error("Shader Compile Error: " + GL.getShaderInfoLog(vs));
    }

    var fs = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(fs, s.fragment_src);
    GL.compileShader(fs);

    success = GL.getShaderParameter(fs, GL.COMPILE_STATUS);
    if(success === false)
    {
    	console.error(s.name);
    	console.error("Shader Compile Error: " + GL.getShaderInfoLog(fs));
    }

	s.id = GL.createProgram();
    GL.attachShader(s.id, vs);
    GL.attachShader(s.id, fs);
    GL.linkProgram(s.id);

    success = GL.getProgramParameter(s.id, GL.LINK_STATUS);
    if(success === false)
    {
    	console.error(s.name);
    	console.error("Shader Link Error: " + GL.getProgramInfoLog(s.id));
    }

    var n = GL.getProgramParameter(s.id, GL.ACTIVE_ATTRIBUTES);
    for(var i = 0; i < n; ++i)
    {
        var attr = GL.getActiveAttrib(s.id, i);
        s.attributes[attr.name] = GL.getAttribLocation(s.id, attr.name);
    }

    n =  GL.getProgramParameter(s.id, GL.ACTIVE_UNIFORMS);
    var sampler_index = 0;
    for(var i = 0; i < n; ++i)
    {
        var active_uniform = GL.getActiveUniform(s.id, i);
        var uniform = {};
        var name = active_uniform.name;
        uniform.location = GL.getUniformLocation(s.id, active_uniform.name);
        uniform.type = active_uniform.type;
        uniform.size = active_uniform.size;

        if(uniform.size > 1)
        {
	    	name = name.substring(0,name.indexOf('[0]'));
	    }
        if(uniform.type === GL.SAMPLER_2D)
        {
        	uniform.sampler_index = sampler_index;
        	sampler_index++;
        }
        s.uniforms[name] = uniform;
    }

    s.vertex_src = null;
    s.fragment_src = null;

    return s;
}

function set_uniform(name, value)
{
	var uniform = GL._state.shader.uniforms[name];

	//DEBUG
	if(uniform === null || uniform === undefined)
	{
		//console.warning('Uniform not found');
		return;
	}
	//END

	var loc = uniform.location;
	var size = uniform.size;

	switch(uniform.type)
	{
		case GL.FLOAT:
		{
			if(size > 1)
			{
				GL.uniform1fv(loc, value);
				return;
			}
			GL.uniform1f(loc, value);
			return;
		}
		case GL.FLOAT_VEC2:
		{
			if(size > 1)
			{
				GL.uniform2fv(loc, value);
				return;
			}
			GL.uniform2f(loc, value[0], value[1]);
			return;
		}
        case GL.FLOAT_VEC3:
        {
        	if(size > 1)
			{
				GL.uniform3fv(loc, value);
				return;
			}
        	GL.uniform3f(loc, value[0], value[1], value[2]);
        	return;
        }
        case GL.FLOAT_VEC4:
        {
        	if(size > 1)
			{
				GL.uniform4fv(loc, value);
				return;
			}
        	GL.uniform4f(loc, value[0], value[1], value[2], value[3]);
        	return;
        }
        case GL.BOOL:
        {
        	if(value === true) GL.uniform1i(loc, 1);
        	else GL.uniform1i(loc, 0);
        	return;
        }
        case GL.FLOAT_MAT2: GL.uniformMatrix2fv(loc, false, value); return;
        case GL.FLOAT_MAT3: GL.uniformMatrix3fv(loc, false, value); return;
        case GL.FLOAT_MAT4: GL.uniformMatrix4fv(loc, false, value); return;
        case GL.SAMPLER_2D:
        {
			GL.uniform1i(loc, uniform.sampler_index);
			GL.activeTexture(GL.TEXTURE0 + uniform.sampler_index);
			set_texture(value);
			return;
		}
		/*
        case GL.SAMPLER_CUBE:
        {
        	return;
        }
        */
        case GL.INT:
        {
        	if(size > 1)
			{
				GL.uniform1iv(loc, value);
				return;
			}
        	GL.uniform1i(loc, value);
        	return;
        }
        /*
		case GL.INT_VEC2:
		{
			if(size > 1)
			{
				GL.uniform2iv(loc, value);
			}
			GL.uniform2i(loc, value[0], value[1]);
			return;
		}
        case GL.INT_VEC3:
        {
        	if(size > 1)
			{
        		GL.uniform3iv(loc, value);
        	}
			GL.uniform3i(loc, value[0], value[1], value[2]);
        	return;
        }
        case GL.INT_VEC4:
        {
        	if(size > 1)
			{
        		GL.uniform4iv(loc, size, value);
        	}
			GL.uniform4i(loc, value[0], value[1], value[2], value[3]);
        	return;
        }
        */
        // DEBUG
		default:
		{
			console.error(uniform.type + ' is an unsupported uniform type');
		}
		// END
	}
}

function set_attributes(shader, mesh)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;

	var vb = mesh.vertex_buffer;
	set_array_buffer(vb);

	for(var k in vb.attributes)
	{
		var sa = shader.attributes[k];
        var va = vb.attributes[k];
        //ASSERT(va !== undefined, 'Shader ' + shader.name + ' needs attribute ' + k + ' but mesh ' + mesh.name + ' does not have it');
        if(sa === undefined) continue;
        if(va === undefined) continue;
		GL.enableVertexAttribArray(sa);
		GL.vertexAttribPointer(sa, va.size, GL.FLOAT, va.normalized, vb.stride * 4, va.offset * 4);
		ext.vertexAttribDivisorANGLE(sa, 0);
	}
}

function bind_instance_buffers(buffers)
{
    for(var k in buffers)
    {
        var b = buffers[k];
        if(b.id === null) b.id = GL.createBuffer();
    }
    update_instance_buffers(buffers);
}


function update_instance_buffer(b, rate)
{
	set_array_buffer(b);
    GL.bufferData(GL.ARRAY_BUFFER, b.data, rate || GL.STATIC_DRAW);
}


function update_instance_buffers(buffers)
{
    for(var k in buffers)
    {
        var b = buffers[k];
        set_array_buffer(b);
        GL.bufferData(GL.ARRAY_BUFFER, b.data, GL.STATIC_DRAW);
    }
}

function set_instance_attributes(shader, buffers)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;
    for(var k in buffers)
    {
        var b = buffers[k];
        var sa = shader.attributes[k];
        if(sa === undefined) continue;

        set_array_buffer(b);
        GL.enableVertexAttribArray(sa);
        GL.vertexAttribPointer(sa, b.stride, GL.FLOAT, b.normalized, b.stride * 4, 0);
        ext.vertexAttribDivisorANGLE(sa, 1);
    }
}

function draw_mesh(mesh)
{
	set_attributes(GL._state.shader, mesh);
	var layout = convert_mesh_layout(mesh.layout);

	if(mesh.index_buffer !== null)
	{
		set_index_buffer(mesh.index_buffer);
    	GL.drawElements(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0);
	}
    else
    {
    	GL.drawArrays(layout, 0, mesh.vertex_buffer.count);
    }

    set_array_buffer(null);
    set_index_buffer(null);
}

function draw_mesh_instanced(mesh, instances, count)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;

    set_attributes(GL._state.shader, mesh);
	set_instance_attributes(GL._state.shader, instances);

	var layout = convert_mesh_layout(mesh.layout);

	if(mesh.index_buffer !== null)
	{
		set_index_buffer(mesh.index_buffer);
    	ext.drawElementsInstancedANGLE(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0, count);
	}
    else
    {
    	ext.drawArraysInstancedANGLE(layout, 0, mesh.vertex_buffer.count, count);
    }

    set_array_buffer(null);
    set_index_buffer(null);
}

function draw_call(shader, mesh, uniforms, instances, count)
{
	set_shader(shader);
	for(var u in uniforms) set_uniform(u, uniforms[u]);
	if(instances)
	{
		draw_mesh_instanced(mesh, instances, count);
	}
	else draw_mesh(mesh);
}

function set_blend_mode(mode)
{
	if(GL._state.blend_mode === mode) return;
	GL._state.blend_mode = mode;

	switch(mode)
	{
		case BlendMode.ADD:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFuncSeparate(GL.SRC_ALPHA, GL.ONE, GL.ONE, GL.ONE_MINUS_SRC_ALPHA);
			break;
		}
		case BlendMode.DARKEN:
		{
			GL.blendEquation(GL.FUNC_SUBTRACT);
			GL.blendFunc(GL.ONE, GL.ONE);
			break;
		}
		case BlendMode.LIGHTEN:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.ONE, GL.ONE);
			break;
		}
		case BlendMode.DIFFERENCE:
		{
			GL.blendEquation(GL.FUNC_SUBTRACT);
			GL.blendFunc(GL.ONE, GL.ONE);
			break;
		}
		case BlendMode.MULTIPLY:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.DST_COLOR, GL.ZERO);
			break;
		}
		case BlendMode.SCREEN:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.MINUS_DST_COLOR, GL.ONE);
			break;
		}
		case BlendMode.INVERT:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.ONE_MINUS_DST_COLOR, GL.ZERO);
			break;
		}
		default:
		{
			GL.blendEquation(GL.FUNC_ADD);
			GL.blendFunc(GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA);
			break;
		}
	}
}


function set_depth_mode(mode)
{
	if(GL._state.depth_mode === mode) return;
	GL._state.depth_mode === mode;

	switch(mode)
	{
		case DepthMode.NEVER: GL.depthFunc(GL.NEVER); return;
		case DepthMode.LESS: GL.depthFunc(GL.LESS); return;
		case DepthMode.LESS_OR_EQUAL: GL.depthFunc(GL.LEQUAL); return;
		case DepthMode.EQUAL: GL.depthFunc(GL.EQUAL); return;
		case DepthMode.GREATER: GL.depthFunc(GL.GREATER); return;
		case DepthMode.NOT_EQUAL: GL.depthFunc(GL.NOTEQUAL); return;
		case DepthMode.GREATER_OR_EQUAL: GL.depthFunc(GL.GEQUAL); return;
		case DepthMode.ALWAYS: GL.depthFunc(GL.ALWAYS); return;
		default: GL.depthFunc(GL.LESS); return;
	}
}

function bind_render_target(t)
{
	if(t.frame_buffer !== null) return;
	t.frame_buffer = GL.createFramebuffer();
}

function set_render_target_color(texture)
{
	set_texture(texture);
	GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0, GL.TEXTURE_2D, texture.id, 0);
}

function set_render_target_depth(texture)
{
	set_texture(texture);
	GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT, GL.TEXTURE_2D, texture.id, 0);
}

function verify_webgl_context()
{
	if(GL.isContextLost && GL.isContextLost()) console.error('GL context lost');
}

function verify_frame_buffer()
{
	var status = GL.checkFramebufferStatus(GL.FRAMEBUFFER);
	if(status != GL.FRAMEBUFFER_COMPLETE)
	{
		console.error('Error creating framebuffer: ' +  status);
	}
}