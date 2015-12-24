#VERTEX
attribute vec2 position;
attribute vec2 normal;
attribute float mitre;

uniform float line_width;
uniform mat4 mv_matrix;
uniform mat4 proj_matrix;

void main()
{ 
	vec2 delta = normal * mitre * line_width;
	vec4 pos = mv_matrix * vec4(position + delta, 0, 1);
	gl_Position = proj_matrix * pos;
}

#FRAGMENT
precision highp float;

uniform vec4 color;

void main()
{ 
    gl_FragColor = color;
}