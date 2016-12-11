vec3 desaturate(vec3 color, float amount)
{
	vec3 gray = vec3(dot(vec3(0.3, 0.59, 0.11), color));
	return vec3(mix(gray, color, amount));
}