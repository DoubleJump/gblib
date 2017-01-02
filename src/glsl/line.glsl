#VERTEX
attribute vec3 position;
attribute vec3 previous;
attribute vec3 next;
attribute float direction;
attribute float dist;

uniform mat4 mvp;
uniform float aspect;
uniform float line_width;

varying float _distance;
varying float _height;

void main()
{ 
	_distance = dist;
	_height = direction;

	vec2 v_aspect = vec2(aspect, 1.0);
	
	vec4 previous_projected = mvp * vec4(previous, 1.0);
	vec4 current_projected = mvp * vec4(position, 1.0);
	vec4 next_projected = mvp * vec4(next, 1.0);

	vec2 previous_screen = previous_projected.xy / previous_projected.w * v_aspect;
	vec2 current_screen = current_projected.xy / current_projected.w * v_aspect;
	vec2 next_screen = next_projected.xy / next_projected.w * v_aspect;

	vec2 v_direction = vec2(0.0);
	float len = line_width;
	if(position == previous)
	{
		v_direction = normalize(next_screen - current_screen);
	}
	else if(position == next)
	{
		v_direction = normalize(current_screen - previous_screen);
	}
	else
	{
		vec2 A = normalize(current_screen - previous_screen);
		vec2 B = normalize(next_screen - current_screen);
		vec2 tangent = normalize(A + B);
		vec2 perp = vec2(-A.y, A.x);
		vec2 mitre = vec2(-tangent.y, tangent.x);
		v_direction = tangent;
		len = line_width / dot(mitre, perp);
	}

	len = clamp(len, line_width * 0.5, line_width * 1.5);
	vec2 normal = vec2(-v_direction.y, v_direction.x) * (len * direction);
	normal.x /= aspect;

	gl_Position = vec4(current_projected.xy + normal, current_projected.z, current_projected.w);
}

#FRAGMENT
precision highp float;

uniform vec4 color;
/*
uniform float start;
uniform float end;
uniform float dash;
*/

varying float _distance;
varying float _height;
void main()
{ 
	float sd = (_height + 1.0) * 0.5;
    float t = abs(sd - 0.5);
    float a = 1.0 - (t * 2.0);
    float alpha = smoothstep(0.7, 0.9, a);

	vec4 result = color;
	result.a *= alpha;
	
	//float gap = cos(_distance * dash) + 0.5;
    //if(gap > 0.5 && (_distance > start && _distance < end)) gl_FragColor = result;
    //else discard;
	
	gl_FragColor = result;
}