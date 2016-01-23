#VERTEX
attribute vec3 position;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat3 normal_matrix;

varying vec3 _normal;
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
	vec3 sphere = grid_to_sphere(position, 4.0, 2.0);
	_position = vec3(model * vec4(sphere, 1.0));

	gl_Position = projection * view * model * vec4(sphere, 1.0);
}

#FRAGMENT
precision highp float;

//uniform vec4 color;
uniform vec3 lightA;
uniform vec3 lightB;

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
	// sdf

	vec3 N = normalize(_position);
	vec3 LA = normalize(lightA - _position);
	vec3 LB = normalize(lightB - _position);
	vec3 E = normalize(eye - _position);

	//vec3 base = to_linear(vec3(0.7,0.7,0.95));
	vec3 base = to_linear(vec3(0.6,0.6,0.6));

	vec3 atmos = to_linear(vec3(0.0,0.0,0.0));
	//float scatter = fresnel(E, N, F_bias, F_scale, F_power * 3.0);
	//float scatter = fresnel(E, N, 0.8, 0.15, 0.7);
	float scatter = fresnel(E, N, 0.0, 0.08, 3.0);

	scatter = clamp(scatter, 0.0, 1.0);
	
	vec3 surface = mix(atmos, base, scatter);
	//vec3 surface = base;

	float dA = lambert(N, LA) * attenuation(length(lightA - _position), 1.0,0.0,0.0);
	float dB = lambert(N, LB) * attenuation(length(lightB - _position), 1.0,0.0,0.0) * 0.3;
	//float dA = lambert(N, LA) * attenuation(length(lightA - _position), F_bias,F_scale,F_power);
	//float dB = lambert(N, LB) * attenuation(length(lightB - _position), F_bias,F_scale,F_power);


	vec3 diffuse = (dA * vec3(0.5,0.5,1.0)) + (dB * vec3(0.6, 0.9, 1.0));
	//diffuse = clamp(diffuse, 0.0, 1.0);

	vec3 final = to_gamma(surface * diffuse);
	gl_FragColor = vec4(final, 1.0);
}