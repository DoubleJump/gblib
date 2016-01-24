float curve(float t, float a, float b, float c, float d)
{
	float u = 1.0 - t;
	float tt = t * t;
	float uu = u * u;
	float uuu = uu * u;
	float ttt = tt * t;

	return (uuu * a) + (3.0 * uu * t * b) + (3.0 * u * tt * c) + (ttt * d);
}