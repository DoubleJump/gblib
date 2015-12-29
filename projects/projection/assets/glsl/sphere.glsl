#VERTEX
attribute vec3 position;
attribute vec4 color;

uniform mat4 mvp;
uniform float warp_x;
uniform float warp_y;

varying vec4 _color;

#define PI 3.14159
#define DEG2RAD 0.01745329251

vec3 polar_to_cartesian(float theta, float phi, float radius)
{
    float x = radius * sin(theta) * cos(phi);
	float y = radius * sin(theta) * sin(phi);
	float z	= radius * cos(theta);
    return vec3(x,y,z);
}


vec3 grid_to_sphere(vec3 p, float width, float height)
{
    float radius = width / (2.0 * PI);

	//float lng = ((p.x / (width / 2.0)) * 180.0) * DEG2RAD;
	//float lat = ((p.y / (height / 2.0)) * 90.0) * DEG2RAD;

	//float lat = (PI / 2.0) * (1.0 * p.x - 1.0);
	//float lng = (PI / 2.0) * (2.0 * p.y + 1.0);

	float lat = (p.y / height) * 2.0 * PI;
	float lng = (p.x / width) - 0.5 * PI;

	return polar_to_cartesian(lat, lng, radius);
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