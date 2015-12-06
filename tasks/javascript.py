def read_js(file_path, out_buffer, debug):
	print(file_path)
	read_state = 0
	src_file = open(file_path, 'r')
	for line in src_file:
		if line.startswith('//INCLUDE'):
			path = line.split('//INCLUDE ')[1].rstrip('\n')
			read_js(path, out_buffer, debug)
		else:
			if read_state is 0:
				if not debug and line.find('//DEBUG') is not -1:
					read_state = 1
				elif not debug and line.find('ASSERT') is not -1:
					continue
				elif not debug and line.find('LOG') is not -1:
					continue
				else:
					out_buffer.append(line)
			elif read_state is 1:
				if line.find('//END') is not -1:
					read_state = 0
				elif debug is True:
					out_buffer.append(line)

	out_buffer.append('\n')
	src_file.close()
			

def compile(file_path, destination_path, debug):
	out_buffer = []
	read_js(file_path, out_buffer, debug)

	out_file = open(destination_path, 'w')
	for line in out_buffer:
		out_file.write(line)

	out_file.close()
	print('')