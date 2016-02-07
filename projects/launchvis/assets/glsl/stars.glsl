#VERTEX
attribute vec3 position;
attribute vec3 color;

uniform mat4 mvp;

varying vec3 _color;

void main()
{ 
	_color = color;
	gl_Position = mvp * vec4(position, 1.0);
	gl_PointSize = 1.2;
}

#FRAGMENT
precision highp float;

varying vec3 _color;

void main()
{
    gl_FragColor = vec4(_color,1.0);
}