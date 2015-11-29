#VERTEX

attribute vec3 position;
attribute vec2 uv;

varying vec2 _uv;

void main(void) 
{
	_uv = uv;
    gl_Position = vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

varying vec2 _uv;

uniform sampler2D surface_map;
uniform sampler2D shadow_map;

void main() 
{
    vec4 surface_sample = texture2D(surface_map, _uv);
    vec4 shadow_sample = texture2D(shadow_map, _uv);

    gl_FragColor = vec4(surface_sample.rgb * shadow_sample.r, surface_sample.a);
}