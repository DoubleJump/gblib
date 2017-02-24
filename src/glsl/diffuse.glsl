#VERTEX
attribute vec3 position;
attribute vec4 color;

varying vec3 _position;
varying vec3 _normal;
varying vec4 _color;
varying vec3 _light;

//uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat3 normal_matrix;


void main()
{ 
	vec3 light = vec3(10.0, 10.0, 10.0);
	vec4 p = view * vec4(position, 1.0);
	
	_position = p.xyz;
	_color = color;
	_light = vec3(view * vec4(light, 1.0));
    _normal = normal_matrix * normalize(position);

	gl_Position = projection * p;
}

#FRAGMENT
precision highp float;

varying vec3 _position;
varying vec3 _normal;
varying vec4 _color;
varying vec3 _light;

const float GAMMA = 2.2;

vec3 to_linear(vec3 v) 
{
	return pow(v, vec3(GAMMA));
}
vec4 to_linear(vec4 v) 
{
	return vec4(to_linear(v.rgb), v.a);
}
vec3 to_gamma(vec3 v) 
{
	return pow(v, vec3(1.0 / GAMMA));
}
vec4 to_gamma(vec4 v) 
{
	return vec4(to_gamma(v.rgb), v.a);
}

float lambert(vec3 N, vec3 L)
{
    return max(0.0, dot(N, L));
}

void main()
{ 
	vec3 N = normalize(_normal);
	vec3 L = normalize(_light - _position);

	float tl = lambert(N, L);

	vec4 surface_color = to_linear(vec4(1.0));
    vec4 light_color = to_linear(vec4(1.0));
	vec4 final = vec4(surface_color.rgb * light_color.rgb * tl, 1.0);
    gl_FragColor = to_gamma(final);
}