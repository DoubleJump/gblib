#VERTEX
attribute vec3 position;
attribute vec2 uv;

uniform mat4 model;
uniform mat4 view_projection;
uniform vec3 size;
uniform vec3 offset;
uniform vec4 frame;

varying vec2 _uv;

void main()
{ 
	_uv = (uv + frame.xy) * frame.zw;

	gl_Position = view_projection * model * vec4((position + offset) * size, 1.0);
}

#FRAGMENT
precision highp float;

uniform sampler2D texture;
uniform vec4 tint;
uniform float saturation;
uniform float brightness;

varying vec2 _uv;

vec3 desaturate(vec3 color, float amount)
{
	vec3 gray = vec3(dot(vec3(0.3, 0.59, 0.11), color));
	return vec3(mix(gray, color, amount));
}

void main()
{ 
	vec4 sample = texture2D(texture, _uv);
	sample.rgb *= brightness;
	sample.rgb = desaturate(sample.rgb, saturation);

    gl_FragColor = sample * tint;
}