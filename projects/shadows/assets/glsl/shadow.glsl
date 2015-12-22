#VERTEX

attribute vec3 position;

uniform mat4 model_matrix, view_matrix, proj_matrix;

varying vec4 _position;

void main(void) 
{
    //_position = model_matrix * vec4(position, 1.0);
    //gl_Position = view_proj_matrix * model_matrix * vec4(position, 1.0);
    _position = model_matrix * vec4(position, 1.0);
    gl_Position = proj_matrix * view_matrix * _position;
}

#FRAGMENT
precision highp float;

uniform mat4 lamp_view, lamp_proj;
uniform sampler2D lamp_depth_map;

varying vec4 _position;

/*
float sample_shadow_map(sampler2D depth_map, vec2 uv, float depth)
{
	float depth_sample = texture2D(depth_map, uv).r;
	if(depth_sample < depth - 0.01) return 0.5;
	return 1.0;
}
*/

float linstep(float low, float high, float v)
{
    return clamp((v-low)/(high-low), 0.0, 1.0);
}

float VSM(sampler2D depths, vec2 uv, float compare){
    vec2 moments = texture2D(depths, uv).xy;
    float p = smoothstep(compare-0.02, compare, moments.x);
    float variance = max(moments.y - moments.x*moments.x, +0.004);
    float d = compare - moments.x;
    float p_max = linstep(0.2, 1.0, variance / (variance + d*d));
    return clamp(max(p, p_max), 0.0, 1.0);
}
/*
float sample_shadow_map_linear(sampler2D shadow_map, vec2 uv, float depth, vec2 texel_size)
{
	vec2 pixel_pos = uv / texel_size * 0.5;
	vec2 frac = fract(pixel_pos);
	vec2 texel = (pixel_pos * frac) * texel_size;

	float bl = sample_shadow_map(shadow_map, texel, depth);
	float br = sample_shadow_map(shadow_map, texel + vec2(texel_size.x, 0.0), depth);
	float tl = sample_shadow_map(shadow_map, texel + vec2(0.0, texel_size.y), depth);
	float tr = sample_shadow_map(shadow_map, texel + texel_size, depth);

	float a = mix(lb, tl, frac.y);
	float b = mix(br, tr, frac.y);

	return mix(a,b, frac.x);
}
*/
/*
void main() 
{
	vec3 lightPos = (lamp_view * _position).xyz;
	vec4 lightDevice = lamp_proj * vec4(lightPos, 1.0);
    vec3 lightDeviceNormal = lightDevice.xyz / lightDevice.w;
    vec2 lightUV = lightDeviceNormal.xy * 0.5 + 0.5;

    float lightDepth2 = clamp(length(lightPos) / 20.0, 0.0, 1.0);
	float illuminated = VSM(lamp_depth_map, lightUV, lightDepth2);

    gl_FragColor = vec4(illuminated);
}
*/
void main()
{
	vec3 lightPos = (lamp_view * _position).xyz;
    vec4 lightDevice = lamp_proj * vec4(lightPos, 1.0);
    vec2 lightDeviceNormal = lightDevice.xy / lightDevice.w;
    vec2 lightUV = lightDeviceNormal*0.5+0.5;

    float lightDepth2 = clamp(length(lightPos)/5.0, 0.0, 1.0);
    float illuminated = VSM(lamp_depth_map, lightUV, lightDepth2) + 0.3;

    gl_FragColor = vec4(illuminated);
}