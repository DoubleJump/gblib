//INCLUDE projects/launchvis/js/gblib.js
//INCLUDE projects/launchvis/js/lvlib.js
//INCLUDE lib/js/gl/fps_camera.js
//INCLUDE lib/js/gl/mesh/cube.js

var v2 = gb.vec2;
var v3 = gb.vec3;
var qt = gb.quat;
var m4 = gb.mat4;
var math = gb.math;
var gl = gb.webgl;
var input = gb.input;
var scene = gb.scene;
var assets;
var debug_view;

var construct;
var camera;
var surface_target;
var fxaa_pass;

var globe;
var material;
var ocean;
var country_meshes = [];
var rotw;
var mesh;
var atmosphere;

function init()
{
	gb.init(
	{
		config:
		{
			frame_skip: false,
			update: update,
			debug_update: debug_update,
			render: render,
		},
		gl:
		{
			antialias: false,
		}
	});

	gb.assets.load('assets/assets.gl', event_asset_load);
	//var request = gb.ajax.GET('assets/launch_data.data', event_data_load);
	//request.send();
}

function event_data_load(e)
{
	if(e.target.status === 200)
    {
        var s = gb.binary_reader;
        var br = new gb.Binary_Reader(e.target.response);
        LOG("Asset File Size: " + br.buffer.byteLength + " bytes");
        lv.load_data(br);
    }
}

function event_asset_load(asset_group)
{
	debug_view = gb.debug_view.new(document.body);

	assets = asset_group;
	construct = scene.new(null, true);

	material = gb.material.new(assets.shaders.sphere);
	material.warp = 1.0;
	material.offset = 1.0;
	gb.color.set(material.color, 1.0,1.0,1.0,1.0);

	ocean = assets.meshes['ocean'];
	rotw = assets.meshes['rotw'];
	for(var k in assets.meshes)
	{
		if(k === 'ocean' || k === 'rotw' || k === 'european union') continue;
		country_meshes.push(assets.meshes[k]);
	}

	globe = gb.entity.new();
	scene.add(globe);

	atmosphere = gb.line_mesh.ellipse(0.65,0.65,60,0.025);
	atmosphere.entity.material = gb.material.new(asset_group.shaders.line);
	atmosphere.entity.material.line_width = atmosphere.thickness;
	//atmosphere.entity.material.cutoff = atmosphere.length;
	atmosphere.entity.material.cutoff = 2.5;
	
	atmosphere.entity.material.aspect = 1.0;
	atmosphere.entity.material.mitre = 0;
	atmosphere.spin = 0;
	//gb.color.set(line.entity.material.color, 0.8,0.8,0.884,1.0);
	scene.add(atmosphere);

	camera = gb.camera.new();
	camera.entity.position[2] = 3.0;
	scene.add(camera);

	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);

	gb.allow_update = true;
}

function update(dt)
{
	gb.debug_view.update(debug_view);
	gb.camera.fly(camera, dt, 80);
	atmosphere.spin += 30 * dt;
	gb.entity.set_rotation(atmosphere.entity, 0, atmosphere.spin, 0);
}

function debug_update(dt)
{
	//gb.gl_draw.line(v3.tmp(0,0,0), v3.tmp(2,2,2));
}

function render_globe_mesh(mesh, mat)
{
	gl.link_attributes(mat.shader, mesh);
	gl.set_uniforms(mat);
	gl.draw_mesh(mesh);
}

function render()
{
	gl.set_state(gl.ctx.DEPTH_TEST, true);

	

	//gl.set_blend_mode();
	//gl.ctx.depthMask(true);

	gl.set_render_target(null, false);
    m4.mul(material.mvp, globe.world_matrix, camera.view_projection);
	gl.use_shader(material.shader);
	gb.material.set_camera_uniforms(material, camera);

    gb.color.set(material.color, 0.0,0.0,0.0,1.0);
    render_globe_mesh(ocean, material);

    gb.color.set(material.color, 0.4,0.4,0.4,1.0);
    render_globe_mesh(rotw, material);
	
	var n = country_meshes.length;
	for(var i = 0; i < n; ++i)
	{
		render_globe_mesh(country_meshes[i], material);
	}

	//gl.set_blend_mode(gl.blend_mode.MULTIPLY);
	//gl.set_state(gl.ctx.DEPTH_TEST, false);
	//gl.ctx.depthMask(false);
	gl.use_shader(atmosphere.entity.material.shader);
    m4.mul(atmosphere.entity.material.mvp, globe.world_matrix, camera.view_projection);
	gb.material.set_camera_uniforms(atmosphere.entity.material, camera);
	gl.link_attributes(atmosphere.entity.material.shader, atmosphere.entity.mesh);
	gl.set_uniforms(atmosphere.entity.material);
	gl.draw_mesh(atmosphere.entity.mesh);
	//gl.render_scene(construct, camera, null, false);


	gb.gl_draw.render(camera, null);

	//gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);

