//INCLUDE gb.js
//DEBUG
//INCLUDE debug.js
//END
//INCLUDE dom.js
//INCLUDE stack.js
//INCLUDE math.js
//INCLUDE vector.js
//INCLUDE quaternion.js
//INCLUDE matrix.js
//INCLUDE rect.js
//INCLUDE aabb.js
//INCLUDE bezier.js
//INCLUDE color.js
//INCLUDE time.js
//INCLUDE canvas.js
//DEBUG
//INCLUDE gl_draw.js
//END
//INCLUDE input.js
//INCLUDE random.js
//INCLUDE animate.js

var focus = true;

window.addEventListener('load', init, false);

var Grid = function()
{
	this.cells_x;
	this.cells_y;
	this.cell_width;
	this.cell_height;
	this.hw;
	this.hh;
	this.cell_count;
	this.cells = [];
}

var Cell = function(type)
{
	this.type = type;
	this.vector;
	this.density;
}

var grid;
var grid_t;
var surface_edit;
var surface_x;
var surface_y;
var v2 = gb.vec2;
var v3 = gb.vec3;
var rand = gb.random;
var draw = gb.canvas;

function init()
{
	var k = gb.Keys;

	gb.time.init();
	gb.input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.one, k.two, k.three, k.up, k.down],
	});
	var c = gb.canvas.new(gb.dom.find('.container'));
	gb.canvas.set_context(c);
	
	window.onfocus = on_focus;
	window.onblur = on_blur;

	grid = new Grid();
	grid.cells_x = 10;
	grid.cells_y = 10;
	grid.cell_width = 50;
	grid.cell_height = 50;
	grid.cell_count = 100;
	grid.hw = 25;
	grid.hh = 25;

	for(var i = 0; i < grid.cell_count; ++i)
	{
		var c = new Cell();
		c.type = 0;
		c.vector = v2.new(1,0);
		c.density = 1;
		grid.cells.push(c);
	}

	surface_edit = false;

	requestAnimationFrame(update);
}

function on_focus(e)
{
	console.log('focus');
	focus = true;
}
function on_blur(e)
{
	console.log('blur');
	focus = false;
}



function update(t)
{
	gb.time.update(t);
	if(gb.time.paused || focus === false)
	{
		requestAnimationFrame(update);
		return;
	}

	var at = gb.time.at;
	var dt = gb.time.dt;
	gb.stack.clear_all();

	var ctx = gb.canvas.ctx;
	var view = gb.canvas.view;

	var m_pos = gb.input.mouse_position;
	var m_held = gb.input.held(0);
	var m_up = gb.input.up(0);
	var m_down = gb.input.down(0);
	var m_delta = gb.input.mouse_delta;

	draw.clear();

	
	var ix = gb.math.floor(m_pos[0] / grid.cell_width);
	var iy = gb.math.floor(m_pos[1] / grid.cell_height);

	if(ix < 0) ix = 0;
	else if(ix > grid.cells_x-1) ix = grid.cells_x - 1;
	if(iy < 0) iy = 0;
	else if(iy > grid.cells_y-1) iy = grid.cells_y - 1;

	draw.fill_rgb(0.5,0.5,0.5,1);
	draw.rect(ix * grid.cell_width, iy * grid.cell_height, grid.cell_width, grid.cell_height).fill();


	// Draw cells
	for(var x = 0; x < grid.cells_x; ++x)
	{
		for(var y = 0; y < grid.cells_y; ++y)
		{
			var i = x + (y * grid.cells_x);
			var c = grid.cells[i];
			var v = c.vector;
			var d = c.density;

			var cx = (x * grid.cell_width) + grid.hw;
			var cy = (y * grid.cell_height) + grid.hh;

			draw.stroke_rgb(v[0] / 2 + 0.5, v[1] / 2 + 0.5, 0.5, 1);
			draw.line(cx - v[0] * 10, cy - v[1] * 10, cx + v[0] * 10, cy + v[1] * 10);
			draw.stroke();

			//draw.fill_rgb(v[0] / 2 + 0.5, v[1] / 2 + 0.5, 0.5, 1);
			//draw.rect(x * grid.cell_width, y * grid.cell_height, grid.cell_width,grid.cell_height).fill();
		}
	}

	// Draw grid
	draw.stroke_rgb(1,1,1,1);
	draw.stroke_width(1);
	for(var x = 0; x < grid.cells_x; ++x)
	{
		for(var y = 0; y < grid.cells_y; ++y)
		{
			draw.rect(x * grid.cell_width, y * grid.cell_height, grid.cell_width,grid.cell_height).stroke();
		}
	}

	var ic = ix + (iy * grid.cells_x);

	if(surface_edit === true)
	{
		if(gb.input.up(gb.Keys.a))
		{
			surface_edit = false;
		}

		var cx = (surface_x * grid.cell_width) + grid.hw;
		var cy = (surface_y * grid.cell_height) + grid.hh;
		var dx = m_pos[0] - cx;
		var dy = m_pos[1] - cy;

		var vt = v2.tmp(dx, dy);
		var v = grid.cells[surface_x + (surface_y * grid.cells_x)].vector;
		v2.normalized(v, vt);
		//v2.eq(v,vt);

		draw.line(cx,cy,m_pos[0],m_pos[1]).stroke(0);
	}
	else
	{
		if(gb.input.down(gb.Keys.a))
		{
			surface_edit = true;
			surface_x = ix;
			surface_y = iy;
		}
	}

	

	if(m_down)
	{
		v2.set(grid.cells[ic].vector, 1,1);
	}

	gb.input.update();

	requestAnimationFrame(update);
}