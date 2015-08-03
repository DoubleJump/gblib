//INCLUDE gb.js
//DEBUG
//INCLUDE debug.js
//END
//INCLUDE dom.js
//INCLUDE stack.js
//INCLUDE math.js
//INCLUDE vector.js
//INCLUDE quaternion.js
//INCLUDE rect.js
//INCLUDE bezier.js
//INCLUDE color.js
//INCLUDE time.js
//INCLUDE intersect.js
//INCLUDE canvas.js
//DEBUG
//INCLUDE gl_draw.js
//END
//INCLUDE input.js
//INCLUDE random.js
//INCLUDE animate.js

gb.init = init;
gb.update = update;

var v2 = gb.vec2;
var v3 = gb.vec3;
var rand = gb.random;
var draw = gb.canvas;

var Orb = function()
{
	this.radius;
	this.position;
}

var Box = function()
{
	this.position;
	this.width;
	this.height;
}

var Segment = function()
{
	this.start;
	this.end;
	this.dir;
}

var orb;
var box;
var charge;
var segment;



function init()
{
	var k = gb.Keys;
	gb.input.init(document,
	{
		keycodes: [k.mouse_left, k.a, k.x, k.z, k.up, k.down, k.left, k.right],
	});
	var c = draw.new(gb.dom.find('.container'));
	draw.set_context(c);
	draw.clear_rgb(0.1,0.1,0.1,1.0);

	orb = new Orb();
	orb.position = v2.new(100,100);
	orb.radius = 30;

	box = new Box();
	box.position = v2.new(200,200);
	box.width = 100;
	box.height = 100;

	segment = new Segment();
	segment.start = v2.new(100,200);
	segment.end = v2.new(200,250);
	segment.dir = 1;

	charge = 0;
}

function update(t)
{
	var dt = gb.time.dt;
	var ctx = gb.canvas.ctx;
	var view = gb.canvas.view;
	draw.clear();

	var m_pos = gb.input.mouse_position;
	var m_held = gb.input.held(0);
	var m_up = gb.input.up(0);
	var m_delta = gb.input.mouse_delta;

	if(m_held)
	{
		charge += dt;
	}
	else
	{
		//do pulse
		charge = 0;
	}
	charge = gb.math.clamp(charge, 0, 1);

	var speed = 100;
	if(gb.input.held(gb.Keys.left))
	{
		orb.position[0] -= speed * dt;
	}
	else if(gb.input.held(gb.Keys.right))
	{
		orb.position[0] += speed * dt;
	}
	if(gb.input.held(gb.Keys.up))
	{
		orb.position[1] -= speed * dt;
	}
	else if(gb.input.held(gb.Keys.down))
	{
		orb.position[1] += speed * dt;
	}
	

	draw.text("Charge: " + charge, 10, 10);

	

	
	var l = v2.tmp();
	v2.sub(l, segment.end, segment.start);
	var n = v2.tmp();
	n[0] = -l[1];
	n[1] = l[0];

	v2.normalized(n, n);
	v2.mulf(n, n, orb.radius * segment.dir);
	
	var a = v2.tmp();
	var b = v2.tmp();
	v2.add(a, segment.start, n);
	v2.add(b, segment.end, n);


	draw.stroke_rgb(1.0,1.0,0.2,1.0);
	draw.line_t(segment.start, segment.end).stroke();
	draw.stroke_rgb(1.0,1.0,1.0,0.2);
	draw.circle_t(segment.start, orb.radius).stroke();
	draw.circle_t(segment.end, orb.radius).stroke();
	draw.line_t(a,b).stroke();

	var p2 = v2.tmp();
	v2.eq(p2, orb.position);
	p2[1] -= 100;
	draw.line_t(p2, orb.position).stroke();

	var hit = gb.hit.tmp();
	
	//(h, c,r, a,b)
	gb.intersect.line_circle(hit, segment.start, orb.radius, orb.position, p2);
	/*
	if(hit.hit === false)
	{
		gb.intersect.line_circle(hit, segment.end, orb.radius, orb.position, p2);
	}
	
	if(hit.hit === false)
	{
		gb.intersect.line_line(hit, orb.position, p2, a, b);
	}
	*/

	if(hit.hit === true)
	{
		draw.fill_rgb(1.0,0.3,0.3,1.0);
	}
	else
	{
		draw.fill_rgb(0.8,0.8,0.8,1.0);
	}
	draw.circle_t(orb.position, orb.radius).fill();
}

