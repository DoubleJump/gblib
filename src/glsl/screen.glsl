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

uniform sampler2D albedo;
uniform sampler2D depth;

void main()
{ 
	vec4 depth_sample = texture2D(depth, _uv);
	vec4 albedo_sample = texture2D(albedo, _uv);

	gl_FragColor = albedo_sample;
	//gl_FragColor = depth_sample;
}