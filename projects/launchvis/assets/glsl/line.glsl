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
varying vec3 _position;

void main()
{ 
	_distance = dist;
	_position = position;

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
uniform float start;
uniform float end;

uniform float F_bias;
uniform float F_scale;
uniform float F_power;

varying float _distance;
varying vec3 _position;

//INCLUDE lib/glsl/gamma.glsl

void main()
{ 
	float depth = (gl_FragCoord.z / gl_FragCoord.w) / 2.0;
	depth = clamp(depth, 0.0, 1.0);

	//vec3 N = normalize((_position / 2.0) + 0.5);

	//vec3 A = to_linear(vec3(0.61,0.69,1.0) * 0.3);
	vec3 A = to_linear(color.rgb * 0.3);
	vec3 B = to_linear(color.rgb);

	//vec3 A = to_linear(vec3(F_bias, F_scale, F_power) * 0.3);
	//vec3 B = to_linear(vec3(F_bias, F_scale, F_power));

	//C = mix(C * 0.5, C * 3.0, depth);
	vec3 C = to_gamma(mix(A, B, 1.0 - depth));

    if(_distance > start && _distance < end)
    {
    	gl_FragColor = vec4(C, color.a);
    }
    else 
    {
    	discard;
    	//gl_FragColor = vec4(C, 0.3);
    }

   // gl_FragColor = vec4(vec3(mod(_distance)), 1.0);
    //gl_FragColor = vec4(N, 0.5);
}