#VERTEX
attribute vec3 position;
attribute vec3 normal;
//attribute vec2 uv;
uniform mat4 mvp;

//varying vec2 _uv;
varying vec3 _normal;

void main()
{ 
	//_uv = uv;
	_normal = normal.xyz / 2.0 + 0.5;
	gl_Position = mvp * vec4(position, 1.0); 
}

#FRAGMENT
precision mediump float;

//varying vec2 _uv;
varying vec3 _normal;

uniform sampler2D tex;

void main()
{ 
	//gl_FragColor = texture2D(tex, _uv);
	gl_FragColor = vec4(_normal, 1.0);
}