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
OB_TYPE_ARMATURE = 7
OB_TYPE_ARMATURE_ACTION = 8
OB_TYPE_FILE_END = -101

GB_MATRIX = mathutils.Matrix.Rotation(radians(-90.0), 4, 'X')

def round_vec3(v):
	return round(v[0], FP_PRECISION), round(v[1], FP_PRECISION), round(v[2], FP_PRECISION)

def round_vec2(v):
	return round(v[0], FP_PRECISION), round(v[1], FP_PRECISION)

class FileWriter:
	def __init__(self, path):
		self.target = open(path, "wb")
		self.offset = 0
		self.BYTE_PADDING = 4

	def close(self):
		self.target.close()

	def i32(self, val):
		self.target.write(pack("i", val))
		self.offset += 4

	def f32(self, val):
		self.target.write(pack("f", val))
		self.offset += 4

	def vec3(self, val):
		self.f32(val.x)
		self.f32(val.y)
		self.f32(val.z)

	def quaternion(self, val):
		self.f32(val.x)
		self.f32(val.y)
		self.f32(val.z)
		self.f32(val.w)

	def mat4(self, val):
		matrix = val.transposed()
		for i in range(0,4):
			for j in range(0,4):
				self.f32(matrix[i][j])

	def string(self, val):
		str_encoded = val.lower().encode('ascii')
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
	
	def transform(self, transform):
		if(transform.parent == None): self.string("none")
		else: self.string(transform.parent.name) 
		transform.rotation_mode = 'QUATERNION'
		self.vec3(transform.location)
		self.vec3(transform.scale)
		self.quaternion(transform.rotation_quaternion)

	def material(self, material):
		print("Exporting Material: " + material.name)
		self.i32(OB_TYPE_MATERIAL)
		self.string(material.name)
		self.string(material['shader'])

		num_textures = 0
		for i in material.texture_slots:
			if i == None: continue
			texture = bpy.data.textures[i.name]
			if texture.image == None: continue
			num_textures += 1

		self.i32(num_textures)
		
		for i in material.texture_slots:
			if i == None: continue
			texture = bpy.data.textures[i.name]
			if texture.image == None: continue
			self.string(texture.image.name.split('.')[0])
			self.string(texture['sampler'])

	def empty(self, empty):
		print("Exporting Empty: " + empty.name)
		self.i32(OB_TYPE_EMPTY)
		self.string(empty.name)
		self.transform(empty)

	def object(self, ob):
		print("Exporting Object: " + ob.name)
		self.i32(OB_TYPE_OBJECT)
		self.string(ob.name)
		self.transform(ob)
		self.string(ob.material_slots[0].material.name) #our material
		self.string(ob.data.name) #our mesh

	def lamp(self, ob, lamp):
		print("Exporting Lamp: " + ob.name)
		self.i32(OB_TYPE_LAMP)
		self.string(ob.name)
		self.transform(ob)
		self.f32(lamp.energy)
		self.f32(lamp.distance)

	def camera(self, ob, camera):
		print("Exporting Camera: " + ob.name)
		self.i32(OB_TYPE_CAMERA)
		self.string(ob.name)
		self.transform(ob)
		if camera.type == 'PERSP': 
			self.i32(0)
		else: 
			self.i32(1)
			self.f32(camera.ortho_scale)
		self.f32(camera.clip_start)
		self.f32(camera.clip_end)
		self.f32(camera.lens)

	def armature(self, ob):
		print("Exporting Armature: " + ob.name)

		self.i32(OB_TYPE_ARMATURE)
		self.string(ob.name)

		armature_ob = bpy.data.objects[ob.name]
		armature_data = bpy.data.armatures[ob.name]
		num_bones = len(armature_data.bones)
		self.i32(num_bones)

		index = 0
		bone_ids = {}
		for bone in armature_data.bones:

			local_matrix = bone.matrix_local
			world_matrix = bone.matrix_local

			if bone.parent is None:
				self.i32(-1)
			else:
				self.i32(bone_ids[bone.parent.name])
				local_matrix = bone.parent.matrix_local.inverted() * bone.matrix_local

			self.mat4(local_matrix)
			self.mat4(world_matrix.inverted()) #inverse bind pose

			bone_ids[bone.name] = index
			index += 1
		
	def mesh(self, ob, scene):
		print("Exporting Mesh: " + ob.data.name)

		modifiers = ob.modifiers
		has_triangulate = False
		for mod in modifiers:
			if(mod.type == 'TRIANGULATE'):
				has_triangulate = True

		if not has_triangulate:
			modifiers.new("TEMP", type = 'TRIANGULATE')

		mesh = ob.to_mesh(scene = scene, apply_modifiers = True, settings = 'PREVIEW')

		self.i32(OB_TYPE_MESH)
		self.string(ob.data.name)

		armature = None
		modifiers = ob.modifiers
		for mod in modifiers:
			if(mod.type == 'ARMATURE'):
				armature = mod.object

		vertex_buffer = []
		index_buffer = []
		vertex_count = 0

		#mesh.transform(matrix)
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
					if(j == 0): c = color_layers[k].data[i].color1
					elif(j == 1): c = color_layers[k].data[i].color2
					elif(j == 2): c = color_layers[k].data[i].color3
					else: c = color_layers[k].data[i].color4
					c = round_vec3(c);
					vertex_buffer.append(c[0])
					vertex_buffer.append(c[1])
					vertex_buffer.append(c[2])
					vertex_buffer.append(1.0)
																						  
				index_buffer.append(vertex_count)

				if armature:
					groups = mesh.vertices[v].groups
					num_groups = len(groups)
					if num_groups is 0:
						vertex_buffer.append(0)
						vertex_buffer.append(0.5)
						vertex_buffer.append(0)
						vertex_buffer.append(0.5)
					elif num_groups is 1:
						for g in groups:
							group_index = 0
							vertex_group = ob.vertex_groups[g.group]
							for b in armature.pose.bones:
								if b.name == vertex_group.name: 
									vertex_buffer.append(group_index)
									vertex_buffer.append(g.weight)
									break
								group_index += 1

						vertex_buffer.append(0)
						vertex_buffer.append(0)
					else:
						for g in groups:
							group_index = 0
							vertex_group = ob.vertex_groups[g.group]
							for b in armature.pose.bones:
								if b.name == vertex_group.name: 
									vertex_buffer.append(group_index)
									vertex_buffer.append(g.weight)
									break
								group_index += 1

							vertex_buffer.append(group_index)
							vertex_buffer.append(g.weight)

				vertex_count += 1

		uv_ln = len(uv_layers)
		color_ln = len(color_layers)
		weight_ln = len(ob.vertex_groups)

		offset_mask = 1 | 2 #positon and normal
		if(uv_ln == 1): offset_mask |= 4
		elif(uv_ln == 2): 
			offset_mask |= 4
			offset_mask |= 8
		if(color_ln == 1): offset_mask |= 16
		elif(color_ln == 2): 
			offset_mask |= 16
			offset_mask |= 32 
		if(weight_ln > 0):
			offset_mask |= 64

		vertex_data_ln = len(vertex_buffer)
		index_data_ln = len(index_buffer)

		self.i32(vertex_count)
		self.i32(vertex_data_ln)
		self.i32(index_data_ln)
		self.i32(offset_mask)

		for i in range(0, vertex_data_ln):
			self.f32(vertex_buffer[i])

		for i in range(0, index_data_ln):
			self.i32(index_buffer[i])

		bpy.data.meshes.remove(mesh)
		if not has_triangulate:
			modifiers.remove(modifiers[len(modifiers)-1])

	def write_action(self, action, ob, scene):
		print("Exporting Action: " + action.name)

		self.i32(OB_TYPE_ACTION)
		self.string(action.name)
		self.i32(len(action.fcurves))

		for curve in action.fcurves:
			prop = curve.data_path
			data_type = ob.path_resolve(prop)
			
			value_mode = 0
			if prop == 'location': prop = 'position'
			elif prop == 'rotation_euler': 
				prop = 'rotation'
				value_mode = 1
			elif prop == 'rotation_quaternion':
				prop = 'rotation'
				value_mode = 2
			self.string(prop)

			if type(data_type) is float:
				self.i32(-1)
			else: #reorder quaternion
				index = curve.array_index
				if value_mode == 2:
					if index == 0: index = 3 #W
					elif index == 1: index = 0
					elif index == 2: index = 1
					elif index == 3: index = 2
				self.i32(index)
			
			self.i32(len(curve.keyframe_points))
			for keyframe in curve.keyframe_points:
				self.f32(keyframe.co[0] / scene.render.fps)
				self.f32(keyframe.co[1])
				self.f32(keyframe.handle_left[0])
				self.f32(keyframe.handle_left[1])
				self.f32(keyframe.handle_right[0])
				self.f32(keyframe.handle_right[1])


	def armature_action(self, action, ob, scene):
		print("Exporting Rig Action: " + action.name)

		self.i32(OB_TYPE_ARMATURE_ACTION)
		self.string(action.name)
		self.i32(len(action.fcurves))

		for curve in action.fcurves:
			path = curve.data_path
			prop = path.split('.')[2]
			target_bone = path[12:].split('"')[0]

			bone_index = 0
			for bone in ob.pose.bones:
				if bone.name == target_bone: break
				bone_index += 1
			self.i32(bone_index)

			data_type = ob.path_resolve(path)
			value_mode = 1
			if prop == 'location': prop = 'position'
			elif prop == 'rotation_euler': 
				prop = 'rotation'
			elif prop == 'rotation_quaternion':
				prop = 'rotation'
				value_mode = 2
			self.string(prop)

			index = curve.array_index
			if value_mode == 2:
				if index == 0: index = 3
				elif index == 1: index = 0 
				elif index == 2: index = 1
				elif index == 3: index = 2 
			self.i32(index)

			self.i32(len(curve.keyframe_points))
			for keyframe in curve.keyframe_points:
				self.f32(keyframe.co[0] / scene.render.fps)
				self.f32(keyframe.co[1])
				self.f32(keyframe.handle_left[0])
				self.f32(keyframe.handle_left[1])
				self.f32(keyframe.handle_right[0])
				self.f32(keyframe.handle_right[1])

class ExportTest(bpy.types.Operator, ExportHelper):
	bl_idname = "export_gblib.test"
	bl_label = "Export GBLIB (.scene)"

	filename_ext = ".scene"
	filter_glob = StringProperty(default = "*.scene", options = {'HIDDEN'})

	def execute(self, context):
			
		scene = bpy.context.scene 
		scene.frame_set(0)

		filepath = self.filepath
		filepath = bpy.path.ensure_ext(filepath, self.filename_ext)
		writer = FileWriter(filepath)

		exported_meshes = []
		exported_actions = []
		exported_materials = []
		exported_cameras = []
		exported_lamps = []
		exported_armatures = []

		print("")
		print("######### EXPORTING SCENE: " + scene.name + " ###########")
		print("")

		scene.objects.active = None;

		for ob in scene.objects:
			
			if ob.type == 'ARMATURE':
				armature = bpy.data.objects[ob.name]
				if not armature in exported_armatures:
					if not armature.animation_data is None:
						action = armature.animation_data.action
						if not action is None:
							if not action in exported_actions:
								writer.armature_action(action, ob, scene)
								exported_actions.append(action)

					writer.armature(ob)
					exported_armatures.append(armature)

			elif not ob.animation_data is None:
				action = ob.animation_data.action
				if not action is None:
					if not action in exported_actions:
						writer.action(action, ob, scene)
						exported_actions.append(action)

			if ob.type == 'CAMERA': 
				camera = ob.data
				if not camera in exported_cameras:
					if not camera.animation_data is None:
						action = camera.animation_data.action
						if not action is None:
							if not action in exported_actions:
								writer.action(action, ob, scene)
								exported_actions.append(action)

					writer.camera(ob, camera)
					exported_cameras.append(camera)

			elif ob.type == 'LAMP': 
				lamp = ob.data
				if not lamp in exported_lamps:
					if not lamp.animation_data is None:
						action = lamp.animation_data.action
						if not action is None:
							if not action in exported_actions:
								writer.action(action, ob, scene)
								exported_actions.append(action)
				
					writer.lamp(ob, lamp)
					exported_lamps.append(lamp)

			elif ob.type == 'MESH':
				material = ob.material_slots[0].material
				if not material is None: #and 'shader' in material:
					if not material in exported_materials:
						if not material.animation_data is None:
							action = material.animation_data.action
							if not action is None:
								if not action in exported_actions:
									writer.action(action, ob, scene)
									exported_actions.append(action)

						writer.material(material)
						exported_materials.append(material)

				if not ob.data.name in exported_meshes:
					writer.mesh(ob, scene)
					exported_meshes.append(ob.data.name)

				writer.object(ob)

			elif ob.type == 'EMPTY':
				writer.empty(ob)

		writer.i32(OB_TYPE_FILE_END)
		writer.close()

		print("")
		print("######### EXPORTING COMPLETED ###########")
		print("")
							
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