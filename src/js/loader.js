'use strict';

function run_webgl_bootloader(options) 
{
    var result = 
    {
      has_ctx: true,
      has_extensions: true,
      has_parameters: true,
      extensions: {},
      parameters: {},
      info: {},
    };

    var canvas = document.createElement('canvas');

    if(!window.WebGLRenderingContext)
    {
      result.has_ctx = false;
      return result;
    }

    var GL = canvas.getContext('webgl') || 
    canvas.getContext('experimental-webgl');
    if(!GL)
    {
      result.has_ctx = false;
      return result;
    }

    var extensions = options.extensions;
    for(var i = 0; i < extensions.length; ++i)
    {
      var name = extensions[i];
      var ext = GL.getExtension(name);
      if(ext === null || ext === undefined)
      {
        result.has_extensions = false;
        result.extensions[name] = false; 
      }
      else
      {
        result.extensions[name] = true; 
      }
    }

    var parameters = options.parameters;
    for(var k in parameters)
    {
        var operator = parameters[k][0];
        var value = parameters[k][1];
        var p = GL.getParameter(GL[k]);
        var match = true;
        switch(operator)
        {
            case '=': match = (p === value); break;
            case '>': match = (p > value); break;
            case '<': match = (p < value); break;
            case '>=': match = (p >= value); break;
            case '<=': match = (p <= value); break;
        }
        if(match === false)
        {
            result.has_parameters = false;
        }
        result.parameters[k] = p;
    }

    var render_info = GL.getExtension('WEBGL_debug_renderer_info');
    if(render_info)
    {
        result.info.renderer = GL.getParameter(render_info.UNMASKED_RENDERER_WEBGL);
        result.info.vendor = GL.getParameter(render_info.UNMASKED_VENDOR_WEBGL);
    }
    result.info.fragment_shader_precision = GL.getShaderPrecisionFormat(GL.FRAGMENT_SHADER, GL.HIGH_FLOAT);

    GL = null;
    canvas = null;
    return result;
}

function init()
{
    var result = run_webgl_bootloader(
    {
        extensions: 
        [
            'ANGLE_instanced_arrays',
            'EXT_blend_minmax',
            'EXT_frag_depth',
            'EXT_shader_texture_lod',
            'EXT_texture_filter_anisotropic',
            'OES_element_index_uint',
            'OES_standard_derivatives',
            'OES_texture_float',
            'OES_texture_float_linear',
            'OES_texture_half_float',
            'OES_texture_half_float_linear',
            //'OES_vertex_array_object',
            'WEBGL_compressed_texture_s3tc',
            'WEBGL_debug_renderer_info',
            'WEBGL_debug_shaders',
            'WEBGL_depth_texture',
            'WEBGL_draw_buffers',
            'WEBGL_lose_context',
            //'EXT_color_buffer_float',
            //'EXT_color_buffer_half_float',
            //'EXT_disjoint_timer_query',
            //'EXT_disjoint_timer_query_webgl2',
            //'EXT_float_blend',
            'EXT_sRGB',
            'EXT_texture_compression_bptc',
            'EXT_texture_compression_rgtc',
            //'WEBGL_color_buffer_float',
            'WEBGL_compressed_texture_astc',
            'WEBGL_compressed_texture_etc',
            'WEBGL_compressed_texture_etc1',
            'WEBGL_compressed_texture_pvrtc',
            'WEBGL_compressed_texture_s3tc_srgb',
        ],
        parameters:
        {
            SAMPLES: ['>=', 2],
            MAX_TEXTURE_SIZE: ['>=', 2048],
            MAX_CUBE_MAP_TEXTURE_SIZE: ['>=', 2048],
            MAX_RENDERBUFFER_SIZE: ['>=', 2048],
            MAX_VERTEX_TEXTURE_IMAGE_UNITS: ['>=', 8],
            MAX_TEXTURE_IMAGE_UNITS: ['>=', 8],
            MAX_VERTEX_UNIFORM_VECTORS: ['>=', 8],
            MAX_FRAGMENT_UNIFORM_VECTORS: ['>=', 8],
        }
    });

    if(result.has_ctx === true)
    {
        var script = document.createElement('script');
        script.setAttribute('src', 'js/app.js');
        script.onload = function()
        {
            app_start('en', result);
        };
        document.body.appendChild(script);
    }
}
init();

