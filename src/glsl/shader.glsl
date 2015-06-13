#VERTEX
attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
uniform mat4 mvp;

varying vec2 _uv;

void main()
{ 
	_uv = uv;
	gl_Position = mvp * vec4(position, 1.0); 
}

#FRAGMENT
precision mediump float;

varying vec2 _uv;

uniform sampler2D tex;

void main()
{ 
	gl_FragColor = texture2D(tex, _uv);
}
