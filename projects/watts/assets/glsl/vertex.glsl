#VERTEX
attribute vec3 position;
attribute vec3 color;
attribute vec3 normal;

uniform mat4 model;
uniform mat4 mvp;
uniform mat3 normal_matrix;

varying vec3 _position;
varying vec3 _color;
varying vec3 _normal;

void main()
{
	_position = vec3(model * vec4(position, 1.0));
	_color = color;
    _normal = normal_matrix * normal;

	gl_Position = mvp * vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

uniform vec3 light;
//uniform vec3 eye;

varying vec3 _position;
varying vec3 _color;
varying vec3 _normal;

//INCLUDE lib/glsl/gamma.glsl
//INCLUDE lib/glsl/lambert.glsl
//INCLUDE lib/glsl/fresnel.glsl
//INCLUDE lib/glsl/specular.glsl

void main()
{
	vec3 N = normalize(_normal);
	vec3 L = normalize(light - _position);
	//vec3 E = normalize(eye - _position);
	//vec3 R = reflect(L, N);

	//float fr = fresnel(E, N, 0.64, -0.86, -4.0);
	//float spec = specular(E, -R, 2.0, 0.3);

	float id = lambert(L, N);

    gl_FragColor = to_gamma(vec4(to_linear(_color) * id, 1.0));
}