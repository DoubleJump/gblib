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
	"version": (2, 0),
	"blender": (2, 80, 0),
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
from struct import pack, unpack

OB_TYPE_CAMERA = 4
OB_TYPE_LAMP = 5
OB_TYPE_MESH = 6
OB_TYPE_MATERIAL = 7
OB_TYPE_ACTION = 8
OB_TYPE_OBJECT = 9
OB_TYPE_EMPTY = 10
OB_TYPE_ARMATURE = 11
OB_TYPE_ARMATURE_ACTION = 12
OB_TYPE_CURVE = 13
OB_TYPE_WORLD = 13
OB_TYPE_FILE_END = -1

MATERIAL_TYPE_PBR = 1

MATERIAL_INPUT_FLOAT = 1
MATERIAL_INPUT_TEXTURE = 2
MATERIAL_INPUT_COLOR = 3
MATERIAL_INPUT_EMPTY = 4

MIP_MAP_NEAREST = 0
MIP_MAP_LINEAR = 1
TEXTURE_REPEAT = 0
TEXTURE_CLAMP = 1
TEXTURE_EXTEND = 2

LAMP_TYPE_POINT = 0
LAMP_TYPE_SUN = 1
LAMP_TYPE_SPOT = 2

GB_MATRIX = mathutils.Matrix.Rotation(radians(-90.0), 4, 'X')

def round_vec3(v):
	return round(v[0], 3), round(v[1], 3), round(v[2], 3)

def round_vec2(v):
	return round(v[0], 3), round(v[1], 3)

class VertexAttribute:
	def __init__(self, name, size, normalized):
		self.name = name
		self.size = size
		self.norm = normalized

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

	# NOTE: z and y are swapped!!!
	def vec3(self, val):
		self.f32(val.x)
		self.f32(val.z)
		self.f32(val.y)

	def quaternion(self, val):
		self.f32(val.x)
		self.f32(val.z)
		self.f32(val.y)
		self.f32(val.w)
	
	def mat4(self, val):
		matrix = val.transposed()
		for i in range(0,4):
			for j in range(0,4):
				self.f32(matrix[i][j])

	def transform(self, ob):
		if not ob.parent is None:
			self.i32(1)
			self.string(ob.parent.name)
		else:
			self.i32(0)
		ob.rotation_mode = 'QUATERNION'
		self.vec3(ob.location)
		self.vec3(ob.scale)
		self.quaternion(ob.rotation_quaternion)

	def camera(self, ctx, ob, camera):
		self.i32(OB_TYPE_CAMERA)
		self.string(ob.name)
		self.transform(ob)
		if camera.type == 'PERSP':
			self.i32(1)
		else: 
			self.i32(0)
			self.f32(camera.ortho_scale)
		self.f32(camera.clip_start)
		self.f32(camera.clip_end)
		self.f32(camera.lens)

	def lamp(self, ctx, ob, lamp):
		self.i32(OB_TYPE_LAMP)
		self.string(ob.name)
		self.transform(ob)
		if lamp.type == 'POINT':
			self.i32(0)
		elif lamp.type == 'SPOT':
			self.i32(1)
		elif lamp.type == 'SUN':
			self.i32(2)
		elif lamp.type == 'AREA':
			self.i32(3)

		self.vec3(lamp.color)
		self.f32(lamp.energy)
		self.f32(lamp.distance)

	def curve(self, ctx, ob, curve):
		self.i32(OB_TYPE_CURVE)
		self.string(ob.name)
		
		num_bezier_points = 0
		for spline in curve.splines:
			num_bezier_points += len(spline.bezier_points)

		self.i32(num_bezier_points)

		for spline in curve.splines:
			for point in spline.bezier_points:
				left = round_vec3(point.handle_left)
				co = round_vec3(point.co)
				right = round_vec3(point.handle_right)
				self.f32(left[0])
				self.f32(left[1])
				self.f32(left[2])
				self.f32(co[0])
				self.f32(co[1])
				self.f32(co[2])
				self.f32(right[0])
				self.f32(right[1])
				self.f32(right[2])

	def object(self, ctx, ob):
		self.i32(OB_TYPE_OBJECT)
		self.string(ob.name)
		self.transform(ob)
		
		if not ob.data.name is None:
			self.i32(1) 
			self.string(ob.data.name) 
		else:
			self.i32(0)

		if(len(ob.material_slots) > 0 and ctx.export_materials is True):
			self.i32(1)
			self.string(ob.material_slots[0].material.name)
		else:
			self.i32(0)


	def material_color(self, slot):
		color = list(slot.default_value)
		self.i32(MATERIAL_INPUT_COLOR)
		self.f32(color[0])
		self.f32(color[1])
		self.f32(color[2])
		self.f32(color[3])

	def material_float(self, slot):
		self.i32(MATERIAL_INPUT_FLOAT)
		self.f32(slot.default_value)

	def material_texture(self, node):
		img_name = node.image.name.split(".")[0]
		self.i32(MATERIAL_INPUT_TEXTURE)
		self.string(img_name)
		
		if node.interpolation == 'Closest':
			self.i32(MIP_MAP_NEAREST)
		else:
			self.i32(MIP_MAP_LINEAR)
		
		if node.extension == 'Repeat':
			self.i32(TEXTURE_REPEAT)
		elif node.extension == 'Clip':
			self.i32(TEXTURE_CLAMP)
		else:
			self.i32(TEXTURE_EXTEND)

	def material_slot(self, node, slot_name):
		slot = node.inputs[slot_name]
		if len(slot.links) == 0:
			if slot.type == "RGBA":
				self.material_color(slot)
			elif slot.type == "VALUE":
				self.material_float(slot)
			elif slot.type == "VECTOR":
				self.i32(MATERIAL_INPUT_EMPTY)
		else:
			input = slot.links[0].from_node
			if input.type == "TEX_IMAGE":
				self.material_texture(input)
			elif input.type == "NORMAL_MAP":
				if len(input.links) == 0:
					self.i32(MATERIAL_INPUT_EMPTY)
				else:
					input = input.links["Color"].from_node
					self.material_texture(input)

	def material(self, ctx, material):

		if material.use_nodes:
			material_output = material.node_tree.nodes["Material Output"]
			surface_input = material_output.inputs[0].links[0].from_node

			if surface_input.name == "Principled BSDF":
				pbr = surface_input
				self.i32(OB_TYPE_MATERIAL)
				self.string(material.name)
				self.i32(MATERIAL_TYPE_PBR)
				self.material_slot(pbr, "Base Color")
				self.material_slot(pbr, "Normal")
				self.material_slot(pbr, "Metallic")
				self.material_slot(pbr, "Specular")
				self.material_slot(pbr, "Roughness")
				self.material_slot(pbr, "IOR")
				self.material_slot(pbr, "Transmission")
				#anisotropic
				#anisotropic_rotation
				#clear_coat
				#clear_coat_roughness

	def mesh(self, ctx, ob, graph):
		modifiers = ob.modifiers
		has_triangulate = False
		for mod in modifiers:
			if(mod.type == 'TRIANGULATE'):
				has_triangulate = True
		if not has_triangulate:
			modifiers.new("TEMP", type = 'TRIANGULATE')

		mesh = ob.to_mesh(depsgraph=graph, apply_modifiers=True, calc_undeformed=False)
		mesh.calc_normals()
		mesh.calc_loop_triangles()

		vertex_map = {}
		vertex_buffer = []
		index_buffer = []
		vertex_count = 0

		uv_layers = mesh.uv_layers
		num_uv_layers = len(uv_layers)

		color_layers = mesh.vertex_colors
		num_color_layers = len(color_layers)

		for tri in mesh.loop_triangles:
			for loop_index in tri.loops:
				loop = mesh.loops[loop_index]
				vert_index = loop.vertex_index
				vertex = mesh.vertices[vert_index]
				pos = round_vec3(vertex.co)
				norm = round_vec3(vertex.normal)

				if ctx.export_indices:
					key = pos,norm
					index = vertex_map.get(key)
					if not index is None:
						index_buffer.append(index)
						continue
					else:
						vertex_map[key] = vertex_count

				#@ is mutiply operator for some reason now.... -___-
				pos = round_vec3(GB_MATRIX @ vertex.co)
				norm = round_vec3(GB_MATRIX @ vertex.normal)

				vertex_buffer.append(pos[0])
				vertex_buffer.append(pos[1])
				vertex_buffer.append(pos[2])

				if ctx.export_normals:
					vertex_buffer.append(norm[0])
					vertex_buffer.append(norm[1])
					vertex_buffer.append(norm[2])

				if ctx.export_uvs:
					for layer in uv_layers:
						uv = round_vec2(layer.data[loop_index].uv)
						vertex_buffer.append(uv[0])
						vertex_buffer.append(uv[1])

				if ctx.export_vertex_colors:
					for layer in color_layers:
						col = round_vec3(layer.data[loop_index].color)
						vertex_buffer.append(col[0])
						vertex_buffer.append(col[1])
						vertex_buffer.append(col[2])
						vertex_buffer.append(1.0)

				index_buffer.append(vertex_count)
				vertex_count += 1
		
		attributes = []
		attributes.append(VertexAttribute('position', 3, False))

		if ctx.export_normals:
			attributes.append(VertexAttribute('normal', 3, False))

		if ctx.export_uvs:
			for i in range(0, num_uv_layers):
				if i is 0:
					attributes.append(VertexAttribute('uv', 2, False))
				else:
					attributes.append(VertexAttribute('uv' + str(i+1), 2, False))

		if ctx.export_vertex_colors:
			for i in range(0, num_color_layers):
				if i is 0:
					attributes.append(VertexAttribute('color', 4, True))
				else:
					attributes.append(VertexAttribute('color' + str(i+1), 4, True))

		self.i32(OB_TYPE_MESH)
		self.string(ob.data.name)

		self.i32(len(vertex_buffer))
		for vertex in vertex_buffer:
			self.f32(vertex)

		if ctx.export_indices:
			self.i32(len(index_buffer))
			for index in index_buffer:
				self.i32(index)
		else: self.i32(0)

		self.i32(len(attributes))
		for attr in attributes:
			self.string(attr.name)
			self.i32(attr.size)
			self.i32(attr.norm)

		bpy.data.meshes.remove(mesh)
		if not has_triangulate:
			modifiers.remove(modifiers[len(modifiers)-1])


class GB_UL_export_gblib(bpy.types.Operator, ExportHelper):
	bl_idname = "export.gblib"
	bl_label = "Export GBLIB"
	bl_description = "Exporter for GBLIB engine"
	bl_options = {'REGISTER'}
	
	filename_ext = ".scene"
	filter_glob : StringProperty(default = "*.scene", options = {'HIDDEN'})

	export_selected : BoolProperty(name="Export Selected", description="Only export selected", default=True)
	export_indices : BoolProperty(name="Export Indices", description="Export index buffer", default=True)
	export_normals : BoolProperty(name="Export Normals", description="Export vertex normals", default=True)
	export_uvs : BoolProperty(name="Export UV", description="Export UV maps", default=True)
	export_vertex_colors : BoolProperty(name="Export Vertex Colors", description="Export vetex colors", default=True)
	export_lamps : BoolProperty(name="Export Lamps", description="Export lamps", default=True)
	export_cameras : BoolProperty(name="Export Cameras", description="Export cameras", default=True)
	export_curves : BoolProperty(name="Export Curves", description="Export curves", default=True)
	export_objects : BoolProperty(name="Export Objects", description="Export objects", default=True)
	export_materials : BoolProperty(name="Export Materials", description="Export materials", default=True)

	def draw(self, context):
		layout = self.layout
		layout.prop(self, "export_selected")
		layout.prop(self, "export_indices")
		layout.prop(self, "export_normals")
		layout.prop(self, "export_uvs")
		layout.prop(self, "export_vertex_colors")
		layout.prop(self, "export_cameras")
		layout.prop(self, "export_lamps")
		layout.prop(self, "export_curves")
		layout.prop(self, "export_objects")
		layout.prop(self, "export_materials")
		
	def execute(self, context):
		filepath = self.filepath
		filepath = bpy.path.ensure_ext(filepath, self.filename_ext)
		writer = FileWriter(filepath)

		scene = bpy.context.scene
		scene.frame_set(0)
		graph = bpy.context.depsgraph
		objects = scene.objects
		if self.export_selected: objects = bpy.context.selected_objects

		print("######### EXPORTING SCENE: " + scene.name + " ###########")

		exported_meshes = []
		exported_cameras = []
		exported_lamps = []
		exported_curves = []
		exported_objects = []
		exported_materials = []

		for ob in objects:
			if ob.type == 'CAMERA' and self.export_cameras:
				camera = ob.data
				if not camera in exported_cameras:
					writer.camera(self, ob, camera)
					exported_cameras.append(camera)
					print("Camera: " + camera.name)
					continue

			if ob.type == 'LAMP' and self.export_lamps:
				lamp = ob.data
				if not lamp in exported_lamps:
					writer.lamp(self, ob, lamp)
					exported_lamps.append(lamp)
					print("Lamp: " + lamp.name)
					continue

			if ob.type == 'CURVE' and self.export_curves:
				curve = ob.data
				if not curve in exported_curves:
					writer.curve(self, ob, curve)
					exported_curves.append(curve)
					print("Curve: " + curve.name)
					continue

			if self.export_objects:
				writer.object(self, ob)
				print("Object: " + ob.name)

			if ob.type == 'MESH' and not ob.data.name in exported_meshes:
				writer.mesh(self, ob, graph)
				exported_meshes.append(ob.data.name)
				print("Mesh: " + ob.data.name)

			if len(ob.material_slots) > 0 and self.export_materials:
				material = ob.material_slots[0].material
				if not material in exported_materials:
					writer.material(self, material)
					exported_materials.append(material)
					print("Material: " + material.name)

		writer.i32(OB_TYPE_FILE_END)
		writer.close()

		print("######### EXPORT COMPLETED ###########")
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

def register():
	bpy.utils.register_class(GB_UL_export_gblib)

def unregister():
	bpy.utils.unregister_class(GB_UL_export_gblib)

if __name__ == "__main__":
	register()