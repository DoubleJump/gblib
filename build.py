import os
import shutil
from struct import pack, unpack

LOG_LEVEL = 0

ASSET_TYPE_GLSL = 0
ASSET_TYPE_SCENE = 1
ASSET_TYPE_FONT = 2
ASSET_TYPE_PNG = 3
ASSET_TYPE_JPG = 15
ASSET_TYPE_DDS = 16
ASSET_TYPE_PVR = 17
ASSET_TYPE_END = -1

TEXTURE_RGB = 0
TEXTURE_RGBA = 1
TEXTURE_DEPTH = 2
TEXTURE_GRAYSCALE = 3

def copy_file(src, dest):
	shutil.copy(src, dest)

class FileWriter:
	def __init__(self, path):
		self.target = open(path, "wb")
		self.offset = 0
		self.file_start = 0
		self.BYTE_ALIGNMENT = 4

	def close(self):
		self.target.close()

	def padding(self, size):
		return (self.BYTE_ALIGNMENT - size % self.BYTE_ALIGNMENT) % self.BYTE_ALIGNMENT

	def i32(self, val):
		self.target.write(pack("i", val))
		self.offset += 4

	def u32(self, val):
		self.target.write(pack("I", val))
		self.offset += 4

	def f64(self, val):
		self.target.write(pack("d", val))
		self.offset += 8

	def f32(self, val):
		self.target.write(pack("f", val))
		self.offset += 4

	def string(self, val):
		str_encoded = val.encode('ascii')
		#str_encoded += '\0'.encode('ascii') #for c strings only!!
		size = len(str_encoded)
		pad = self.padding(size)

		self.i32(size)
		self.target.write(str_encoded)
		for i in range(0, pad):
			self.target.write(pack("x"))
		self.offset += size + pad

	def bytes(self, val):
		size = len(val)
		pad = self.padding(size)
		self.target.write(val)
		for i in range(0, pad):
			self.target.write(pack("x"))
		self.offset += size + pad


def compile_binary(name, read_path, writer, type):
	log(read_path)
	writer.i32(type)
	file_size = os.path.getsize(read_path)
	writer.u32(file_size)

	file = open(read_path, 'rb')
	writer.string(name)
	writer.bytes(file.read())
	file.close()


def read_glsl(read_path, output):
	file = open(read_path, 'r')
	for line in file:
		if line.startswith('//import'):
			path = line.split('//import ')[1].rstrip('\n').rstrip('\r')
			output.append('\n')
			read_glsl(path, output)
		else:
			output.append(line)
	file.close()
	#log(read_path)

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
		log("Could not find vertex shader in file: " + name)
		return False

	if not fragment_shader_found:
		log("Could not find fragment shader in file: " + name)
		return False

	log(read_path)
	writer.i32(ASSET_TYPE_GLSL)
	writer.string(name)
	writer.string(vertex_src)
	writer.string(fragment_src)

def compile_img(name, read_path, writer, type):
	log(read_path)
	file = open(read_path, 'rb')
	data = file.read()

	width = 0
	height = 0
	fmt = TEXTURE_RGBA

	if type is ASSET_TYPE_PNG:
		w, h = unpack('>LL', data[16:24])
		width = int(w)
		height = int(h)
		fmt = TEXTURE_RGBA

	if type is ASSET_TYPE_JPG:
		fmt = TEXTURE_RGB
		try:
			file.seek(0)
			size = 2
			ftype = 0
			while not 0xc0 <= ftype <= 0xcf:
				file.seek(size, 1)
				byte = file.read(1)
				while ord(byte) == 0xff:
					byte = file.read(1)
				ftype = ord(byte)
				size = unpack('>H', file.read(2))[0] - 2
			file.seek(1, 1)
			h, w = unpack('>HH', file.read(4))
			width = int(w)
			height = int(h)
		except Exception:
			pass

	#print(width)
	#print(height)
	#print(fmt)

	writer.i32(type)
	writer.string(name)
	writer.i32(width)
	writer.i32(height)
	writer.i32(fmt)
	writer.f64(len(data))
	writer.bytes(data)
	file.close()


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
			elif file_type == 'font': compile_font(name, path, writer)
			elif file_type == 'png': compile_img(name, path, writer, ASSET_TYPE_PNG)
			elif file_type == 'jpg': compile_img(name, path, writer, ASSET_TYPE_JPG)

	writer.i32(ASSET_TYPE_END)
	writer.close()


def read_js(read_path, output, debug):
	log(read_path)
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

	log('')


def compile_markup(src, dst):
	log(src)
	shutil.copy(src, dst)

def log(msg):
	if LOG_LEVEL == 1: print(msg)

def build():

	debug = True
	minify = False

	global LOG_LEVEL
	LOG_LEVEL = 1

	compile_js('src/js/manifest.js', 'src/js/app.js', debug)
	compile_assets('src/common', 'build/assets/common.txt')

	log('')

build()