//INCLUDE gb.js
//INCLUDE dom/dom.js
//INCLUDE stack.js
//INCLUDE math.js
//INCLUDE matrix.js
//INCLUDE vector.js
//INCLUDE quaternion.js
//INCLUDE rect.js
//INCLUDE bezier.js
//INCLUDE color.js
//INCLUDE time.js
//INCLUDE intersect.js
//INCLUDE canvas/canvas.js
//INCLUDE canvas/scene.js
//INCLUDE input.js
//INCLUDE random.js
//INCLUDE animate.js

gb.init = init;
gb.update = update;

var v2 = gb.vec2;
var v3 = gb.vec3;
var m3 = gb.mat3;
var rand = gb.random;
var draw = gb.canvas;
var input = gb.input;
var scene = gb.scene;

var Player = function()
{
	this.x;
	this.y;
	this.rotation;
	this.w;
	this.h;
	this.vx;
	this.vy;
	this.dir;
	this.entity;	
}
var player;
var construct;

function init()
{
	var k = gb.Keys;
	input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.up, k.down, k.left, k.right],
	});

	var c = draw.new(gb.dom.find('.container'), {width:1136, height:640});
	draw.set_context(c);
	draw.clear_rgb(1,1,1,1);

	player = new Player();
	player.x = 100;
	player.y = 100;
	player.w = 15;
	player.h = 15;
	player.vx = 0;
	player.vy = 0;
	player.rotation = 0;
	player.dir = 0;
	player.entity = gb.entity.new();

	construct = scene.new();
	//m3.compose(construct.matrix, draw.view.width/2, draw.view.height/2, 1,1, 45);
	m3.compose(construct.matrix, 110, 110, 1,1, 0);


	scene.add_entity(construct, player.entity);
}

function update(t)
{
	var dt = gb.time.dt;
	var ctx = gb.canvas.ctx;
	var view = gb.canvas.view;

	/*
	if(input.up(gb.Keys.left))
	{
		if(player.dir === 0) //right
		{
			player.dir = 3; //up
			player.vy = -player.vx;
			player.vx = 0;
			player.rotation = 0;
		}
		else if(player.dir === 1) //down
		{
			player.dir = 0;
			player.vx = player.vy;
			player.vy = 0;
			player.rotation = 270;
		}
		else if(player.dir === 2) //left
		{
			player.dir = 1;
			player.vy = -player.vx;
			player.vx = 0;
			player.rotation = 180;
		}
		else //up
		{
			player.dir = 2;
			player.vx = player.vy;
			player.vy = 0;
			player.rotation = 90;
		}
	}
	else if(input.up(gb.Keys.right))
	{
		if(player.dir === 0) //right
		{
			player.dir = 1; //up
			player.vy = player.vx;
			player.vx = 0;
			player.rotation = 180;
		}
		else if(player.dir === 1) //down
		{
			player.dir = 2;
			player.vx = -player.vy;
			player.vy = 0;
			player.rotation = 90;
		}
		else if(player.dir === 2) //left
		{
			player.dir = 3;
			player.vy = player.vx;
			player.vx = 0;
			player.rotation = 0;
		}
		else //up
		{
			player.dir = 0;
			player.vx = -player.vy;
			player.vy = 0;
			player.rotation = 270;
		}
	}
	*/

	player.rotation += 10 * dt;
	//player.x += player.vx * dt;
	//player.y += player.vy * dt;
	m3.compose(player.entity.local_matrix, player.x, player.y, 1,1, player.rotation);
		
	scene.update(construct);

	draw.clear();
	draw_player(player);
}

function draw_player(p)
{
	var ctx = draw.ctx;
	//draw.set_transform_t(p.entity.local_matrix);
	draw.set_transform(p.x, p.y, 1, 1, p.rotation);
	/*
	ctx.beginPath();
	ctx.moveTo(0,-p.w);
	ctx.lineTo(p.w, p.w);
	ctx.lineTo(-p.w,p.w);
	ctx.lineTo(0,-p.w);
	*/
	draw.fill_rgb(0,0,0,1);
	draw.box(p.x,p.y,p.w,p.h);
	draw.fill();
}

function draw_box(x,y,w,h)
{
	draw.fill_rgb(0.8,0.2,0.3,1.0);
	draw.box(x,y,w,h);
	draw.fill();
}