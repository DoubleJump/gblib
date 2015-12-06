import os
import json

from file_system import *
import javascript
import html
import css
import assets

def compile(project_name):
	print('')
	print('Building Project: ' + project_name)
	print('-------------------------')
	print('')

	project_path = 'projects/' + project_name

	if not os.path.exists(project_path): print('ERROR: Project not found, exiting')
	
	build_path = 'build/' + project_name
	build_folders = ['', '/js', '/css', '/assets']
	for folder in build_folders:
		create_folder(build_path + folder)

	config = load_json(project_path + '/config/config.json')
	debug = config['debug']

	html.compile(
		project_path + '/html/index.html', 
		build_path + '/index.html')

	css.compile(
		project_path + '/css/style.scss', 
		build_path + '/css/style.css')

	javascript.compile(project_path + '/js/' + project_name + '.js', 
		build_path + '/js/' + project_name + '.js', 
		debug)

	assets.compile(project_path + '/assets/', 
		build_path + '/assets/assets.gl')
