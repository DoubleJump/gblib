float lambert(vec3 normal, vec3 light_direction)
{
    return max(0.0, dot(normal, light_direction));
}