import sys

if sys.version_info < (2, 7):
	print("This script requires at least Python 2.7.")
	print("Please, update to a newer version: http://www.python.org/download/releases/")

import os
import argparse
from struct import pack

def compile_texture_file(name, ftype, src_file, writer):
	b = src_file.read()
	write_str(writer, name)
	if ftype == "dds":
		write_int(writer, 0);
	elif ftype == "pvr":
		write_int(writer, 1);
	write_bytes(writer, b)
	return True

def compile_scene_file(name, src_file, writer):	
	b = src_file.read()
	write_str(writer, name)
	write_bytes(writer, b)
	return True

def compile_shader_file(name, src_file, writer):
	read_state = 0
	uniform_mvp = False
	uniform_camera = False
	uniform_normals = False
	uniform_lights = False
	uniform_rig = False
	vertex_shader_found = False
	fragment_shader_found = False

	vertex_src = ""
	fragment_src = ""

	for line in src_file:

		if read_state == 0:
			if line == "#VERTEX\n":
				vertex_shader_found = True
				read_state = 1
		elif read_state == 1:
			if line == "#FRAGMENT\n":
				fragment_shader_found = True
				read_state = 2
			else:
				vertex_src += line
		elif read_state == 2:
			fragment_src += line

	if not vertex_shader_found:
		print "Could not find vertex shader in file: " + name
		return False

	if not fragment_shader_found:
		print "Could not find fragment shader in file: " + name
		return False

	write_str(writer, name)
	write_str(writer, vertex_src)
	write_str(writer, fragment_src)
	return True


class FileWriter:
	target = None
	offset = 0

def write_int(writer, val):
	writer.target.write(pack("i", val))
	writer.offset += 4

def write_str(writer, val):
	strlen = len(val)
	new_offset = writer.offset + strlen
	padding = 4 - (new_offset % 4);
	write_int(writer, padding)
	write_int(writer, strlen)
	writer.target.write(val)
	writer.offset += strlen
	for i in range(0, padding):
		writer.target.write(pack("B", 128))
		writer.offset += 1	

def write_bytes(writer, val):
	writer.target.write(val)
	writer.offset += len(val)

class AssetGroup:
	shaders = []
	textures = []
	scenes = []

class Asset:
	path = None
	name = None
	file_type = None


def find_assets(root, files, asset_group):
	for f in files:
		split = f.split(".")
		asset = Asset()
		asset.name = split[0]
		asset.file_type = split[1]
		asset.path = os.path.join(root, f)
		if asset.file_type == "glsl":
			asset_group.shaders.append(asset)
		elif asset.file_type == "scene":
			asset_group.scenes.append(asset)
		elif asset.file_type == "dds":
			asset_group.textures.append(asset)
		elif asset.file_type == "pvr":
			asset_group.textures.append(asset)	

def main(argv = None):

	parser = argparse.ArgumentParser()
	parser.add_argument('--src', required=True)
	parser.add_argument('--dest', required=True)
	parser.add_argument('--target', required=True)

	args = parser.parse_args()
	src_dir = args.src
	target = args.target

	print('###########################')
	print('Compiling target: ' + target)
	print('###########################')

	writer = FileWriter()
	writer.target = open(args.dest, "wb")
	writer.offset = 0 

	asset_group = AssetGroup()

	for root, dirs, files in os.walk(src_dir + 'common/'):
		find_assets(root, files, asset_group);

	if target is 'IOS':
		for root, dirs, files in os.walk(src_dir + 'ios/'):
			find_assets(root, files, asset_group)

	elif target is 'DESKTOP':
		for root, dirs, files in os.walk(src_dir + 'desktop/'):
			find_assets(root, files, asset_group)

	write_int(writer, len(asset_group.shaders))
	write_int(writer, len(asset_group.textures))
	write_int(writer, len(asset_group.scenes))

	for s in asset_group.shaders:
		src = open(s.path, "r")
		if not compile_shader_file(s.name, src, writer):
			print "Error compiling shader: " + s.name + " ... exiting"
			src.close()
			break
		print "Shader: " + s.name
		src.close()

	for t in asset_group.textures:
		src = open(t.path, "rb")
		if not compile_texture_file(t.name, t.file_type, src, writer):
			print "Error compiling texture: " + t.name + " ... exiting"
			src.close()
			break
		print "Texture: " + t.name
		src.close()

	for s in asset_group.scenes:
		src = open(s.path, "rb")
		if not compile_scene_file(s.name, src, writer):
			print "Error compiling scene: " + s.name + " ... exiting"
			src.close()
			break
		print "Scene: " + s.name
		src.close()

	writer.target.close()

if __name__ == "__main__":
    main()