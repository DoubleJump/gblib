vec4 blend_screen(vec4 a, vec4 b)
{
	return 1.0 - (1.0 - a) * (1.0 - b);
}
vec4 blend_darken(vec4 a, vec4 b)
{
	return min(a,b);
}
vec4 blend_lighten(vec4 a, vec4 b)
{
	return max(a,b);
}
vec4 blend_difference(vec4 a, vec4 b)
{
	return abs(a - b);
}
vec4 blend_negation(vec4 a, vec4 b)
{
	return 1.0 - abs(1.0 - a - b);
}
vec4 blend_exclusion(vec4 a, vec4 b)
{
	return a + b - 2.0 * a * b;
}
vec4 blend_overlay(vec4 a, vec4 b)
{
	return a < 0.5 ? (2.0 * a * b) : (1.0 - 2.0 * (1.0 - a) * (1.0 - b));
}
vec4 blend_hard_light(vec4 a, vec4 b)
{
	return b < 0.5 ? (2.0 * a * b) : (1.0 - 2.0 * (1.0 - a) * (1.0 - b));
}
vec4 blend_dodge(vec4 a, vec4 b)
{
	return a / (1.0 - b);
}
vec4 blend_burn(vec4 a, vec4 b)
{
	return 1.0 - (1.0 - a) / b;
}