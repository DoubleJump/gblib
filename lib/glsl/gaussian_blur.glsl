vec4 gaussian_blur(sampler2D texture, vec2 uv, vec2 scale)
{
	vec4 result = vec4(0.0);

	color += texture2D(texture, uv + (vec2(-3.0) * scale) * ( 1.0 / 64.0));
	color += texture2D(texture, uv + (vec2(-2.0) * scale) * ( 6.0 / 64.0));
	color += texture2D(texture, uv + (vec2(-1.0) * scale) * (15.0 / 64.0));
	color += texture2D(texture, uv + (vec2( 0.0) * scale) * (20.0 / 64.0));
	color += texture2D(texture, uv + (vec2( 1.0) * scale) * (15.0 / 64.0));
	color += texture2D(texture, uv + (vec2( 2.0) * scale) * ( 6.0 / 64.0));
	color += texture2D(texture, uv + (vec2( 3.0) * scale) * ( 1.0 / 64.0));

	return result;
}