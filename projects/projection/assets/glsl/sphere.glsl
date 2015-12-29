#VERTEX
attribute vec3 position;
attribute vec4 color;

uniform mat4 mvp;
uniform float warp_x;
uniform float warp_y;

varying vec4 _color;

#define PI 3.14159
#define DEG2RAD 0.01745329251

/*
vec3 polar_to_cartesian(float theta, float phi, float radius)
{
    float x = radius * sin(theta) * cos(phi);
	float y = radius * sin(theta) * sin(phi);
	float z	= radius * cos(theta);
    return vec3(x,y,z);
}
*/

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
    //gl_Position = mvp * vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

varying vec4 _color;

void main()
{
    gl_FragColor = _color;
    //gl_FragColor = vec4(1.0);
}