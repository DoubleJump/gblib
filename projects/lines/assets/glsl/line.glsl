#VERTEX
attribute vec3 position;
attribute vec3 normal;

uniform float line_width;
uniform mat4 mv_matrix;
uniform mat4 proj_matrix;

void main()
{ 
	vec4 delta = vec4(normal * line_width, 0);
	vec4 pos = mv_matrix * vec4(position, 1);
	gl_Position = proj_matrix * (pos + delta);
}

#FRAGMENT
precision highp float;

void main()
{ 
    gl_FragColor = vec4(1,1,1,1);
}