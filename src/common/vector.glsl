#VERTEX
attribute vec3 position;
attribute vec2 uv;

uniform mat4 mvp;

varying vec2 _uv;

void main()
{ 
	_uv = uv;

	vec3 p = position;
	gl_Position = mvp * vec4(p, 1.0);
}

#FRAGMENT
precision highp float;

varying vec2 _uv;

float circle(vec2 st, float r)
{
    vec2 dist = st - vec2(0.5);
	return 1.0 - smoothstep(r-(r * 0.01), r+(r * 0.01), dot(dist,dist) * 4.0);
}

void main()
{ 
	float a = circle(_uv, 0.5);
    gl_FragColor = vec4(a,a,a,1.0);
}