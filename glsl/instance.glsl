#VERTEX
attribute vec3 position;
attribute vec3 instance_position;

uniform mat4 mvp;

void main()
{ 
	gl_Position = projection_matrix * vec4(instance_position + position, 1.0);
}

#FRAGMENT
precision highp float;

void main()
{ 
    gl_FragColor = vec4(1.0);
}