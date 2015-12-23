import os
import json
import shutil
from struct import pack

def copy_file(src, dest):
	shutil.copy(src, dest)

def create_folder(path):
	if not os.path.exists(path): 
		os.makedirs(path)
		print('+ ' + path)

def load_json(path):
	json_file = open(path)
	json_str = json_file.read()
	parsed = json.loads(json_str)
	json_file.close()
	return parsed


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