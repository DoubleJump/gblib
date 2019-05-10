'use strict'

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var uglify_js = require('uglify-js');
var uglify_css = require('uglifycss');
var html_minifier = require('html-minifier');

var Texture_Type = 
{
	GRAYSCALE: 0,
	RGB: 1,
	RGBA: 2,
};

var Process_State = 
{
	RUNNING:0,
	IDLE:1
};

function run_process(name, args, on_close)
{
	var proc = child_process.spawn(name, args);
	proc.stdout.on('data', function(data){ console.log(data.toString()); });
	proc.stderr.on('data', function(data){ console.log(data.toString()); });
    proc.on('close', on_close);
}

var texture_compressor_state = Process_State.IDLE;

function compressor_finished(){ texture_compressor_state = Process_State.IDLE; }

function run_texture_compressor(ops)
{
	var args = 
	[
		'./node_modules/texture-compressor/bin/texture-compressor',
		'--compression', ops.compression,
		'--input', ops.input,
		'--output', ops.output,
		'--type', ops.type,
		'--quality', ops.quality,
		//'--mipmap', ops.mipmap
		//'--alpha', ops.alpha
	];
	
	var proc = child_process.spawn('node', args);

	proc.stdout.on('data', function(data) 
	{
	    console.log(data.toString());
	});
	proc.stderr.on('data', function(data) 
	{
	    console.log(data.toString());
	    texture_compressor_state = Process_State.IDLE;
	});
	proc.on('close', function(data) 
	{
		console.log('closed')
		texture_compressor_state = Process_State.IDLE;
	});
}


function compress_texture(input, output, texture_type, overrides)
{
	/*
	-c, --compression ['astc', 'etc1', 'etc2', 'pvrtc1', 'dxt1', 'dxt3', 'dxt5'] [required]
	-t, --type ['astc', 'etc', 'pvr', 's3tc'] [required]
	*/

	var name = path.basename(input).split('.')[0];
	var file_type = '.ktx';

	var args = 
	{
		compression: 'astc',
		input: input,
		output: output + name + file_type,
		type: 'astc',
		quality: 5, //[0 - 10, default: 5]
		alpha: false,
		mipmap: 'true',
		flip: false,
		bitrate: 2.0
	};

	if(overrides)
	{
		for(var k in overrides) args[k] = overrides[k];
	}

	var format_index = 0;
	var formats = ['astc', 'etc', 'pvr', 's3tc'];
	
	var generate_formats = function()
	{
		switch(texture_compressor_state)
		{
			case Process_State.IDLE:
			{
				if(format_index >= formats.length) 
				{
					console.log('end')
					clearInterval(loop);
					return;
				}

				args.type = formats[format_index];

				console.log(args.type)

				switch(texture_type)
				{
					case Texture_Type.GRAYSCALE:
						if(args.type === 's3tc') args.compression = 'dxt1';
						if(args.type === 'astc') args.compression = 'astc';
						if(args.type === 'etc')  args.compression = 'etc1';
						if(args.type === 'pvr')  args.compression = 'pvrtc1';
						args.alpha = false;
					break;
					case Texture_Type.RGB:
						if(args.type === 's3tc') args.compression = 'dxt1';
						if(args.type === 'astc') args.compression = 'astc';
						if(args.type === 'etc')  args.compression = 'etc1';
						if(args.type === 'pvr')  args.compression = 'pvrtc1';
						args.alpha = false;
					break;
					case Texture_Type.RGBA:
						if(args.type === 's3tc') args.compression = 'dxt5';
						if(args.type === 'astc') args.compression = 'astc';
						if(args.type === 'etc')  args.compression = 'etc2';
						if(args.type === 'pvr')  args.compression = 'pvrtc1';
						args.alpha = true;
					break;
				}


				texture_compressor_state = Process_State.RUNNING;
				format_index++;
				run_texture_compressor(args);
				break;
			}
			case Process_State.RUNNING:
			{
				//console.log('running....')
				break;
			}
		}
	}

	var loop = setInterval(generate_formats, 0.5);
}

function minify_js(path, output)
{
	var code = read_file(path);
	var options = 
	{
		mangle: true,
		compress: 
		{
			drop_console: true,
			passes: 2,
		},
		output:
		{
			beautify: false,
		}
	};
	var result = uglify_js.minify(code);
	write_file(output, result.code);
}

function minify_css(path, output)
{
	var files = [path];
	var options = {};
	var result = uglify_css.processFiles(files, options);
	write_file(output, result);
}

function minify_html(path, output)
{
	var code = read_file(path);
	var options = 
	{
		minifyCSS: true,
		removeComments: true,
	};
	var result = html_minifier.minify(code, options);
	write_file(output, result);
}

function copy_file(from, to)
{
	console.log(to);

	fs.copyFileSync(from, to, (err) => 
	{ 
		console.log('Could not copy file: ' + path);
		if(err) throw err;
	});
}

function read_file(path)
{
	var result = fs.readFileSync(path, "utf8", (err) => 
	{
		console.log('Could not read file: ' + path);
		if(err) throw err;
	});
	return result;
}

function write_file(path, contents)
{
	fs.writeFileSync(path, contents, 'utf8', function(err)
	{
		console.log('Could not write file: ' + path);
		if(err) throw err;
	});
}

function build_app_dev()
{
	console.log('##### Building app in development mode #####');

	//TODO: turn processes into coroutines
	//TODO: go through assets/img folder
	//compress_texture('src/assets/img/boat.png', 'src/assets/compressed_img/', Texture_Type.RGB);
	
	var asset_args = 
	[
		'build.py',
	];

    var asset_compiler = child_process.spawn('python', asset_args);
    asset_compiler.stdout.on('data', function(data) 
	{
	    console.log(data.toString());
	});
	asset_compiler.on('close', function(data) 
	{
		// JS
		copy_file('src/js/app.js', 'build/js/app.js');
		copy_file('src/js/loader.js', 'build/js/loader.js');

		// CSS
		copy_file('src/css/style.css', 'build/css/style.css');
		copy_file('src/css/debug.css', 'build/css/debug.css');

		// HTML
		copy_file('src/html/webgl.html', 'build/webgl.html');
	});
	

	console.log('##### Finished #####');
}

function build_app_prod()
{
	console.log('##### Building app in production mode #####');

	run_process('python', ['build.py'], function()
	{
		minify_js('src/js/app.js', 'build/js/app.js');
		minify_js('src/js/loader.js', 'build/js/loader.js');
		minify_css('src/css/style.css', 'build/css/style.css');
		minify_html('src/html/webgl.html', 'build/webgl.html');
	});
}

var args = process.argv.slice(2);

var mode = args[0] || '--dev';
if(mode === '--prod' || mode === '--production')
{
	build_app_prod();
}
else
{
	build_app_dev();
}
