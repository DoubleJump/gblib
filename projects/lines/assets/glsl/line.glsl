#VERTEX
attribute vec2 position;
attribute vec2 normal;
attribute float mitre;

uniform float line_width;
uniform mat4 mv_matrix;
uniform mat4 proj_matrix;

void main()
{ 
	vec4 delta = vec4(normal, 0, 0);
	vec4 pos = mv_matrix * vec4(position, 0, 1);
	gl_Position = proj_matrix * (pos + delta);
}

#FRAGMENT
precision highp float;

void main()
{ 
    gl_FragColor = vec4(1,1,1,1);
}