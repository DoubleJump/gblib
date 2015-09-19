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

def compile_mesh_file(name, src_file, writer):	
	b = src_file.read()
	write_str(writer, name)
	write_bytes(writer, b)
	return True

def compile_shader_file(name, src_file, writer):
	read_state = 0
	uniform_mvp = False
	uniform_camera = False
	uniform_lights = False
	vertex_shader_found = False
	fragment_shader_found = False

	vertex_src = ""
	fragment_src = ""

	for line in src_file:

		if read_state == 0:
			if line == "#MVP\n":
				uniform_mvp = True
			elif line == "#CAMERA\n":
				uniform_camera = True
			elif line == "#LIGHTS\n":
				uniform_lights = True
			elif line == "#VERTEX\n":
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

	uniform_mask = 0
	if uniform_mvp: uniform_mask |= 1
	if uniform_camera: uniform_mask |= 2
	if uniform_lights: uniform_mask |= 4

	write_str(writer, name)
	write_int(writer, uniform_mask)
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
	next_boundary = ((new_offset / 4) + 1) * 4
	padding = next_boundary - new_offset
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


class Asset:
	path = None
	name = None
	file_type = None


def main(argv = None):

	parser = argparse.ArgumentParser()
	parser.add_argument('--src', required=True)
	parser.add_argument('--dest', required=True)
	parser.add_argument('--target', required=True)

	args = parser.parse_args()
	src_dir = args.src
	target = args.target

	writer = FileWriter()
	writer.target = open(args.dest, "wb")
	writer.offset = 0 

	n_shaders = 0;
	n_meshes = 0;
	n_textures = 0;

	shaders = []
	meshes = []
	textures = []
	
	#count files
	for root, dirs, files in os.walk(src_dir):
		for f in files:
			split = f.split(".")
			asset = Asset()
			asset.name = split[0]
			asset.file_type = split[1]
			asset.path = os.path.join(root, f)
			if asset.file_type == "glsl":
				shaders.append(asset)
			elif asset.file_type == "mesh":
				meshes.append(asset)
			elif asset.file_type == "dds":
				textures.append(asset)
			elif asset.file_type == "pvr":
				textures.append(asset)

	write_int(writer, len(shaders))
	write_int(writer, len(meshes))
	write_int(writer, len(textures))

	for s in shaders:
		src = open(s.path, "r")
		if not compile_shader_file(s.name, src, writer):
			print "Error compiling shader: " + s.name + " ... exiting"
			src.close()
			break
		print "Compiled shader: " + s.name
		src.close()

	for m in meshes:
		src = open(m.path, "rb")
		if not compile_mesh_file(m.name, src, writer):
			print "Error compiling mesh: " + m.name + " ... exiting"
			src.close()
			break
		print "Compiled mesh: " + m.name
		src.close()

	for t in textures:
		src = open(t.path, "rb")
		if not compile_texture_file(t.name, t.file_type, src, writer):
			print "Error compiling texture: " + t.name + " ... exiting"
			src.close()
			break
		print "Compiled texture: " + t.name
		src.close()

	writer.target.close()


if __name__ == "__main__":
    main()