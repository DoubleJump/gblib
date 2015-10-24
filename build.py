import sys

if sys.version_info < (2, 7):
	print("This script requires at least Python 2.7.")
	print("Please, update to a newer version: http://www.python.org/download/releases/")

import os
import argparse


def read_file(name, directory, out_buffer, debug):
	print "Reading file: " + name
	read_state = 0
	src_file = open(directory + name, 'r')
	for line in src_file:
		if line.startswith('//INCLUDE'):
			name = line.split('//INCLUDE ')[1].rstrip('\n')
			read_file(name, directory, out_buffer, debug)
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
			

def main(argv = None):

	parser = argparse.ArgumentParser()
	parser.add_argument('--debug', action='store_true')
	parser.add_argument('--src', required=True)
	parser.add_argument('--dest', required=True)

	args = parser.parse_args()
	src_dir = os.path.dirname(args.src) + '//'
	src_file = os.path.basename(args.src)

	out_buffer = []

	read_file(src_file, src_dir, out_buffer, args.debug)

	out_file = open(args.dest, 'w')
	for l in out_buffer:
		out_file.write(l)


if __name__ == "__main__":
	main()