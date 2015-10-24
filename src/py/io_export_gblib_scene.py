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

FP_PRECISION = 3

OB_TYPE_CAMERA = 0
OB_TYPE_LAMP = 1
OB_TYPE_MESH = 2
OB_TYPE_MATERIAL = 3
OB_TYPE_ACTION = 4
OB_TYPE_OBJECT = 5
OB_TYPE_EMPTY = 6
OB_TYPE_FILE_END = -101

def round_vec3(v):
	return round(v[0], FP_PRECISION), round(v[1], FP_PRECISION), round(v[2], FP_PRECISION)

def round_vec2(v):
	return round(v[0], FP_PRECISION), round(v[1], FP_PRECISION)

class FileWriter:
	target = None
	offset = 0
	BYTE_PADDING = 4

def write_int(writer, val):
	writer.target.write(pack("i", val))
	writer.offset += 4

def write_float(writer, val):
	writer.target.write(pack("f", val))
	writer.offset += 4

def write_vec3(writer, val):
	write_float(writer, val.x)
	write_float(writer, val.y)
	write_float(writer, val.z)

def write_quat(writer, val):
	write_float(writer, val.x)
	write_float(writer, val.y)
	write_float(writer, val.z)
	write_float(writer, val.w)

def write_str(writer, val):
	out_str = val.lower().encode('ascii')
	strlen = len(out_str)
	new_offset = writer.offset + strlen
	padding = writer.BYTE_PADDING - (new_offset % writer.BYTE_PADDING);
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

def write_transform(writer, ob):
	if(ob.parent == None): write_str(writer, "none")
	else: write_str(writer, ob.parent.name) 

	write_vec3(writer, ob.location)
	write_vec3(writer, ob.scale)

	ob.rotation_mode = 'QUATERNION'
	write_quat(writer, ob.rotation_quaternion)
	ob.rotation_mode = 'XYZ'

def write_material(writer, material):
	print("Exporting Material: " + material.name)
	write_int(writer, OB_TYPE_MATERIAL)
	write_str(writer, material.name)
	write_str(writer, material['shader'])

	num_textures = 0
	for i in material.texture_slots:
		if i == None: continue
		texture = bpy.data.textures[i.name]
		if texture.image == None: continue
		num_textures += 1

	write_int(writer, num_textures)
	
	for i in material.texture_slots:
		if i == None: continue
		texture = bpy.data.textures[i.name]
		if texture.image == None: continue
		write_str(writer, texture.image.name.split('.')[0])
		write_str(writer, texture['sampler'])

def write_empty(writer, ob):
	print("Exporting Empty: " + ob.name)
	write_int(writer, OB_TYPE_EMPTY)
	write_str(writer, ob.name)
	write_transform(writer, ob)

def write_object(writer, ob):
	print("Exporting Object: " + ob.name)
	write_int(writer, OB_TYPE_OBJECT)
	write_str(writer, ob.name)
	write_transform(writer, ob)
	write_str(writer, ob.material_slots[0].material.name) #our material
	write_str(writer, ob.data.name) #our mesh

def write_lamp(writer, ob, lamp):
	print("Exporting Lamp: " + ob.name)
	write_int(writer, OB_TYPE_LAMP)
	write_str(writer, ob.name)
	write_transform(writer, ob)
	#lamp = bpy.data.lamps[ob.name]
	write_float(writer, lamp.energy)
	write_float(writer, lamp.distance)

def write_camera(writer, ob, camera):
	print("Exporting Camera: " + ob.name)
	write_int(writer, OB_TYPE_CAMERA)
	write_str(writer, ob.name)
	write_transform(writer, ob)
	#camera = bpy.data.cameras[ob.name]
	if camera.type == 'PERSP': write_int(writer, 0)
	else: write_int(writer, 1)
	write_float(writer, camera.clip_start)
	write_float(writer, camera.clip_end)
	write_float(writer, camera.lens)
		
def write_mesh(writer, ob, mesh):
	print("Exporting Mesh: " + ob.data.name)
	write_int(writer, OB_TYPE_MESH)
	write_str(writer, ob.data.name)

	vertex_buffer = []
	index_buffer = []
	vertex_count = 0

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

def write_action(writer, action, owner, scene):
	print("Exporting Action: " + action.name)
	write_int(writer, OB_TYPE_ACTION)
	write_str(writer, action.name)
	write_int(writer, len(action.fcurves))
	for curve in action.fcurves:
		prop = curve.data_path
		data_type = owner.path_resolve(prop)
		
		if prop == 'location': prop = 'position'
		elif prop == 'rotation_euler': prop = 'rotation'
		
		print(prop)
		write_str(writer, prop)
		if type(data_type) is float:
			write_int(writer, -1)
		else: write_int(writer, curve.array_index)
		
		write_int(writer, len(curve.keyframe_points))
		for keyframe in curve.keyframe_points:
			write_float(writer, keyframe.co[0] / scene.render.fps)
			write_float(writer, keyframe.co[1])
			write_float(writer, keyframe.handle_left[0])
			write_float(writer, keyframe.handle_left[1])
			write_float(writer, keyframe.handle_right[0])
			write_float(writer, keyframe.handle_right[1])


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

		exported_meshes = []
		exported_actions = []
		exported_materials = []
		exported_cameras = []
		exported_lamps = []

		print("")
		print("######### EXPORTING SCENE: " + scene.name + " ###########")
		print("")

		for ob in scene.objects:
			
			if not ob.animation_data is None:
				action = ob.animation_data.action
				if not action is None:
					if not action in exported_actions:
						write_action(writer, action, ob, scene)
						exported_actions.append(action)

			if ob.type == 'CAMERA': 
				camera = ob.data
				if not camera in exported_cameras:
					if not camera.animation_data is None:
						action = camera.animation_data.action
						if not action is None:
							if not action in exported_actions:
								write_action(writer, action, ob, scene)
								exported_actions.append(action)

					write_camera(writer, ob, camera)
					exported_cameras.append(camera)

			elif ob.type == 'LAMP': 
				lamp = ob.data
				if not lamp in exported_lamps:
					if not lamp.animation_data is None:
						action = lamp.animation_data.action
						if not action is None:
							if not action in exported_actions:
								write_action(writer, action, ob, scene)
								exported_actions.append(action)
				
					write_lamp(writer, ob, lamp)
					exported_lamps.append(lamp)

			elif ob.type == 'MESH':
				material = ob.material_slots[0].material
				if not material is None:
					if not material in exported_materials:
						if not material.animation_data is None:
							action = material.animation_data.action
							if not action is None:
								if not action in exported_actions:
									write_action(writer, action, ob, scene)
									exported_actions.append(action)

						write_material(writer, material)
						exported_materials.append(material)

				modifiers = ob.modifiers
				has_triangulate = False
				for mod in modifiers:
					if(mod.type == 'TRIANGULATE'):
						has_triangulate = True

				if not has_triangulate:
					modifiers.new("TEMP", type = 'TRIANGULATE')

				mesh = ob.to_mesh(scene = scene, apply_modifiers = True, settings = 'PREVIEW')

				if not ob.data.name in exported_meshes:
					write_mesh(writer, ob, mesh)
					exported_meshes.append(ob.data.name)
					bpy.data.meshes.remove(mesh)

				if(not has_triangulate):
					modifiers.remove(modifiers[len(modifiers)-1])

				write_object(writer, ob)

			elif ob.type == 'EMPTY':
				write_empty(writer, ob)

		write_int(writer, OB_TYPE_FILE_END)
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