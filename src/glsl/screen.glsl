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

varying vec2 _uv;

uniform sampler2D tex;

void main()
{ 
	gl_FragColor = texture2D(tex, _uv);
}