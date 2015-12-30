#VERTEX
attribute vec2 position;
attribute vec2 uv;

uniform mat4 mvp;

varying vec2 _uv;

void main()
{ 
	_uv = uv;
	gl_Position = mvp * vec4(position,0.0, 1.0);
}

#FRAGMENT
precision highp float;

uniform float thickness;
varying vec2 _uv;

float sample_quadratic(vec2 uv)
{
	return (uv.x * uv.x) - uv.y;
}
float sample_cubic(vec3 uv)
{
	return pow(uv.x, 3.0) - uv.y * uv.z;
}

void main()
{ 
	float sample = sample_quadratic(_uv);
	if(sample < thickness && sample > -thickness) gl_FragColor = vec4(1.0);
	else gl_FragColor = vec4(0.0);
}