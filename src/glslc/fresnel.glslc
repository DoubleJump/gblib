float fresnel(vec3 E, vec3 N, float bias, float scale, float power)
{
	return bias + scale * pow(1.0 + dot(E, N), power);
}