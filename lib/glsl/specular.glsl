float specular(vec3 E, vec3 R, float hardness, float strength)
{
	return pow(max(dot(E, R), 0.0), hardness) * strength;
}