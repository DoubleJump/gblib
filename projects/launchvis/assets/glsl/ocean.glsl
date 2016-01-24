#VERTEX
attribute vec3 position;

uniform mat4 mvp;
uniform mat4 model;


varying vec3 _position;
varying vec4 _mPos;

void main()
{
	_position = position;
	_mPos = model * vec4(position, 1.0);
	gl_Position = mvp * vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

uniform float F_bias;
uniform float F_scale;
uniform float F_power;

uniform vec3 light;

varying vec3 _position;
varying vec4 _mPos;


//INCLUDE lib/glsl/gamma.glsl
//INCLUDE lib/glsl/curve.glsl
//INCLUDE lib/glsl/lambert.glsl

void main()
{
	float radius = length(_position) / 0.707;
	//radius = curve(radius, 0.0, F_bias, F_scale, 1.0);
	radius = curve(radius, 0.0, -1.17, 0.46, 1.0);

	vec3 N = normalize(_mPos.xyz);
	vec3 L = normalize(light - _mPos.xyz);

	float id = lambert(L, N);
	id = clamp(id, 0.0, 1.0);

	//vec3 base = to_linear(vec3(0.035,0.035,0.035));
	vec3 base = to_linear(vec3(0.1,0.12,0.14));
	vec3 atmos = to_linear(vec3(0.349,0.669,0.792));
	vec3 red = to_linear(vec3(0.37,0.22,0.28));


	vec3 col = mix(red, atmos, id);

	vec3 surface = mix(base, col, radius);
	vec3 final = surface;

	gl_FragColor = vec4(final, 1.0);
}