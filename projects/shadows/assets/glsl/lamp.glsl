#VERTEX
attribute vec3 position;

uniform mat4 model_matrix, view_matrix, proj_matrix;

varying vec4 _position;

void main()
{ 
	_position = model_matrix * vec4(position, 1.0);
	gl_Position = proj_matrix * view_matrix * _position;
}

#FRAGMENT
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform mat4 view_matrix;

varying vec4 _position;

void main()
{ 
	vec3 lightPos = (view_matrix * _position).xyz;
    float depth = clamp(length(lightPos) / 5.0, 0.0, 1.0);
	float dx = dFdx(depth);
	float dy = dFdy(depth);
	//float dx = depth;
	//float dy = depth;
    gl_FragColor = vec4(depth, pow(depth, 2.0) + 0.25 * (dx*dx + dy*dy), 0.0, 1.0);
}