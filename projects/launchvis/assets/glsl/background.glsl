#VERTEX
attribute vec3 position;

void main()
{ 
	gl_Position = vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

uniform float mag;
uniform vec2 res;

//INCLUDE lib/glsl/gamma.glsl

vec3 vignette(vec3 A, vec3 B, vec2 coord, vec2 res, float bias)
{
	float dist = bias / length(coord - res);
	return mix(B, A, 1.0 - dist);
}

void main()
{
	vec3 B = to_linear(vec3(0.035, 0.035, 0.035));
	vec3 A = to_linear(vec3(0.024, 0.065, 0.08));
	vec3 final = vignette(A, B, gl_FragCoord.xy, res, mag * 2.5);

    gl_FragColor = vec4(to_gamma(final), 1.0);
}