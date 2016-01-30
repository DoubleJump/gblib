#VERTEX
attribute vec3 position;
attribute vec3 previous;
attribute vec3 next;
attribute float direction;
attribute float dist;

uniform mat4 mvp;
uniform mat4 model;
uniform float aspect;

uniform float line_width;
uniform int mitre;

varying vec3 _position;
varying float _height;
varying vec4 mPos;

void main()
{ 
	_position = position;
	mPos = model * vec4(position, 1.0);

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
	else
	{
		v_direction = normalize(current_screen - previous_screen);
	}

	len = clamp(len, line_width * 0.5, line_width * 1.0);

	_height = (direction / 2.0) + 0.5;

	vec2 normal = vec2(-v_direction.y, v_direction.x) * (len * direction);
	normal.x /= aspect;

	gl_Position = vec4(current_projected.xy + normal, current_projected.z, current_projected.w);
}

#FRAGMENT
precision highp float;

varying vec3 _position;
varying float _height;
varying vec4 mPos;

uniform vec3 light;

uniform float F_bias;
uniform float F_scale;
uniform float F_power;

//INCLUDE lib/glsl/gamma.glsl
//INCLUDE lib/glsl/curve.glsl
//INCLUDE lib/glsl/lambert.glsl

void main()
{ 
	float radius = curve(_height, 0.0, 0.36, 1.37, 1.0);
	//float radius = curve(_height, 0.0, F_bias, F_scale, 1.0);

	vec3 N = normalize(mPos.xyz);
	vec3 L = normalize(light - mPos.xyz);

	float id = lambert(L, N);
	id = clamp(id, 0.0, 0.9);

	vec3 A = to_linear(vec3(0.3,0.6,0.7));
	//vec3 B = to_linear(vec3(F_bias, F_scale, F_power));
	vec3 B = to_linear(vec3(0.02,0.2,0.53));
	//vec3 red = to_linear(vec3(0.18,0.12,0.24));

	vec3 glow = mix(B, A, id);
	vec3 final = mix(vec3(0.0), glow, radius);

	//C = mix(C * 0.5, C * 3.0, depth);
	//vec3 C = to_gamma(mix(B, A, radius));
    gl_FragColor = vec4(to_gamma(glow), 1.0 - radius);
}