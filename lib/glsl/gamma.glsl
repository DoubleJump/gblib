const float GAMMA = 2.2;

vec3 to_linear(vec3 v) 
{
	return pow(v, vec3(GAMMA));
}
vec4 to_linear(vec4 v) 
{
	return vec4(to_linear(v.rgb), v.a);
}
vec3 to_gamma(vec3 v) 
{
	return pow(v, vec3(1.0 / GAMMA));
}
vec4 to_gamma(vec4 v) 
{
	return vec4(to_gamma(v.rgb), v.a);
}