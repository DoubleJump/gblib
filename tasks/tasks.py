import sys
import os
import argparse

import new_project
import compile_project

def main(argv = None):

	parser = argparse.ArgumentParser()
	parser.add_argument('--new', required=False)
	parser.add_argument('--build', required=False)

	args = parser.parse_args()
	new_project_name = args.new
	build_project_name = args.build

	if new_project_name:
		new_project.create(new_project_name)
	elif build_project_name:
		compile_project.compile(build_project_name)


if __name__ == "__main__":
    main()