#VERTEX
attribute vec3 position;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat3 normal_matrix;

uniform float warp;
uniform float pulse;

varying vec3 _position;

#define PI 3.14159265

vec3 grid_to_sphere(vec3 p, float width, float height)
{
    float radius = width / (2.0 * PI);

	float phi = ((p.y / height) - 0.5) * PI;
	float theta = (p.x / width) * 2.0 * PI;

	float x = radius * sin(theta) * sin(phi);
	float y = radius * cos(phi);
	float z	= radius * cos(theta) * sin(phi);

	return vec3(-x,y,-z);
}

void main()
{
	vec3 sphere = grid_to_sphere(position, 4.0, 2.0) * 1.002;

	_position = vec3(model * vec4(sphere, 1.0));

	gl_Position = projection * view * model * vec4(sphere, 1.0);
}

#FRAGMENT
precision highp float;

uniform vec3 light;
uniform vec3 eye;

uniform float F_bias;
uniform float F_scale;
uniform float F_power;

varying vec3 _position;

//INCLUDE lib/glsl/gamma.glsl
//INCLUDE lib/glsl/lambert.glsl
//INCLUDE lib/glsl/fresnel.glsl

void main()
{
	vec3 N = normalize(_position);
	vec3 L = normalize(light - _position);
	vec3 E = normalize(eye - _position);

	//float fr = fresnel(E, N, F_bias, F_scale, F_power);
	float fr = fresnel(E, N, 0.64, -0.86, -4.0);

	float id = lambert(L, N);
	id = clamp(id, 0.02,1.0);

	//vec4 C = to_linear(vec4(F_bias, F_scale, F_power, 1.0));
	vec4 A = to_linear(vec4(0.0, 0.02, 0.17, 0.0));
	vec4 B = to_linear(vec4(0.449,0.769,0.892, 1.0));
	vec4 C = to_linear(vec4(0.02,0.2,0.53, 1.0));


	vec4 color = mix(C,B, id);
	vec4 glow  = mix(color, A, fr);

	gl_FragColor = glow;
}