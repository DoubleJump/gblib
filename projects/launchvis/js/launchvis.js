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
var atmos_shift;
var orbits = [];
var cutoff;
var pulse;

function init()
{
	gb.init(
	{
		config:
		{
			frame_skip: true,
			update: update,
			debug_update: debug_update,
			render: render,
		},
		gl:
		{
			antialias: true,
			fill_container: true,
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
	//material.offset = 1.0;
	gb.color.set(material.color, 1.0,1.0,1.0,1.0);
	gb.vec3.set(material.light, 10.0,5.0,5.0);

	ocean = assets.meshes['ocean'];
	rotw = assets.meshes['rotw'];
	for(var k in assets.meshes)
	{
		if(k === 'ocean' || k === 'rotw' || k === 'european union') continue;
		country_meshes.push(assets.meshes[k]);
	}

	globe = gb.entity.new();
	scene.add(globe);
	globe.spin = 0;

	atmos_shift = gb.entity.new();
	scene.add(atmos_shift);

	atmosphere = gb.line_mesh.ellipse(0.591,0.591,80,0.01);
	atmosphere.entity.material = gb.material.new(asset_group.shaders.line);
	atmosphere.entity.material.line_width = atmosphere.thickness;
	atmosphere.entity.material.start = 0;
	atmosphere.entity.material.end = atmosphere.length;
	atmosphere.entity.material.aspect = gl.aspect;
	atmosphere.entity.material.mitre = 1;
	gb.color.set(atmosphere.entity.material.color, 0.35,0.35,0.35,1.0);
	scene.add(atmosphere);

	atmosphere.entity.position[2] = 0.25;
	gb.entity.set_parent(atmosphere.entity, atmos_shift);

	for(var i = 0; i < 10; ++i)
	{
		var rx = gb.random.float(0.6,1.5);
		var ry = gb.random.float(0.6,1.5);
		var tx = gb.random.float(-120, 120);
		var ty = gb.random.float(-120, 120);

		var orbit = gb.line_mesh.ellipse(rx,ry, 90,0.004);
		orbit.entity.material = gb.material.new(asset_group.shaders.line);
		orbit.entity.material.line_width = orbit.thickness;
		orbit.entity.material.start = 0;
		orbit.entity.material.end = orbit.length;// * gb.random.float(0.5,1.0);
		orbit.entity.material.aspect = gl.aspect;
		orbit.entity.material.mitre = 1;
		gb.entity.set_rotation(orbit.entity, tx,ty,0);

		scene.add(orbit);
		orbits.push(orbit);
	}

	for(var i = 0; i < 5; ++i)
	{
		var orbit = orbits[i];

		var cr = gb.random.float(0.6,0.6);
		var cg = gb.random.float(0.5,0.5);
		var cb = gb.random.float(0.5,0.6);

		gb.color.set(orbit.entity.material.color, cr,cg,cb,1.0);
	}
	for(var i = 5; i < 10; ++i)
	{
		var orbit = orbits[i];

		var cr = gb.random.float(0.3,0.5);
		var cg = gb.random.float(0.4,0.6);
		var cb = gb.random.float(0.8,0.9);
		
		gb.color.set(orbit.entity.material.color, cr,cg,cb,1.0);
	}


	cutoff = 0.0;
	pulse = 0.0;

	gb.color.set(orbits[3].entity.material.color, 1.0,1.0,1.0, 1.0);
	orbits[3].entity.material.line_width = 0.009;

	
	camera = gb.camera.new();
	camera.entity.position[2] = 3.0;
	scene.add(camera);

	material.model = globe.world_matrix;
    material.view = camera.view;
    material.projection = camera.projection;
    material.normal_matrix = camera.normal;


    var star_buffer = new gb.Vertex_Buffer();
    star_buffer.data = new Float32Array(900);
    for(var i = 0; i < 300; i+=3)
    {
    	star_buffer.data[i] = gb.random.float(15,16) * gb.random.sign();
    	star_buffer.data[i+1] = gb.random.float(15,16) * gb.random.sign();
    	star_buffer.data[i+2] = gb.random.float(15,16) * gb.random.sign();
    }
    gb.random.fill(star_buffer.data, -5, 5);
    gb.vertex_buffer.add_attribute(star_buffer, 'position', 3);

    var star_mesh = new gb.Mesh();
	star_mesh.layout = gb.webgl.ctx.POINTS;
	star_mesh.update_mode = gb.webgl.ctx.STATIC_DRAW;
    star_mesh.vertex_buffer = star_buffer;
    gb.mesh.update(star_mesh);

    var star_material = gb.material.new(asset_group.shaders.stars);
    var stars = gb.entity.mesh(star_mesh, star_material);
    scene.add(stars);

	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);

	//gb.debug_view.watch(debug_view, 'Rot', atmosphere.entity, 'rotation');
	//gb.debug_view.watch(debug_view, 'Pos', camera.entity, 'position');

	gb.allow_update = true;
}

function update(dt)
{
	gb.debug_view.update(debug_view);
	gb.camera.fly(camera, dt, 80);
	
	var to_camera = v3.tmp();
	v3.sub(to_camera, v3.tmp(0,0,0), camera.entity.position);
	v3.normalized(to_camera, to_camera);

	qt.from_to(atmos_shift.rotation, v3.tmp(0,0,-1), to_camera);
	atmos_shift.dirty = true;

	globe.spin += 1 * dt;
	gb.entity.set_rotation(globe, 23.5, globe.spin, 0);

	pulse += dt * 0.1;
	if(pulse > 1.0) pulse = 0.0;

	cutoff += dt * 0.1;
	if(cutoff > 2.0) cutoff = 0.0;
	for(var i = 0; i < 10; ++i)
	{
		var orbit = orbits[i];
		//var offset = 10.0 / i;
		if(cutoff > 1.0) orbit.entity.material.start = orbit.length * (cutoff - 1.0);
		else 
		{
			orbit.entity.material.start = 0;
			orbit.entity.material.end = orbit.length * cutoff;// + offset;
		}
	}

	//TODO: need to modulate atmosphere thickness to be the inverse of the distance
	//of the camera to atmosphere
}

function debug_update(dt)
{
	//gb.gl_draw.line(v3.tmp(0,0,0), v3.tmp(2,2,2));
	//gb.gl_draw.transform(atmos_shift.world_matrix);
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


	gl.set_render_target(null, false);
    //m4.mul(material.mvp, globe.world_matrix, camera.view_projection);

	gl.use_shader(material.shader);
	gb.material.set_camera_uniforms(material, camera);

    gb.color.set(material.color, 0.15,0.15,0.15,1.0);
    //gb.color.set(material.color, 1.0,1.0,1.0,1.0);
    render_globe_mesh(ocean, material);

	gb.color.set(material.color, 0.0,0.0,0.0,1.0);
    render_globe_mesh(rotw, material);
	
	var n = country_meshes.length;
	for(var i = 0; i < n; ++i)
	{
		var sp = gb.math.sin(pulse * i);
   		gb.color.set(material.color, sp,sp,sp,1.0);
		render_globe_mesh(country_meshes[i], material);
	}


	gl.render_scene(construct, camera, null, false);

	gb.gl_draw.render(camera, null);
	//gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);

