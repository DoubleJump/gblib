#VERTEX
attribute vec3 position;

uniform mat4 mvp;
uniform float warp;
//uniform float warp_y;
uniform float offset;
uniform vec4 color;

varying vec4 _color;

#define PI 3.14159

vec3 grid_to_sphere(vec3 p, float width, float height)
{
    float radius = width / (2.0 * PI);

	float phi = ((p.y / height)-0.5) * PI;
	float theta = (p.x / width) * 2.0 * PI;

	float x = radius * sin(theta) * sin(phi);
	float y = radius * cos(phi);
	float z	= radius * cos(theta) * sin(phi);

	return vec3(-x,y,-z);
}

void main()
{
	vec3 sphere = grid_to_sphere(position, 4.0, 2.0) * offset;

	float x = mix(position.x, sphere.x, warp);
	float y = mix(position.y, sphere.y, warp);
	float z = mix(position.z, sphere.z, warp);

	gl_Position = mvp * vec4(vec3(x,y,z), 1.0);
    _color = color;
}

#FRAGMENT
precision highp float;

varying vec4 _color;

void main()
{
    gl_FragColor = _color;
    //gl_FragColor = vec4(1.0);
}