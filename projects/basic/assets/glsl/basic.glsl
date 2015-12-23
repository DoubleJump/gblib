#VERTEX
attribute vec3 position;
attribute vec3 normal;
attribute vec4 color;
attribute vec2 uv;

uniform mat4 mvp;
uniform mat3 normal_matrix;

varying vec3 _normal;
varying vec4 _color;
varying vec2 _uv;


void main()
{ 
	gl_Position = mvp * vec4(position, 1.0);
    _normal = normal_matrix * normal;
    _color = color;
    _uv = uv;
}

#FRAGMENT
precision highp float;

uniform sampler2D diffuse;

varying vec3 _normal;
varying vec4 _color;
varying vec2 _uv;

void main()
{ 
	vec4 diffuse_sample = texture2D(diffuse, _uv);
	vec3 N = (_normal / 2.0) + 0.5;
    gl_FragColor = vec4(N * _color.rgb * diffuse_sample.rgb, 1.0);
}