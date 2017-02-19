#VERTEX
attribute vec3 position;
attribute vec2 uv;

varying vec2 _uv;

void main()
{ 
	_uv = uv;
	gl_Position = vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

uniform sampler2D image;

varying vec2 _uv;

void main()
{ 
	vec4 sample = texture2D(image, _uv);
    gl_FragColor = sample;
}