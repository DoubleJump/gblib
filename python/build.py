import os
import shutil
import argparse
from struct import pack

ASSET_TYPE_GLSL = 0
ASSET_TYPE_SCENE = 1
ASSET_TYPE_FONT = 2
ASSET_TYPE_END = -1

def copy_file(src, dest):
	shutil.copy(src, dest)

class FileWriter:
	def __init__(self, path):
		self.target = open(path, "wb")
		self.offset = 0
		self.file_start = 0
		self.BYTE_PADDING = 4

	def close(self):
		self.target.close()

	def i32(self, val):
		self.target.write(pack("i", val))
		self.offset += 4

	def f32(self, val):
		self.target.write(pack("f", val))
		self.offset += 4

	def string(self, val):
		str_encoded = val.encode('ascii')
		str_len = len(str_encoded)
		new_offset = self.offset + str_len
		padding = self.BYTE_PADDING - (new_offset % self.BYTE_PADDING);
		self.i32(padding)
		self.i32(str_len)
		self.target.write(str_encoded)
		self.offset += str_len
		for i in range(0, padding):
			self.target.write(pack("B", 128))
			self.offset += 1	

	def bytes(self, val):
		self.target.write(val)
		self.offset += len(val)


def compile_binary(name, read_path, writer, type):
	print(read_path)
	file = open(read_path, 'rb')
	writer.i32(type)
	writer.string(name)
	writer.bytes(file.read())
	file.close()

def read_glsl(read_path, output):
	file = open(read_path, 'r')
	for line in file:
		if line.startswith('//import'):
			path = line.split('//import ')[1].rstrip('\n').rstrip('\r')
			read_glsl(path, output)
		else:
			output.append(line)
	file.close()
	print(read_path)

def compile_glsl(name, read_path, writer):
	output = []
	read_glsl(read_path, output)

	read_state = 0
	vertex_shader_found = False
	fragment_shader_found = False

	vertex_src = ""
	fragment_src = ""

	for line in output:
		if read_state == 0:
			if line.startswith("#VERTEX"):
				vertex_shader_found = True
				read_state = 1
		elif read_state == 1:
			if line.startswith("#FRAGMENT"):
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

	#print(file_path)
	writer.i32(ASSET_TYPE_GLSL)
	writer.string(name)
	writer.string(vertex_src)
	writer.string(fragment_src)

def compile_assets(dir, write_path):
	writer = FileWriter(write_path)

	for root, directories, files in os.walk(dir):
		for f in files:
			split = f.split(".")
			name = split[0]
			file_type = split[1]
			path = os.path.join(root, f)

			if file_type == 'glsl': compile_glsl(name, path, writer)
			elif file_type == 'scene': compile_binary(name, path, writer, ASSET_TYPE_SCENE)
			elif file_type == 'font':   compile_binary(name, path, writer, ASSET_TYPE_FONT)

	writer.i32(ASSET_TYPE_END)
	writer.close()


def read_js(read_path, output, debug):
	print(read_path)
	read_state = 0
	file = open(read_path, 'r')
	for line in file:
		if line.startswith('//import'):
			path = line.split('//import ')[1].rstrip('\n').rstrip('\r')
			read_js(path, output, debug)
		else:

			if read_state is 0:
				if not debug:
					if   line.find('//DEBUG') is not -1: read_state = 1
					elif line.find('ASSERT')  is not -1: continue
					elif line.find('LOG') 	  is not -1: continue
					else: output.append(line)
				else:
					output.append(line)

			elif read_state is 1:
				if line.find('//END') is not -1: read_state = 0
				elif debug is True: output.append(line)

	output.append('\n')
	file.close()


def compile_js(read_path, write_path, debug):
	
	output = [];
	file = open(write_path, 'w')
	read_js(read_path, output, debug)
	for line in output: file.write(line)
	file.close()

	print('')


def compile_markup(src, dst):
	print(src)
	shutil.copy(src, dst)

def build():
	parser = argparse.ArgumentParser()
	parser.add_argument('--debug', required=True)
	args = parser.parse_args()
	debug = args.debug == 'True'

	print('')

	compile_markup('src/html/app.html', 'build/app.html')

	print('')

	compile_js('src/js/webgl/main.js', 'build/js/webgl.js', debug)
	compile_js('src/js/app.js', 'build/js/app.js', debug)

	compile_assets('src/assets', 'build/assets/app.bin')

	print('')

build()
