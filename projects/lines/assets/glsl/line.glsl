#VERTEX
attribute vec3 position;
attribute vec3 previous;
attribute vec3 next;
attribute float direction;
attribute float dist;

uniform mat4 mvp;
uniform float aspect;

uniform float line_width;
uniform int mitre;

varying float _distance;

void main()
{ 
	vec2 v_aspect = vec2(aspect, 1.0);
	_distance = dist;
	
	vec4 previous_projected = mvp * vec4(previous, 1.0);
	vec4 current_projected = mvp * vec4(position, 1.0);
	vec4 next_projected = mvp * vec4(next, 1.0);

	vec2 previous_screen = previous_projected.xy / previous_projected.w * v_aspect;
	vec2 current_screen = current_projected.xy / current_projected.w * v_aspect;
	vec2 next_screen = next_projected.xy / next_projected.w * v_aspect;

	vec2 v_direction = vec2(0.0);
	float len = line_width;
	if(current_screen == previous_screen)
	{
		v_direction = normalize(next_screen - current_screen);
	}
	else if(current_screen == next_screen)
	{
		v_direction = normalize(current_screen - previous_screen);
	}
	else
	{
		vec2 A = normalize(current_screen - previous_screen);

		if(mitre == 1)
		{
			vec2 B = normalize(next_screen - current_screen);
			vec2 tangent = normalize(A + B);
			vec2 perp = vec2(-A.y, A.x);
			vec2 mitre = vec2(-tangent.y, tangent.x);
			v_direction = tangent;
			len = line_width / dot(mitre, perp);
		}
		else
		{
			v_direction = A;			
		}
	}

	float scale = 1.0 / current_projected.z;
	vec2 normal = vec2(-v_direction.y, v_direction.x) * (len * 0.5 * scale);
	//vec2 normal = vec2(-v_direction.y, v_direction.x) * (len * 0.5);
	normal.x /= aspect;

	vec4 offset = vec4(normal * direction, 0.0,1.0);
	gl_Position = current_projected + offset;
	gl_PointSize = 1.0;
}

#FRAGMENT
precision highp float;

uniform vec4 color;
uniform float cutoff;

varying float _distance;

void main()
{ 
	if(_distance < cutoff)
    	gl_FragColor = color;
    else 
    	gl_FragColor = vec4(color.rgb, 0.0);
}