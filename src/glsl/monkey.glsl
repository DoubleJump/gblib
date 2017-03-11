#VERTEX
attribute vec3 position;
attribute vec2 uv;
attribute vec4 color;

uniform mat4 mvp;

varying vec4 _color;
varying vec2 _uv;

void main()
{ 
	_color = color;
	_uv = uv;
	gl_Position = mvp * vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

varying vec4 _color;
varying vec2 _uv;

uniform sampler2D video;

void main()
{ 
	vec4 video_sample = texture2D(video, _uv);
    gl_FragColor = _color * video_sample;
}