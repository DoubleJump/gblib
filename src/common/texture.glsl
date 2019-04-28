#VERTEX
attribute vec3 position;
attribute vec2 uv;

uniform mat4 mvp;

varying vec2 _uv;

void main()
{ 
	_uv = vec2(uv.x, 1.0-uv.y);
	gl_Position = mvp * vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

varying vec2 _uv;

uniform sampler2D image;

void main()
{ 
    gl_FragColor = texture2D(image, _uv);
}