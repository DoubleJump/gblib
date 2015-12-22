const float GAMMA = 2.2;

vec3 linear_space(vec3 v) 
{
	return pow(v, vec3(GAMMA));
}
vec4 linear_space(vec4 v) 
{
	return vec4(linear(v.rgb), v.a);
}
vec3 gamma_space(vec3 v) 
{
	return pow(v, vec3(1.0 / GAMMA));
}
vec4 gamma_space(vec4 v) 
{
	return vec4(gamma(v.rgb), v.a);
}