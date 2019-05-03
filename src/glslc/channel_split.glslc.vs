//COLOR EXTRACTION

vec4 extract_r(vec4 c){ return vec4(c.r, 0.0, 0.0, c.a); }
vec4 extract_g(vec4 c){ return vec4(0.0, c.g, 0.0, c.a); }
vec4 extract_b(vec4 c){ return vec4(0.0, 0.0, c.b, c.a); }

//COORD MANIPULATION

float saw(float v, float d)
{
	return mod(v, d) * (d - floor(mod(v, d * 2.0)) * (d * 2.0)) + floor(mod(v, d * 2.0)); 
}

vec2 vec_lock(vec2 v)
{
	return vec2(saw(v.x, 1.0), saw(v.y, 1.0));
}

vec2 shift_x(vec2 vec, float offset)
{
	return vec_lock(vec2(vec.x + offset, vec.y));
}

float rand(vec2 co)
{
	vec2 st = vec2(mod(co.x, res.x), mod(co.y, res.y));
	float a = 12.9898;
	float b = 78.233;
	float c = 43758.5453;
	float dt = dot(st.xy, vec2(a,b));
	float sn = mod(dt + seed * 0.0001, 3.14);
	return fract(sin(sn) * c);
}

void main()
{
	vec4 result;
	vec2 st = vec_lock(_uv);

	//channel split
	float sx = (channel_shift + rand(st) * dispersion) * intensity;
	result = extract_r(texture2D(image, shift_x(st,  sx))) +
			 extract_b(texture2D(image, shift_x(st, -sx))) +
			 extract_g(texture2D(image, st));
	
	gl_FragColor = result;
}