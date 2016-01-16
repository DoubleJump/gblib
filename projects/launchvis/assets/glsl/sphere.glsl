#VERTEX
attribute vec3 position;

//uniform mat4 mvp;
uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat3 normal_matrix;

uniform vec3 light;
uniform float warp;
uniform float offset;

//varying vec4 _color;
varying vec3 _normal;
varying vec3 _position;
varying vec3 _light;

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

	vec3 p = vec3(mix(position.x, sphere.x, warp),
				  mix(position.y, sphere.y, warp),
				  mix(position.z, sphere.z, warp));

	vec4 pos = view * model * vec4(p, 1.0);
	_position = pos.xyz;
	_normal = normal_matrix * p;
	//_light = vec3(view * model * vec4(light, 1.0));
	_light = light;

	gl_Position = projection * pos;
}

#FRAGMENT
precision highp float;

uniform vec4 color;

varying vec3 _normal;
varying vec3 _position;
varying vec3 _light;

const float GAMMA = 2.2;

vec3 to_gamma(vec3 v) 
{
	return pow(v, vec3(1.0 / GAMMA));
}
vec4 to_gamma(vec4 v) 
{
	return vec4(to_gamma(v.rgb), v.a);
}

float lambert(vec3 light_direction, vec3 normal)
{
    return max(0.0, dot(light_direction, normal));
}

void main()
{
	vec3 N = normalize(_normal);
	vec3 L = normalize(_light - _position);

	float id = lambert(L, N);

	vec4 final = vec4(color.rgb * id, 1.0);
	gl_FragColor = final;
}