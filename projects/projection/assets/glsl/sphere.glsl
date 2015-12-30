#VERTEX
attribute vec3 position;
attribute float color;

uniform mat4 mvp;
uniform float warp_x;
uniform float warp_y;

varying float _color;

#define PI 3.14159

vec3 grid_to_sphere(vec3 p, float width, float height)
{
    float radius = width / (2.0 * PI);

	float phi = ((p.y / height)-0.5) * PI * warp_y;
	float theta = (p.x / width) * 2.0 * PI * warp_x;

	float x = radius * sin(theta) * sin(phi);
	float y = radius * cos(phi);
	float z	= radius * cos(theta) * sin(phi);

	return vec3(-x,y,-z);
}

void main()
{
	vec3 polar = grid_to_sphere(position, 4.0, 2.0);
	gl_Position = mvp * vec4(polar, 1.0);
    _color = color;
}

#FRAGMENT
precision highp float;

varying float _color;

void main()
{
	vec3 rgb = vec3(1.0 - _color);
    gl_FragColor = vec4(rgb, 1.0);
    //gl_FragColor = vec4(1.0);
}