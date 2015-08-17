#VERTEX
attribute vec3 position;
attribute vec3 normal;
//attribute vec2 uv;

uniform mat4 proj_matrix;
uniform mat4 view_matrix;
uniform mat4 model_matrix;
uniform mat3 normal_matrix;
uniform vec3 light_position;

varying vec3 _position;
varying vec3 _normal;
varying vec3 _light_position;
//varying vec2 _uv;

void main()
{ 
	//_uv = uv;

	vec4 pos = view_matrix * model_matrix * vec4(position, 1.0);

    _position = pos.xyz;
    _normal = normal_matrix * normal;
    _light_position = vec3(view_matrix * model_matrix * vec4(light_position, 1.0));

    gl_Position = proj_matrix * pos;
}

#FRAGMENT
precision mediump float;

const float GAMMA = 2.2;

varying vec3 _position;
varying vec3 _normal;
//varying vec2 _uv;
varying vec3 _light_position;

//uniform sampler2D tex;

float lambert(vec3 L, vec3 N) 
{
	return max(0.0, dot(L, N));
}
vec3 linear(vec3 v) 
{
	return pow(v, vec3(GAMMA));
}
vec4 linear(vec4 v) 
{
	return vec4(linear(v.rgb), v.a);
}
vec3 gamma(vec3 v) 
{
	return pow(v, vec3(1.0 / GAMMA));
}
vec4 gamma(vec4 v) 
{
	return vec4(gamma(v.rgb), v.a);
}

void main()
{ 
	vec3 N = normalize(_normal);
    vec3 L = normalize(_light_position - _position);

    float diffuse = lambert(L, N);

    vec4 diffuse_color = linear(vec4(1.0));
    //vec4 diffuse_color = linear(texture2D(tex, _uv));
    vec4 light_color = linear(vec4(1.0));

    vec4 result = vec4(diffuse_color.rgb * light_color.rgb * diffuse, 1.0);
	gl_FragColor = gamma(result);
}
