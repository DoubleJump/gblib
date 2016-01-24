#VERTEX
attribute vec3 position;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat3 normal_matrix;

//uniform vec3 light;
uniform float warp;
uniform float pulse;

//varying vec3 _normal;
varying vec3 _position;
//varying vec3 _light;

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
	vec3 sphere = grid_to_sphere(position, 4.0, 2.0);// * (1.0 + pulse * 0.2);
	//vec3 p = mix(position, sphere, warp);

	_position = vec3(model * vec4(sphere, 1.0));
	//_light = light;

	gl_Position = projection * view * model * vec4(sphere, 1.0);
}

#FRAGMENT
precision highp float;

uniform float pulse;
uniform vec3 light;
uniform vec3 eye;

uniform float F_bias;
uniform float F_scale;
uniform float F_power;

varying vec3 _position;
//varying vec3 _light;

//INCLUDE lib/glsl/gamma.glsl
//INCLUDE lib/glsl/lambert.glsl
//INCLUDE lib/glsl/fresnel.glsl

void main()
{
	vec3 N = normalize(_position);
	vec3 L = normalize(light - _position);
	vec3 E = normalize(eye - _position);

	float fr = fresnel(E, N, F_bias, F_scale, F_power);

	vec3 A = to_linear(vec3(1.0));
	vec3 B = to_linear(vec3(0.349,0.669,0.792));
	

	float id = lambert(L, N);
	id = clamp(id, 0.13,1.0);

	//vec3 final = mix(A, B, fr);
	vec3 final = vec3(1.0);
	
	//vec3 final = to_gamma(mix(A, B, pulse) * id);

	gl_FragColor = to_gamma(vec4(final, id * pulse));


	/*
	float diffuse = exp_step(1.0 - id, 16000.0, 30.0); 
	
	diffuse = clamp(diffuse, 0.05, 1.0);

	vec4 color_linear = to_linear(color);
	color_linear.rgb *= diffuse;

	vec4 color_gamma = to_gamma(color_linear);

	gl_FragColor = color_gamma;
	*/
}