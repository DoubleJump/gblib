//INCLUDE projects/shadertoy/js/gblib.js

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
var cube;

function init()
{
	gb.init(
	{
		config:
		{
			frame_skip: false,
			update: update, 
			/*render: render,*/
		}
	});

	gb.assets.load("assets/assets.gl", load_complete);
}

function load_complete(asset_group)
{

	assets = asset_group;
	cube = gb.entity.mesh(gb.mesh.quad(2,2,0), gb.material.new(assets.shaders.shapes));
	v2.set(cube.material.resolution, 512, 512);

	debug_view = gb.debug_view.new(document.body);
	gb.debug_view.watch(debug_view, 'Mouse', cube.material, 'mouse');

	gb.allow_update = true;
}

function update(dt)
{
	gb.debug_view.update(debug_view);
	cube.material.t += dt;
	v2.set(cube.material.mouse, input.mouse_position[0], input.mouse_position[1]);
	if(input.down(gb.Keys.a))
	{
		render();
	}
}

function render()
{
	var gl = gb.webgl;
	gl.use_shader(cube.material.shader);
	gl.link_attributes(cube.material.shader, cube.mesh);
	gl.set_uniforms(cube.material);
	gl.draw_mesh(cube.mesh);
}

window.addEventListener('load', init, false);

