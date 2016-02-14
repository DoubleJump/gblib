#VERTEX
attribute vec3 position;

uniform mat4 mvp;

void main()
{ 
	gl_Position = mvp * vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

uniform vec4 color;

void main()
{ 
    gl_FragColor = vec4(color);
}