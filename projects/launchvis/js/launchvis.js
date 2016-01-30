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
//var surface_target;
//var fxaa_pass;

var globe;

var ocean;
var ocean_material;
var land_material;
var country_meshes = [];
var rotw;
var background;
var background_material;
var atmosphere;
var atmos_shift;
var atmos_scale;
var orbits = [];
var grid_lines = [];
var cutoff;
var pulse;

var F_bias = 0.5;
var F_scale = 0.5;
var F_power = 1.0;

var sunlight;
var backlight;

var cam_to_earth_distance;

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

	// CAMERA

	camera = gb.camera.new();
	camera.entity.position[2] = 3.0;
	scene.add(camera);

	// GLOBE ENTITY

	globe = gb.entity.new();
	scene.add(globe);
	globe.spin = 0;

	// BACKGROUND

	background = gb.mesh.quad(2,2);
	background_material = gb.material.new(assets.shaders.background);
	background_material.mag = gb.math.sqrt((gl.view.width / 2) * (gl.view.height / 2));
	v2.set(background_material.res, gl.view.width / 2 , gl.view.height / 2);

	sunlight = gb.vec3.new(8.0,5.0,5.0);
	backlight = gb.vec3.new(-8.0,-5.0,-5.0);


	// OCEAN

	// TODO: generate a quad so we can sdf the sphere 
	ocean = assets.meshes['ocean'];
	ocean_material = gb.material.new(assets.shaders.ocean);
	ocean_material.light = sunlight;

	ocean_material.light = sunlight; 
	//ocean_material.lightB = backlight;
	//gb.color.set(ocean_material.color, 0.8,0.8,0.8,1.0);

	F_bias = gb.debug_view.control(debug_view, 'Bias', 0.0, 1.0, 0.01, 0.2);
	F_scale = gb.debug_view.control(debug_view, 'Scale', 0.0, 1.0, 0.01, -0.86);
	F_power = gb.debug_view.control(debug_view, 'Power', 0.0, 1.0, 0.01, 0.55);
	/*
	F_bias = gb.debug_view.control(debug_view, 'Bias', 0.0, 1.0, 0.01, 0.2);
	F_scale = gb.debug_view.control(debug_view, 'Scale', -4.0, 4.0, 0.01, -0.86);
	F_power = gb.debug_view.control(debug_view, 'Power', -4.0, 4.0, 0.01, 0.55);
	*/
	// LAND MASSES

	land_material = gb.material.new(assets.shaders.land);
	land_material.model = globe.world_matrix;
    land_material.view = camera.view;
    land_material.projection = camera.projection;
    land_material.normal_matrix = camera.normal;
    land_material.light = sunlight;

	//material.warp = 1.0;

	rotw = assets.meshes['rotw'];
	for(var k in assets.meshes)
	{
		if(k === 'ocean' || k === 'rotw' || k === 'european union') continue;
		country_meshes.push(assets.meshes[k]);
	}

	// ATMOSPHERE

	atmos_shift = gb.entity.new();
	scene.add(atmos_shift);

	atmosphere = gb.line_mesh.ellipse(0.707 - 0.04, 0.707 - 0.04,120,0.04);
	atmosphere.entity.material = gb.material.new(asset_group.shaders.atmosphere);
	atmosphere.entity.material.line_width = atmosphere.thickness;
	atmosphere.entity.material.aspect = gl.aspect;
	atmosphere.entity.material.light = sunlight;
	//atmosphere.entity.position[2] = 0.3;
	//scene.add(atmosphere);

	gb.entity.set_parent(atmosphere.entity, atmos_shift);


	// ORBITS

	for(var i = 0; i < 4; ++i)
	{
		var rx = gb.random.float(0.6,1.5);
		var ry = gb.random.float(0.6,1.5);
		var tx = gb.random.float(-120, 120);
		var ty = gb.random.float(-120, 120);

		var orbit = gb.line_mesh.ellipse(rx,ry, 90,0.005);
		var mat = gb.material.new(asset_group.shaders.line);
		orbit.entity.material = mat;
		mat.line_width = orbit.thickness;
		mat.start = 0;
		mat.end = orbit.length;// * gb.random.float(0.5,1.0);
		mat.aspect = gl.aspect;
		gb.entity.set_rotation(orbit.entity, tx,ty,0);

		//gb.color.set(orbit.entity.material.color, 0.7,0.3,0.1,1.0);
		//gb.color.set(orbit.entity.material.color, 0.25,0.1,0.7,1.0);
		//gb.color.set(orbit.entity.material.color, 1.0,1.0,1.0,1.0);

		scene.add(orbit);
		orbits.push(orbit);
	}
	/*
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
	*/

	cutoff = 0.0;
	pulse = 0.0;

	//gb.color.set(orbits[3].entity.material.color, 1.0,1.0,1.0, 1.0);
	//orbits[3].entity.material.line_width = 0.009;


	// GRID LINES

	// LONGITUDE
	var lng_step = 360 / 24;
	for(var i = 0; i < 24; ++i)
	{
		var grid_line = gb.line_mesh.ellipse(0.64,0.64, 90,0.003);
		grid_line.entity.material = gb.material.new(asset_group.shaders.grid);
		grid_line.entity.material.line_width = grid_line.thickness;
		grid_line.entity.material.aspect = gl.aspect;
		gb.entity.set_rotation(grid_line.entity, 0, lng_step * i, 0);
		gb.entity.set_parent(grid_line.entity, globe);
		grid_lines.push(grid_line);
		//scene.add(grid_line);
	}

	add_lat_line(asset_group, 0.64, 0.0);
	add_lat_line(asset_group, 0.617, (0.1667 * 1));
	add_lat_line(asset_group, 0.545, (0.1667 * 2));
	add_lat_line(asset_group, 0.398, (0.1667 * 3));
	add_lat_line(asset_group, 0.617, (-0.1667 * 1));
	add_lat_line(asset_group, 0.545, (-0.1667 * 2));
	add_lat_line(asset_group, 0.398, (-0.1667 * 3));



    // STAR FIELD

    var num_stars = 1000;
    var star_buffer = new gb.Vertex_Buffer();
    star_buffer.data = new Float32Array(num_stars * 3);
    for(var i = 0; i < num_stars; i+=3)
    {
    	star_buffer.data[i  ] = gb.random.float(200,300) * gb.random.sign();
    	star_buffer.data[i+1] = gb.random.float(200,300) * gb.random.sign();
    	star_buffer.data[i+2] = gb.random.float(200,300) * gb.random.sign();
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
    //scene.add(stars);

    /*
	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);
	*/
	//gb.debug_view.watch(debug_view, 'Rot', atmosphere.entity, 'rotation');
	//gb.debug_view.watch(debug_view, 'Pos', camera.entity, 'position');

	gb.allow_update = true;
}

function add_lat_line(asset_group, rad, y)
{
	var grid_line = gb.line_mesh.ellipse(rad,rad, 90,0.003);
	grid_line.entity.material = gb.material.new(asset_group.shaders.grid);
	grid_line.entity.material.line_width = grid_line.thickness;
	grid_line.entity.material.aspect = gl.aspect;
	gb.entity.set_position(grid_line.entity, 0, y, 0);
	gb.entity.set_rotation(grid_line.entity, 90, 0, 0);
	gb.entity.set_parent(grid_line.entity, globe);
	//scene.add(grid_line);
	grid_lines.push(grid_line);
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

	// EARTH ROTATION

	globe.spin += 5 * dt;
	gb.entity.set_rotation(globe, 23.5, globe.spin, 23.5);

	pulse += dt * 0.1;
	//if(pulse > 1.0) pulse = 0.0;

	// ORBIT ANIMATION

	cutoff += dt * 0.1;
	if(cutoff > 2.0) cutoff = 0.0;
	var n = orbits.length;
	for(var i = 0; i < n; ++i)
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

	cam_to_earth_distance = (v3.distance(camera.entity.position, globe.position) - 1.0) / 2.0;
	cam_to_earth_distance = gb.math.clamp(cam_to_earth_distance, 0.0, 1.0);

	atmos_scale = gb.math.lerp(1.08, 0.992, cam_to_earth_distance);
	v3.set(atmos_shift.scale, atmos_scale, atmos_scale, atmos_scale);
	atmos_shift.dirty = true;

	// TODO: slowly spin the star field
}

function debug_update(dt)
{
	gb.debug_view.update(debug_view);
	gb.debug_view.label(debug_view, 'ascale', cam_to_earth_distance);
}

function render()
{
	gl.set_render_target(null, false);


	//set depth mask to be really far back
	//gl.use_shader(background_material.shader);

    //gl.set_blend_mode(null);
	gl.set_state(gl.ctx.DEPTH_TEST, false);
	//gl.render_mesh(background, background_material, camera, null);


	gl.set_state(gl.ctx.DEPTH_TEST, true);


	ocean_material.F_bias = F_bias.value;
	ocean_material.F_scale = F_scale.value;
	ocean_material.F_power = F_power.value;
	atmosphere.entity.material.F_bias = F_bias.value;
	atmosphere.entity.material.F_scale = F_scale.value;
	atmosphere.entity.material.F_power = F_power.value;

    //gl.set_blend_mode(gl.blend_mode.LIGHTEN);

	gl.use_shader(land_material.shader);
	gb.material.set_camera_uniforms(land_material, camera);
	
    gl.render_mesh(rotw, land_material, camera, globe.world_matrix);
	
	var n = country_meshes.length;
	for(var i = 0; i < n; ++i)
	{
		var sp = gb.math.sin(pulse * i);
   		//gb.color.set(land_material.color, sp,sp,sp,1.0);
   		land_material.pulse = (sp / 2.0) + 0.5;
   		land_material.F_bias = F_bias.value;
		land_material.F_scale = F_scale.value;
		land_material.F_power = F_power.value;

		gl.render_mesh(country_meshes[i], land_material, camera, globe.world_matrix);
	}

    gl.render_mesh(ocean, ocean_material, camera, globe.world_matrix);

	gl.render_scene(construct, camera, null, false);

    gl.render_entity(atmosphere.entity, camera);

    n = grid_lines.length;
	for(var i = 0; i < n; ++i)
	{
		gl.render_entity(grid_lines[i].entity, camera);
	}
	
	gb.gl_draw.render(camera, null);
	//gl.render_post_call(fxaa_pass);
}

window.addEventListener('load', init, false);

