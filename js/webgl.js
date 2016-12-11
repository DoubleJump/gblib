function Canvas(container, view)
{
	var canvas = document.createElement('canvas');
    canvas.width = view[2];
    canvas.height = view[3];
    container.appendChild(canvas);
    return canvas;
}

function WebGL(canvas, options, extensions)
{
    var GL = canvas.getContext('webgl', options);
    if(!GL)
    {
    	//canvas.parentElement.textContent = 'Bugger';
    	console.error('Webgl not supported');
    	return false;
    }

   	GL.extensions = {};
    if(extensions)
    {
	    for(var i = 0; i < extensions.length; ++i)
	    {
	    	var name = extensions[i];
	    	GL.extensions[name] = GL.getExtension(name);
	    }
    }

    GL._parameters = {};
	GL._parameters.num_texture_units = GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS);

	GL.clearColor(1.0, 1.0, 1.0, 1.0);
	GL.enable(GL.SCISSOR_TEST);

	reset_webgl_state(GL);

	// DEBUG
	//log_webgl_info(GL);
	// END

	return GL;
}

function reset_webgl_state(GL)
{
	var n = GL._parameters.num_texture_units;
	for(var i = 0; i < n; ++i) 
	{
		GL.activeTexture(GL.TEXTURE0 + i);
		GL.bindTexture(GL.TEXTURE_2D, null);
		GL.bindTexture(GL.TEXTURE_CUBE_MAP, null);
	}
	GL.bindBuffer(GL.ARRAY_BUFFER, null);
	GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
	GL.bindRenderbuffer(GL.RENDERBUFFER, null);
	GL.bindFramebuffer(GL.FRAMEBUFFER, null);

	enable_backface_culling(GL);
	enable_depth_testing(GL, GL.LEQUAL);
	set_blend_mode(GL, BlendMode.DEFAULT);
	//GL.useShader(null)??
}

function set_viewport(GL, rect)
{
	GL.viewport(rect[0], rect[1], rect[2], rect[3]);
	GL.scissor(rect[0], rect[1], rect[2], rect[3]);
}

function set_clear_color(GL, r,g,b,a)
{
	GL.clearColor(r,g,b,a);
}

function clear_screen(GL)
{
	GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
}

function enable_backface_culling(GL)
{
	GL.enable(GL.CULL_FACE);
	GL.cullFace(GL.BACK);
	GL.frontFace(GL.CCW);
}
function disable_backface_culling(GL)
{
	GL.disable(GL.CULL_FACE);
}

function enable_depth_testing(GL, mode)
{
	GL.enable(GL.DEPTH_TEST);
	if(mode) GL.depthFunc(mode); 
}

function disable_depth_testing(GL)
{
	GL.disable(GL.DEPTH_TEST);
}

function set_depth_range(GL, min, max)
{
	GL.depthRange(min, max);
}

function set_line_width(GL, val)
{
	GL.lineWidth(val);
}

function convert_update_rate(GL, type)
{
	switch(type)
	{
		case BufferUpdateRate.STATIC:  return GL.STATIC_DRAW;
		case BufferUpdateRate.DYNAMIC: return GL.DYNAMIC_DRAW;
		case BufferUpdateRate.STREAM:  return GL.STREAM_DRAW;
		default: console.error('Invalid update rate');
	}
}
function convert_mesh_layout(GL, type)
{
	switch(type)
	{
		case MeshLayout.TRIANGLES: return GL.TRIANGLES;
		case MeshLayout.LINES: 	   return GL.LINES;
		case MeshLayout.TRI_STRIP: return GL.TRIANGLE_STRIP;

		default: console.error('Invalid mesh layout');
	}
}

function bind_mesh(GL, mesh)
{
	mesh.vertex_buffer.id = GL.createBuffer();
	if(mesh.index_buffer) mesh.index_buffer.id = GL.createBuffer();
	update_mesh(GL, mesh);
}
function unbind_mesh(GL, mesh)
{
	GL.bindBuffer(GL.ARRAY_BUFFER, mesh.vertex_buffer.id);
	GL.bufferData(GL.ARRAY_BUFFER, 1, GL.STATIC_DRAW);
	GL.deleteBuffer(mesh.vertex_buffer.id);

	if(mesh.index_buffer)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, 1, GL.STATIC_DRAW);
		GL.deleteBuffer(mesh.index_buffer.id);
	}

	mesh.vertex_buffer.id = null;
	mesh.index_buffer.id = null;
	GL.bindBuffer(GL.ARRAY_BUFFER, null);
	GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, null);
}
function update_mesh(GL, mesh)
{
	var vb = mesh.vertex_buffer;
	var ib = mesh.index_buffer;

	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);
	GL.bufferData(GL.ARRAY_BUFFER, vb.data, convert_update_rate(GL, vb.update_rate));
	GL.bindBuffer(GL.ARRAY_BUFFER, null);

	if(ib !== null)
	{
		ib.byte_size = GL.UNSIGNED_INT;
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, ib.id);
		GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, ib.data, convert_update_rate(GL, ib.update_rate));
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, null);
	}
}
function update_mesh_range(GL, mesh, start, end)
{
	var vb = mesh.vertex_buffer;
	//var start = vb.update_start * vb.stride;
	var view = vb.data.subarray(start, end);

	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);
	GL.bufferSubData(GL.ARRAY_BUFFER, start * 4, view);
	GL.bindBuffer(GL.ARRAY_BUFFER, null);
}


function convert_texture_size(GL, t)
{
	if(t.format === TextureFormat.DEPTH) return GL.UNSIGNED_SHORT;

	switch(t.bytes_per_pixel)
	{
		case 4:  return GL.UNSIGNED_BYTE;
		default: console.error('Invalid texture size');
	}
}
function convert_texture_format(GL, t)
{
	switch(t.format)
	{
		case TextureFormat.RGB: return GL.RGB;
		case TextureFormat.RGBA: return GL.RGBA;
		case TextureFormat.DEPTH: return GL.DEPTH_COMPONENT;
		case TextureFormat.GRAYSCALE: return GL.LUMINANCE;
		default: console.error('Invalid texture format');
	}
}
function bind_texture(GL, texture)
{
	texture.id = GL.createTexture();
	update_texture(GL, texture);
}
function unbind_texture(GL, texture)
{
	GL.deleteTexture(texture.id);
	texture.id = null;
}
function update_texture(GL, t)
{
	GL.bindTexture(GL.TEXTURE_2D, t.id);
	var size = convert_texture_size(GL, t);
	var format = convert_texture_format(GL, t);

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

	set_sampler(GL, t.sampler);
}

function set_sampler(GL, sampler)
{
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, sampler.s);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, sampler.t);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, sampler.up);
	GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, sampler.down);	

	var ext = GL.extensions.EXT_texture_filter_anisotropic;
	if(ext !== undefined)
	{
		var max_anisotropy = GL.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
		var anisotropy = clamp(sampler.anisotropy, 0, max_anisotropy);

		GL.texParameterf
		(
			GL.TEXTURE_2D, 
			ext.TEXTURE_MAX_ANISOTROPY_EXT, 
			anisotropy
		);
	}
}

function bind_shader(GL, s)
{
	var vs = GL.createShader(GL.VERTEX_SHADER);
    GL.shaderSource(vs, s.vertex_src);
    GL.compileShader(vs);

    var success = GL.getShaderParameter(vs, GL.COMPILE_STATUS);
    if(success === false) console.error("Shader Compile Error: " + GL.getShaderInfoLog(vs));

    var fs = GL.createShader(GL.FRAGMENT_SHADER);
    GL.shaderSource(fs, s.fragment_src);
    GL.compileShader(fs);

    success = GL.getShaderParameter(fs, GL.COMPILE_STATUS);
    if(success === false) console.error("Shader Compile Error: " + GL.getShaderInfoLog(fs));

	s.id = GL.createProgram();
    GL.attachShader(s.id, vs);
    GL.attachShader(s.id, fs);
    GL.linkProgram(s.id);

    success = GL.getProgramParameter(s.id, GL.LINK_STATUS);
    if(success === false) console.error("Shader Link Error: " + GL.getProgramInfoLog(s.id));

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
        uniform.location = GL.getUniformLocation(s.id, active_uniform.name);
        uniform.type = active_uniform.type;
        uniform.size = active_uniform.size;
        if(uniform.type === GL.SAMPLER_2D)
        {
        	uniform.sampler_index = sampler_index;
        	sampler_index++;
        }
        s.uniforms[active_uniform.name] = uniform;
    }

    s.vertex_src = null;
    s.fragment_src = null;

    return s;
}

function unbind_shader(GL, shader)
{

}

function set_attributes(GL, shader, mesh)
{
	var vb = mesh.vertex_buffer;
	GL.bindBuffer(GL.ARRAY_BUFFER, vb.id);

	for(var k in vb.attributes)
	{
		var sa = shader.attributes[k];
        var va = vb.attributes[k];
        //ASSERT(va !== undefined, 'Shader ' + shader.name + ' needs attribute ' + k + ' but mesh ' + mesh.name + ' does not have it');
        if(sa === undefined) continue;
        if(va === undefined) continue;
		GL.enableVertexAttribArray(sa);
		GL.vertexAttribPointer(sa, va.size, GL.FLOAT, va.normalized, vb.stride * 4, va.offset * 4);
	}
}

function bind_instance_buffers(GL, buffers)
{
    for(var k in buffers)
    {
        var b = buffers[k];
        if(b.id !== null) continue;
        b.id = GL.createBuffer();
    }
    update_instance_buffers(GL, buffers);
}

function update_instance_buffers(GL, buffers)
{
    for(var k in buffers)
    {
        var b = buffers[k];
        GL.bindBuffer(GL.ARRAY_BUFFER, b.id);
        GL.bufferData(GL.ARRAY_BUFFER, b.data, GL.STATIC_DRAW);
    }
}

function set_instance_attributes(GL, shader, buffers)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;
    for(var k in buffers)
    {
        var buffer = buffers[k];
        var sa = shader.attributes[k];
        if(sa === undefined) continue;

        GL.bindBuffer(GL.ARRAY_BUFFER, buffer.id);
        GL.enableVertexAttribArray(sa);
        GL.vertexAttribPointer(sa, 3, GL.FLOAT,false, 12, 0);
        ext.vertexAttribDivisorANGLE(sa, 1);
    }
}

function use_shader(GL, shader)
{
    GL.useProgram(shader.id);
}

function set_uniform(GL, uniform, value)
{
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
			GL.bindTexture(GL.TEXTURE_2D, value.id);
			return;
		}
		/*
        case GL.SAMPLER_CUBE:
        {
        	return;
        }
        */
        case GL.INT: 	  GL.uniform1i(loc, value); return;
        /*
		case GL.INT_VEC2: GL.uniform2iv(loc, size, value); return;
        case GL.INT_VEC3: GL.uniform3iv(loc, size, value); return;
        case GL.INT_VEC4: GL.uniform4iv(loc, size, value); return;
		*/
        // DEBUG
		default:
		{
			console.error(uniform.type + ' is an unsupported uniform type');
		}
		// END
	}
}


function draw_mesh(GL, shader, mesh)
{
	set_attributes(GL, shader, mesh);

	var layout = convert_mesh_layout(GL, mesh.layout);
	
	if(mesh.index_buffer !== null)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
    	GL.drawElements(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0);
	}
    else
    {
    	GL.drawArrays(layout, 0, mesh.vertex_buffer.count);
    }
}

function draw_mesh_instanced(GL, mesh, instances, shader, count)
{
	var ext = GL.extensions.ANGLE_instanced_arrays;
	set_instance_attributes(GL, shader, instances);

	var layout = convert_mesh_layout(GL, mesh.layout);

	if(mesh.index_buffer !== null)
	{
		GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, mesh.index_buffer.id);
    	ext.drawElementsInstancedANGLE(layout, mesh.index_buffer.count, GL.UNSIGNED_INT, 0, count);
	}
    else
    {
    	ext.drawArraysInstancedANGLE(layout, 0, mesh.vertex_buffer.count, count);
    }
}


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
}

function set_blend_mode(GL, mode)
{
	if(mode === BlendMode.NONE) GL.disable(GL.BLEND);
	else GL.enable(GL.BLEND);

	switch(mode)
	{
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
}

function set_depth_mode(GL, mode)
{
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

function bind_render_target(GL, t)
{
	bind_texture(GL, t.color);
	bind_texture(GL, t.depth);

	t.frame_buffer = GL.createFramebuffer();
	GL.bindFramebuffer(GL.FRAMEBUFFER, t.frame_buffer);

	set_render_target_attachment(GL, GL.COLOR_ATTACHMENT0, t.color);
	set_render_target_attachment(GL, GL.DEPTH_ATTACHMENT, t.depth);

	//DEBUG
	verify_render_target(GL);
	//END	
}

function set_render_target_attachment(GL, attachment, texture)
{
	GL.bindTexture(GL.TEXTURE_2D, texture.id);
	GL.framebufferTexture2D(GL.FRAMEBUFFER, attachment, GL.TEXTURE_2D, texture.id, 0);
}

function set_render_target(GL, target, view)
{
	if(target === null)
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, null);
		GL.bindRenderbuffer(GL.RENDERBUFFER, null);
		set_viewport(GL, view);
	}
	else
	{
		GL.bindFramebuffer(GL.FRAMEBUFFER, target.frame_buffer);
		GL.bindRenderbuffer(GL.RENDERBUFFER, target.render_buffer);
		set_viewport(GL, target.view);
	}
}


//DEBUG

function verify_webgl_context(GL)
{
	if(GL.isContextLost()) console.error('GL context lost');
}

function verify_render_target(GL)
{
	var status = GL.checkFramebufferStatus(GL.FRAMEBUFFER);
	if(status != GL.FRAMEBUFFER_COMPLETE)
	{
		console.error('Error creating framebuffer: ' +  status);
	}
}

function log_webgl_info(GL)
{
	LOG("Shader High Float Precision: " + GL.getShaderPrecisionFormat(GL.FRAGMENT_SHADER, GL.HIGH_FLOAT));
	LOG("AA Size: " + GL.getParameter(GL.SAMPLES));
	LOG("Max Texture Size: " + GL.getParameter(GL.MAX_TEXTURE_SIZE) + "px");
	LOG("Max Cube Map Size: " + GL.getParameter(GL.MAX_CUBE_MAP_TEXTURE_SIZE) + "px");
	LOG("Max Render Buffer Size: " + GL.getParameter(GL.MAX_RENDERBUFFER_SIZE) + "px");
	LOG("Max Vertex Shader Texture Units: " + GL.getParameter(GL.MAX_VERTEX_TEXTURE_IMAGE_UNITS));
	LOG("Max Fragment Shader Texture Units: " + GL.getParameter(GL.MAX_TEXTURE_IMAGE_UNITS));
	LOG("Max Combined Texture Units: " + GL.getParameter(GL.MAX_COMBINED_TEXTURE_IMAGE_UNITS));
	LOG("Max Vertex Shader Attributes: " + GL.getParameter(GL.MAX_VERTEX_ATTRIBS));
	LOG("Max Vertex Uniform Vectors: " + GL.getParameter(GL.MAX_VERTEX_UNIFORM_VECTORS));
	LOG("Max Frament Uniform Vectors: " + GL.getParameter(GL.MAX_FRAGMENT_UNIFORM_VECTORS));
	LOG("Max Varying Vectors: " + GL.getParameter(GL.MAX_VARYING_VECTORS));

	var supported_extensions = GL.getSupportedExtensions();
	for(var i = 0; i < supported_extensions.length; ++i)
	{
		console.log(supported_extensions[i]);
	}

	var info = GL.getExtension('WEBGL_debug_renderer_info');
	if(info) 
	{
		LOG("Renderer: " + GL.getParameter(info.UNMASKED_RENDERER_WEBGL));
		LOG("Vendor:" + GL.getParameter(info.UNMASKED_VENDOR_WEBGL));
	}
}
//END