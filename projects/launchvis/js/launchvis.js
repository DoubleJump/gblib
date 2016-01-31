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
var orbit_depth_target;
//var surface_target;
//var fxaa_pass;

var globe;
var stars;
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
var orbit_shadows = [];
var grid_lines = [];

var cutoff;
var pulse;

var F_bias = 0.5;
var F_scale = 0.5;
var F_power = 1.0;

var sunlight;
var sun_camera;

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
	/*
	background = gb.mesh.quad(2,2);
	background_material = gb.material.new(assets.shaders.background);
	background_material.mag = gb.math.sqrt((gl.view.width / 2) * (gl.view.height / 2));
	v2.set(background_material.res, gl.view.width / 2 , gl.view.height / 2);
	*/

	// LIGHTS

	sunlight = gb.vec3.new(8.0,5.0,5.0);
	//sun_camera = gb.camera.new();
	//sun_camera.entity.position[2] = 3.0;
	//sun_camera.entity.position = sunlight;
	//qt.from_to(sun_camera.entity.rotation, sunlight, v3.tmp(0,0,-1));
	//scene.add(sun_camera);

	// OCEAN

	// TODO: generate a quad so we can sdf the sphere 
	//orbit_depth_target = gb.render_target.new();

	ocean = assets.meshes['ocean'];
	ocean_material = gb.material.new(assets.shaders.ocean);
	ocean_material.light = sunlight;
	//ocean_material.orbit_depth = orbit_depth_target.color;
	//ocean_material.light_matrix = sun_camera.entity.world_matrix;

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
	scene.add(atmosphere);

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
		gb.color.set(mat.color, 0.54,0.56,0.94,1.0);
		orbit.entity.material = mat;
		mat.line_width = orbit.thickness;
		mat.start = 0;
		mat.end = orbit.length;
		mat.aspect = gl.aspect;
		gb.entity.set_rotation(orbit.entity, tx,ty,0);

		scene.add(orbit);
		orbits.push(orbit);

		var shadow = gb.line_mesh.ellipse(0.64,0.64, 90,0.005);
		mat = gb.material.new(asset_group.shaders.line);
		gb.color.set(mat.color, 0.1,0.1,0.1,0.1); 
		shadow.entity.material = mat;
		mat.line_width = shadow.thickness;
		mat.start = 0;
		mat.end = shadow.length;
		mat.aspect = gl.aspect;
		gb.entity.set_rotation(shadow.entity, tx,ty,0);

		scene.add(shadow);
		orbit_shadows.push(shadow);
	}



	cutoff = 0.0;
	pulse = 0.0;


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
	}

	add_lat_line(asset_group, 0.64, 0.0);
	add_lat_line(asset_group, 0.617, (0.1667 * 1));
	add_lat_line(asset_group, 0.545, (0.1667 * 2));
	add_lat_line(asset_group, 0.398, (0.1667 * 3));
	add_lat_line(asset_group, 0.617, (-0.1667 * 1));
	add_lat_line(asset_group, 0.545, (-0.1667 * 2));
	add_lat_line(asset_group, 0.398, (-0.1667 * 3));



    // STAR FIELD

    var num_stars = 6000;
    var star_buffer = new gb.Vertex_Buffer();
    star_buffer.data = new Float32Array(num_stars * 3);
    for(var i = 0; i < num_stars; i+=6)
    {
    	star_buffer.data[i  ] = gb.random.float(0,30) * gb.random.sign();
    	star_buffer.data[i+1] = gb.random.float(0,30) * gb.random.sign();
    	star_buffer.data[i+2] = gb.random.float(0,30) * gb.random.sign();

    	star_buffer.data[i+3] = gb.random.float(0.3,0.5);
    	star_buffer.data[i+4] = gb.random.float(0.3,0.5);
    	star_buffer.data[i+5] = gb.random.float(0.5,0.6);
    }
    //gb.random.fill(star_buffer.data, -5, 5);
    gb.vertex_buffer.add_attribute(star_buffer, 'position', 3);
    gb.vertex_buffer.add_attribute(star_buffer, 'color', 3);

    var star_mesh = new gb.Mesh();
	star_mesh.layout = gb.webgl.ctx.POINTS;
	star_mesh.update_mode = gb.webgl.ctx.STATIC_DRAW;
    star_mesh.vertex_buffer = star_buffer;
    gb.mesh.update(star_mesh);

    var star_material = gb.material.new(asset_group.shaders.stars);
    stars = gb.entity.mesh(star_mesh, star_material);
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

	//gb.quat.mul(rot_lerp, rot_y, rot_x);

	/*
	var rot_lerp = qt.tmp();
	qt.from_to(rot_lerp, v3.tmp(0,0,-1), to_camera);
	gb.quat.lerp(camera.entity.rotation, camera.entity.rotation, rot_lerp, 0.1);
	*/
	qt.from_to(camera.entity.rotation, v3.tmp(0,0,-1), to_camera);
	camera.entity.dirty = true;

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
		var shadow = orbit_shadows[i];
		//var offset = 10.0 / i;
		if(cutoff > 1.0) 
		{
			orbit.entity.material.start = orbit.length * (cutoff - 1.0);
			shadow.entity.material.start = shadow.length * (cutoff - 1.0);
		}
		else 
		{
			orbit.entity.material.start = 0;
			orbit.entity.material.end = orbit.length * cutoff;// + offset;

			shadow.entity.material.start = 0;
			shadow.entity.material.end = shadow.length * cutoff;// + offset;
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
	if(input.down(gb.Keys.h))
	{
		debug_view.visible = !debug_view.visible;
		gb.debug_view.set_visible(debug_view);
	}
	gb.debug_view.update(debug_view);
	gb.debug_view.label(debug_view, 'ascale', cam_to_earth_distance);
}

function render()
{
	var n;

    gl.set_blend_mode(null);

    /*
    gl.set_render_target(orbit_depth_target, true);
    n = orbits.length;
	for(var i = 0; i < n; ++i)
	{
		var orbit = orbits[i];
		orbit.entity.material.F_bias = F_bias.value;
		orbit.entity.material.F_scale = F_scale.value;
		orbit.entity.material.F_power = F_power.value;
		gl.render_entity(orbit.entity, sun_camera);
	}
	*/

	gl.set_render_target(null, false);

	//gl.set_state(gl.ctx.DEPTH_TEST, false);
	//gl.render_mesh(background, background_material, camera, null);


	gl.set_state(gl.ctx.DEPTH_TEST, true);


	ocean_material.F_bias = F_bias.value;
	ocean_material.F_scale = F_scale.value;
	ocean_material.F_power = F_power.value;
	atmosphere.entity.material.F_bias = F_bias.value;
	atmosphere.entity.material.F_scale = F_scale.value;
	atmosphere.entity.material.F_power = F_power.value;


	gl.use_shader(land_material.shader);
	gb.material.set_camera_uniforms(land_material, camera);
	
    gl.render_mesh(rotw, land_material, camera, globe.world_matrix);
	
	n = country_meshes.length;
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


    n = orbits.length;
    gl.set_blend_mode(gl.blend_mode.LIGHTEN);
	for(var i = 0; i < n; ++i)
	{
		var orbit = orbits[i];
		//gb.color.set(orbit.entity.material.color, F_bias.value, F_scale.value, F_power.value, 1.0);
		gl.render_entity(orbit.entity, camera);
	}
    gl.set_blend_mode(null);
    

    gl.render_entity(atmosphere.entity, camera);

    for(var i = 0; i < n; ++i)
	{
		var shadow = orbit_shadows[i];
		gl.render_entity(shadow.entity, camera);
	}

    gl.set_blend_mode(gl.blend_mode.LIGHTEN);
    n = grid_lines.length;
	for(var i = 0; i < n; ++i)
	{
		gl.render_entity(grid_lines[i].entity, camera);
	}


	gl.render_entity(stars, camera);

	
	gb.gl_draw.render(camera, null);
}

window.addEventListener('load', init, false);

