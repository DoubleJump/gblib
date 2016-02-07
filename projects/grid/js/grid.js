//INCLUDE projects/grid/js/gblib.js
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
var cube;
var camera;
var surface_target;
var fxaa_pass;

var WaveNode = function(x,y)
{
	this.position = v2.new(x,y);
	this.acceleration = 0.0;
	this.velocity = 0.0;
	this.left_delta = 0;
	this.right_delta = 0;
}
var NUM_WAVE_NODES = 100;
var wave_nodes = [];

var node_mass_slider;
var node_damping_slider;
var node_spring_slider;
var node_spread_slider;

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
			fill_container: false,
			antialias: true,
		}
	});

	gb.assets.load("assets/assets.gl", load_complete);
}

function load_complete(asset_group)
{
	debug_view = gb.debug_view.new(document.body);

	assets = asset_group;
	construct = scene.new(null, true);

	/*
	cube = gb.entity.mesh(gb.mesh.cube(2,1,1), gb.material.new(assets.shaders.surface));
	cube.spin = 0;
	scene.add(cube);
	*/

	//0.521 0.282 0.262
	//1.0 0.937 0.643
	//0.905 0.78 0.29

	gl.set_clear_color(0.521, 0.282, 0.262, 1.0);

	camera = gb.camera.new();
	camera.entity.position[0] = 5.0;
	camera.entity.position[2] = 6.0;
	scene.add(camera);

	
	for(var i = 0; i < NUM_WAVE_NODES; ++i)
	{
		var node = new WaveNode(i * 0.1, 0);
		wave_nodes.push(node);
	}
	

	node_mass_slider = gb.debug_view.control(debug_view, 'MASS', 0.01, 1.0, 0.01, 0.1);
	node_damping_slider = gb.debug_view.control(debug_view, 'DAMPING', 0.95, 1.0, 0.001, 0.995);
	node_spring_slider = gb.debug_view.control(debug_view, 'SPRING', 0.1, 1.0, 0.01, 0.1);
	node_spread_slider = gb.debug_view.control(debug_view, 'SPREAD', 0.1, 3.0, 0.01, 3.0);


	/*
	surface_target = gb.render_target.new();
	fxaa_pass = gb.post_call.new(gb.material.new(assets.shaders.fxaa), null);
	fxaa_pass.material.texture = surface_target.color;
	v2.set(fxaa_pass.material.resolution, gl.view.width, gl.view.height);
	v2.set(fxaa_pass.material.inv_resolution, 1.0 / gl.view.width, 1.0 / gl.view.height);
	*/
	gb.allow_update = true;
}

function update(dt)
{
	gb.camera.fly(camera, dt, 80);
	
	var SPRING_CONSTANT = node_spring_slider.value;
	var BASE_HEIGHT = 0.0;
	var DAMPING = node_damping_slider.value;
	var NODE_MASS = node_mass_slider.value;

	if(input.held(gb.Keys.q))
	{
		wave_nodes[50].velocity += 1.0;
	}

	wave_nodes[0].velocity = 0;
	wave_nodes[NUM_WAVE_NODES - 1].velocity = 0;
	for(var i = 0; i < NUM_WAVE_NODES; ++i)
	{
		var node = wave_nodes[i];
		var force = SPRING_CONSTANT * (node.position[1] - BASE_HEIGHT) + node.velocity;
		node.acceleration -= (force / NODE_MASS) * dt;
		node.position[1] += node.velocity * dt;
		node.velocity *= DAMPING;
		node.velocity += node.acceleration * dt;
	}

	var SPREAD = node_spread_slider.value;
	for(var j = 0; j < 8; ++j)
	{
	    for(var i = 0; i < NUM_WAVE_NODES; ++i)
	    {
	    	var node = wave_nodes[i];
	        if(i > 0)
	        {
	        	var left_node = wave_nodes[i-1];
	            node.left_delta = SPREAD * (node.position[1] - left_node.position[1]);
	            left_node.velocity += node.left_delta * dt;
	        }
	        if(i < NUM_WAVE_NODES - 1)
	        {
	        	var right_node = wave_nodes[i+1];
	            node.right_delta = SPREAD * (node.position[1] - right_node.position[1]);
	            right_node.velocity += node.right_delta * dt;
	        }
	    }
	}
	for (var i = 0; i < NUM_WAVE_NODES; ++i)
	{
	    if(i > 0) 
	    {
	        var left_node = wave_nodes[i-1];
	        left_node.position[1] += wave_nodes[i].left_delta * dt;
	    }
	    if(i < NUM_WAVE_NODES - 1) 
	    {
			var right_node = wave_nodes[i+1];
	        right_node.position[1] += wave_nodes[i].right_delta * dt;
	    }
	}

	var start = v3.tmp();
	var end = v3.tmp();
	for(var i = 0; i < NUM_WAVE_NODES-1; ++i)
    {
    	var node = wave_nodes[i];
       	var next = wave_nodes[i+1];
       	v3.set(start, node.position[0], node.position[1], 0);
       	v3.set(end, next.position[0], next.position[1], 0);
       	gb.gl_draw.line(start, end);
    }

    //gb.gl_draw.line(v3.tmp(0,0,0), v3.tmp(1,1,1));
	/*
	cube.spin += 30 * dt;
	gb.entity.set_rotation(cube, cube.spin, cube.spin, cube.spin);
	*/
}

function debug_update(dt)
{
	gb.debug_view.update(debug_view);
}

function render()
{
	gl.render_scene(construct, camera, null, true);
	//gl.render_post_call(fxaa_pass);

	gb.gl_draw.render(camera, null);
}

window.addEventListener('load', init, false);

