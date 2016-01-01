from file_system import *
import compile_project

def create_html_boilerplate(project_path, name):
	html_file = open(project_path + '/html/index.html', 'w')
	html_string = """<!DOCTYPE html>
<html>
<head>

	<meta charset='utf-8'/>
	<meta name='viewport' content='width=device-width, initial-scale=1.0, user-scalable=no'>
	<title>"""+name+"""</title> 
	<link rel='stylesheet' href='css/style.css' type='text/css'>
	<link rel='stylesheet' href='../../lib/css/debug.css' type='text/css'>

</head>
<body>
	<div class='webgl'></div>
	<script src='js/""" + name + """.js'></script>
</body>
</html>"""

	html_file.write(html_string)
	html_file.close()

def create_js_boilerplate(project_path, name):
	copy_file('lib/js/gblib.js', project_path + '/js/gblib.js')
	copy_file('lib/js/demo.js', project_path + '/js/' + name + '.js')
	project_file = open(project_path + '/js/' + name + '.js', 'r+')
	content = project_file.read()
	project_file.seek(0,0)
	project_file.write('//INCLUDE projects/' + name + '/js/gblib.js' + content + '\n\n')
	project_file.close()

def create(name):
	print('')
	print('Creating Project: ' + name)
	print('-------------------------')
	print('')

	#create project folders
	project_path = 'projects/' + name
	folders = ['', '/config', '/html', '/css', '/js', 
	'/assets/scenes', '/assets/meshes', '/assets/animations', '/assets/textures', '/assets/glsl']

	for f in folders:
		create_folder(project_path + f)

	#copy in boilerplate files
	create_html_boilerplate(project_path, name)
	copy_file('lib/config/config.json', project_path + '/config/config.json') 
	copy_file('lib/css/style.scss', project_path + '/css/style.scss')
	create_js_boilerplate(project_path, name)
	copy_file('lib/glsl/final.glsl', project_path + '/assets/glsl/final.glsl')
	copy_file('lib/glsl/fxaa.glsl', project_path + '/assets/glsl/fxaa.glsl')
	copy_file('lib/glsl/surface.glsl', project_path + '/assets/glsl/surface.glsl')

	compile_project.compile(name)