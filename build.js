'use strict'

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var uglify_js = require('uglify-js');
var uglify_css = require('uglifycss');
var html_minifier = require('html-minifier');

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
		copy_file('src/js/loader.js', 'build/js/loader.js');
		copy_file('src/js/app.js', 'build/js/app.js');

		// CSS
		copy_file('src/css/style.css', 'build/css/style.css');
		copy_file('src/css/debug.css', 'build/css/debug.css');

		// HTML
		copy_file('src/html/webgl.html', 'build/webgl.html');
	});
}

function build_app_prod()
{
	console.log('##### Building app in production mode #####');

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
		minify_js('src/js/app.js', 'build/js/app.js');
		minify_js('src/js/loader.js', 'build/js/loader.js');

		// CSS
		minify_css('src/css/style.css', 'build/css/style.css');

		// HTML
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
