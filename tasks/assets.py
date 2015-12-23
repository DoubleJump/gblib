from file_system import *

ASSET_TYPE_GLSL = 0
ASSET_TYPE_SCENE = 1
ASSET_TYPE_DDS = 2
ASSET_TYPE_PVR = 3
ASSET_TYPE_END = -1

def compile_dds(name, file_path, writer):
	print(file_path)
	src_file = open(file_path, 'rb')
	writer.i32(ASSET_TYPE_DDS)
	writer.string(name)
	writer.bytes(src_file.read())
	src_file.close()
	return True

def compile_pvr(name, file_path, writer):
	print(file_path)
	src_file = open(file_path, 'rb')
	writer.i32(ASSET_TYPE_PVR)
	writer.string(name)
	writer.bytes(src_file.read())
	src_file.close()
	return True

def compile_scene(name, file_path, writer):
	print(file_path)
	src_file = open(file_path, 'rb')
	writer.i32(ASSET_TYPE_SCENE)
	writer.string(name)
	writer.bytes(src_file.read())
	src_file.close()
	return True

def read_glsl(file_path, out_buffer):
	src_file = open(file_path, 'r')
	for line in src_file:
		if line.startswith('//INCLUDE'):
			path = line.split('//INCLUDE ')[1].rstrip('\n')
			read_glsl(path, out_buffer)
		else:
			out_buffer.append(line)
	src_file.close()

def compile_glsl(name, file_path, writer):
	out_buffer = []
	read_glsl(file_path, out_buffer)

	read_state = 0
	vertex_shader_found = False
	fragment_shader_found = False

	vertex_src = ""
	fragment_src = ""

	for line in out_buffer:
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

	print(file_path)
	writer.i32(ASSET_TYPE_GLSL)
	writer.string(name)
	writer.string(vertex_src)
	writer.string(fragment_src)
	return True


def compile(directory, destination_path):
	writer = FileWriter(destination_path)

	for root, directories, files in os.walk(directory):
		for f in files:
			split = f.split(".")
			name = split[0]
			file_type = split[1]
			path = os.path.join(root, f)

			if file_type == 'glsl': compile_glsl(name, path, writer)
			elif file_type == 'scene': compile_scene(name, path, writer)
			elif file_type == 'dds': compile_dds(name, path, writer)
			elif file_tpe == 'pvr': compile_pbr(name, path, writer)

	writer.i32(ASSET_TYPE_END)
	writer.close()