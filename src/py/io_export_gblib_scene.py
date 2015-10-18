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
	"name": "Export GBLIB Scene(.scene)",
	"author": "Gareth Battensby",
	"version": (1, 0),
	"blender": (2, 6, 0),
	"location": "File > Export > GBLIB (.scene)",
	"description": "Export GBLIB Binary (.scene)",
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

class FileWriter:
	target = None
	offset = 0

def write_int(writer, val):
	writer.target.write(pack("i", val))
	writer.offset += 4

def write_float(writer, val):
	writer.target.write(pack("f", val))
	writer.offset += 4

def write_str(writer, val):
	out_str = val.lower().encode('ascii')
	strlen = len(out_str)
	new_offset = writer.offset + strlen
	padding = 4 - (new_offset % 4);
	write_int(writer, padding)
	write_int(writer, strlen)
	writer.target.write(out_str)
	writer.offset += strlen
	for i in range(0, padding):
		writer.target.write(pack("B", 128))
		writer.offset += 1	

def write_bytes(writer, val):
	writer.target.write(val)
	writer.offset += len(val)

fp_precision = 3

def round_vec3(v):
	return round(v[0], fp_precision), round(v[1], fp_precision), round(v[2], fp_precision)

def round_vec2(v):
	return round(v[0], fp_precision), round(v[1], fp_precision)


def write_transform(writer, ob):
	if(ob.parent == None): 
		write_str(writer, "none")
	else:
		write_str(writer, ob.parent.name) 
	#hash this string instead

	write_float(writer, ob.location.x)
	write_float(writer, ob.location.y)
	write_float(writer, ob.location.z)
	write_float(writer, ob.scale.x)
	write_float(writer, ob.scale.y)
	write_float(writer, ob.scale.z)

	ob.rotation_mode = 'QUATERNION'
	write_float(writer, ob.rotation_quaternion.x)
	write_float(writer, ob.rotation_quaternion.y) 
	write_float(writer, ob.rotation_quaternion.z) 
	write_float(writer, ob.rotation_quaternion.w)
	ob.rotation_mode = 'XYZ'

def write_material(writer, ob):
	write_str(writer, ob.material_slots[0].material.name)

def write_empty(writer, ob):
	write_str(writer, ob.name)
	write_transform(writer, ob)

def write_object(writer, ob):
	write_str(writer, ob.name)
	write_transform(writer, ob)
	write_material(writer, ob)
	write_str(writer, ob.data.name)

def write_lamp(writer, ob):
	write_str(writer, ob.name)
	write_transform(writer, ob)
	lamp = bpy.data.lamps[ob.name]
	write_float(writer, lamp.energy)
	write_float(writer, lamp.distance)

def write_camera(writer, ob):
	write_str(writer, ob.name)
	write_transform(writer, ob)
	camera = bpy.data.cameras[ob.name]
	if camera.type == 'PERSP': write_int(writer, 0)
	else: write_int(writer, 1)
	write_float(writer, camera.clip_start)
	write_float(writer, camera.clip_end)
	write_float(writer, camera.lens)
		
def write_mesh(writer, mesh):
	#write_str(writer, name)
	#mesh = bpy.data.meshes[name]
	#write_str(writer, mesh.name)

	vertex_buffer = []
	index_buffer = []
	vertex_count = 0

	#need to create a dummy object to do triangulation

	matrix = mathutils.Matrix.Rotation(radians(-90.0), 4, 'X')
	mesh.transform(matrix)
	mesh.calc_normals()
	mesh.calc_tessface() 

	# Create a list for each vertex color layer
	color_layers = mesh.tessface_vertex_colors

	# Create a list for each uv layer
	uv_layers = mesh.tessface_uv_textures

	for i, f in enumerate(mesh.tessfaces): # For each face on mesh
		for j, v in enumerate(f.vertices): # For each vertex of face
		
			p = round_vec3(mesh.vertices[v].co)
			vertex_buffer.append(p[0])
			vertex_buffer.append(p[1])
			vertex_buffer.append(p[2])

			norm = round_vec3(mesh.vertices[v].normal)
			vertex_buffer.append(norm[0])
			vertex_buffer.append(norm[1])
			vertex_buffer.append(norm[2])

			for n, l in enumerate(uv_layers):
				uv = uv_layers[n].data[i].uv[j]
				uv = round_vec2(uv)
				vertex_buffer.append(uv[0])
				vertex_buffer.append(uv[1])

			for k, l in enumerate(color_layers):
				c = None;
				
				if(j == 0): 
					c = color_layers[k].data[i].color1
				elif(j == 1): 
					c = color_layers[k].data[i].color2
				elif(j == 2): 
					c = color_layers[k].data[i].color3
				else: 
					c = color_layers[k].data[i].color4
				
				c = round_vec3(c);
				vertex_buffer.append(c[0])
				vertex_buffer.append(c[1])
				vertex_buffer.append(c[2])
				vertex_buffer.append(1.0)
																					  
			index_buffer.append(vertex_count)
			vertex_count += 1

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
	
	vertex_data_ln = len(vertex_buffer)
	index_data_ln = len(index_buffer)
	
	write_int(writer, vertex_count)
	write_int(writer, vertex_data_ln)
	write_int(writer, index_data_ln)
	write_int(writer, offset_mask)

	for i in range(0, vertex_data_ln):
		write_float(writer, vertex_buffer[i])

	for i in range(0, index_data_ln):
		write_int(writer, index_buffer[i])


class ExportTest(bpy.types.Operator, ExportHelper):
	bl_idname = "export_gblib.test"
	bl_label = "Export GBLIB (.scene)"

	filename_ext = ".scene"
	filter_glob = StringProperty(default = "*.scene", options = {'HIDDEN'})

	def execute(self, context):
			
		scene = bpy.context.scene 

		filepath = self.filepath
		filepath = bpy.path.ensure_ext(filepath, self.filename_ext)

		writer = FileWriter()
		writer.target = open(filepath, "wb")
		writer.offset = 0 

		mesh_names = []
		exportable_meshes = []
		exportable_cameras = []
		exportable_lamps = []
		exportable_empties = []
		exportable_objects = []

		for ob in scene.objects:
			if ob.type == 'CAMERA': 
				exportable_cameras.append(ob)
			elif ob.type == 'LAMP': 
				exportable_lamps.append(ob)
			elif ob.type == 'MESH':
				exportable_objects.append(ob)

				modifiers = ob.modifiers
				has_triangulate = False
				for mod in modifiers:
					if(mod.type == 'TRIANGULATE'):
						has_triangulate = True

				if(not has_triangulate):
					modifiers.new("TEMP", type = 'TRIANGULATE')
				mesh = ob.to_mesh(scene = scene, apply_modifiers = True, settings = 'PREVIEW')

				if not mesh in exportable_meshes:
					mesh_names.append(ob.data.name) 
					exportable_meshes.append(mesh)

				if(not has_triangulate):
					modifiers.remove(modifiers[len(modifiers)-1])

			elif ob.type == 'EMPTY':
				exportable_empties.append(ob)

		write_int(writer, len(exportable_meshes))
		write_int(writer, len(exportable_cameras))
		write_int(writer, len(exportable_lamps))
		write_int(writer, len(exportable_empties))
		write_int(writer, len(exportable_objects))

		count = 0
		for mesh in exportable_meshes:
			name = mesh_names[count]
			print("Exporting Mesh: " + name)
			write_str(writer, name)
			write_mesh(writer, mesh)
			bpy.data.meshes.remove(mesh)
			count += 1

		for camera in exportable_cameras:
			print("Exporting Camera: " + camera.name)
			write_camera(writer, camera)

		for lamp in exportable_lamps:
			print("Exporting Lamp: " + lamp.name)
			write_lamp(writer, lamp)

		for empty in exportable_empties:
			print("Exporting Empty: " + empty.name)
			write_empty(writer, empty)

		for ob in exportable_objects:
			print("Exporting Object: " + ob.name)
			write_object(writer, ob)

		writer.target.close()
							
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
	self.layout.operator(ExportTest.bl_idname, text="GBLIB (.scene)")

def register():
	bpy.utils.register_module(__name__)
	bpy.types.INFO_MT_file_export.append(menu_func)

def unregister():
	bpy.utils.unregister_module(__name__)
	bpy.types.INFO_MT_file_export.remove(menu_func)
	
if __name__ == "__main__":
	register()