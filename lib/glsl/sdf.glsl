float circle(vec2 st, float radius)
{
    vec2 dist = st - vec2(0.5);
	return 1.0 - smoothstep(radius-(radius * 0.01), radius+(radius * 0.01), dot(dist,dist) * 4.0);
}