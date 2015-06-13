# ##### BEGIN GPL LICENSE BLOCK #####
#
#  This program is free software; you can redistribute it and/or
#  modify it under the terms of the GNU General Public License
#  as published by the Free Software Foundation; either version 2
#  of the License, or (at your option) any later version.
#
#  This program is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU General Public License for more details.
#
#  You should have received a copy of the GNU General Public License
#  along with this program; if not, write to the Free Software Foundation,
#  Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
#
# ##### END GPL LICENSE BLOCK #####

bl_info = {
	"name": "Export Onyx Binary(.mesh)",
	"author": "Gareth Battensby",
	"version": (1, 0),
	"blender": (2, 6, 0),
	"location": "File > Export > Onyx (.mesh)",
	"description": "Export Onyx Binary (.mesh)",
	"warning": "",
	"wiki_url": "",
	"tracker_url": "",
	"category": "Import-Export"}

import bpy
from bpy.props import *
import mathutils, struct
from math import radians
from bpy_extras.io_utils import ExportHelper
from struct import pack

fp_precision = 3

def round_vec3(v):
	return round(v[0], fp_precision), round(v[1], fp_precision), round(v[2], fp_precision)

def round_vec2(v):
	return round(v[0], fp_precision), round(v[1], fp_precision)
	

class ExportTest(bpy.types.Operator, ExportHelper):
	bl_idname = "export_onyx_binary.test"
	bl_label = "Export Onyx (.mesh)"

	filename_ext = ".mesh"
	filter_glob = StringProperty(default = "*.mesh", options = {'HIDDEN'})
		
	@classmethod
	def poll(cls, context):
		return context.active_object.type in {'MESH', 'CURVE', 'SURFACE', 'FONT'}

	def execute(self, context):
	
		vertex_buffer = []
		index_buffer = []
		vertex_count = 0
		
		# Selected object, current scene
		scene = bpy.context.scene 
		obj = scene.objects.active
		modifiers = obj.modifiers
		
	
		has_triangulate = False
		for m in modifiers:
			if(m.type == 'TRIANGULATE'):
				has_triangulate = True

		if(not has_triangulate):
			modifiers.new("Onyx", type = 'TRIANGULATE')
		

		# Rotate model to Onyx coordinate system
		matrix = mathutils.Matrix.Rotation(radians(-90.0), 4, 'X')

		# Tesselate and triangulate mesh
		mesh = obj.to_mesh(scene = bpy.context.scene, apply_modifiers = True, settings = 'PREVIEW')
		mesh.transform(matrix)
		mesh.calc_normals()
		mesh.calc_tessface() 

		if(not has_triangulate):
			modifiers.remove(modifiers[len(modifiers)-1])

		# Create a list for each vertex color layer
		color_layers = mesh.tessface_vertex_colors

		# Create a list for each uv layer
		uv_layers = mesh.tessface_uv_textures

		#visited_verts = []
		#visited_normals = []
		#visited_indices = []

		for i, f in enumerate(mesh.tessfaces): # For each face on mesh
			for j, v in enumerate(f.vertices): # For each vertex of face
		
				p = round_vec3(mesh.vertices[v].co)
				norm = round_vec3(mesh.vertices[v].normal)
				#norm = round_vec3(f.normal)

				'''
				found = False
				for index, f_vert in enumerate(visited_verts):
					fn = visited_normals[index]

					if (p[0] == f_vert[0] and p[1] == f_vert[1] and p[2] == f_vert[2]) and (norm[0] == fn[0] and norm[1] == fn[1] and norm[2] == fn[2]):

						#print(str(visited_indices[index]))
						index_buffer.append(visited_indices[index])
						found = True
						break

				if found is True:
					continue

				visited_verts.append(p)
				visited_normals.append(norm)
				visited_indices.append(vertex_count)
				'''
				
				vertex_buffer.append(p[0])
				vertex_buffer.append(p[1])
				vertex_buffer.append(p[2])

				vertex_buffer.append(norm[0])
				vertex_buffer.append(norm[1])
				vertex_buffer.append(norm[2])

				for n, l in enumerate(uv_layers):
					uv = uv_layers[n].data[i].uv[j]
					uv = round_vec2(uv)
					vertex_buffer.append(uv[0])
					vertex_buffer.append(uv[1])

				for k, l in enumerate(color_layers): # For each vertex color layer
					c = None;
					
					if(j == 0): #color is for vertex1 of face 
						c = color_layers[k].data[i].color1
					elif(j == 1):
						c = color_layers[k].data[i].color2
					elif(j == 2):
						c = color_layers[k].data[i].color3
					else:
						c = color_layers[k].data[i].color4 # should never happen but just in case
					
					c = round_vec3(c);
					vertex_buffer.append(c[0])
					vertex_buffer.append(c[1])
					vertex_buffer.append(c[2])
					vertex_buffer.append(c[3])
																						  
				index_buffer.append(vertex_count)
				vertex_count += 1
				          				
		filepath = self.filepath
		filepath = bpy.path.ensure_ext(filepath, self.filename_ext)
		file = open(filepath, "wb")

		name_ln = len(obj.name)
		uv_ln = len(uv_layers)
		color_ln = len(color_layers)

		offset_mask = 1 | 2 #positon and normal
		if(uv_ln == 1): offset_mask |= 4
		elif(uv_ln == 2): 
			offset_mask |= 4
			offset_mask |= 8
		if(color_ln == 1): offset_mask |= 16
		elif(color_ln == 2): 
			offset_mask |= 16
			offset_mask |= 32 
		
		vertex_data_ln = len(vertex_buffer);
		index_data_ln = len(index_buffer);

		file.write(pack('i', vertex_count))
		file.write(pack('i', vertex_data_ln))
		file.write(pack('i', index_data_ln))
		file.write(pack('i', offset_mask))

		for i in range(0, vertex_data_ln):
			file.write(pack('f', vertex_buffer[i]))

		for i in range(0, index_data_ln):
			file.write(pack('i', index_buffer[i]))		

		file.close()
							
		return {'FINISHED'}


	def invoke(self, context, event):
		wm = context.window_manager

		if True:
			wm.fileselect_add(self) # will run self.execute()
			return {'RUNNING_MODAL'}
		elif True:
			wm.invoke_search_popup(self)
			return {'RUNNING_MODAL'}
		elif False:
			return wm.invoke_props_popup(self, event)
		elif False:
			return self.execute(context)


### REGISTER ###

def menu_func(self, context):
	self.layout.operator(ExportTest.bl_idname, text="Onyx (.mesh)")

def register():
	bpy.utils.register_module(__name__)
	bpy.types.INFO_MT_file_export.append(menu_func)

def unregister():
	bpy.utils.unregister_module(__name__)
	bpy.types.INFO_MT_file_export.remove(menu_func)
	
if __name__ == "__main__":
	register()
