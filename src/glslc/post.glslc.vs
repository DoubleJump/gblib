#define HEJL
#define GRAIN
#define CONTRAST
precision highp float;
attribute vec2 vCoord;
varying vec2 j;

void main(void)
{
	j=vCoord;
	gl_Position.xy = 2.0 * vCoord - vec2(1.0,1.0);
	gl_Position.zw = vec2(0.0,1.0);
}

#define HEJL
#define GRAIN
#define CONTRAST

precision mediump float;
uniform sampler2D tInput;

#ifdef BLOOM
uniform sampler2D bloom;
#endif

#ifdef GRAIN
uniform sampler2D grain;
#endif

#ifdef COLOR_LUT
uniform sampler2D LUT;
#endif

uniform vec3 scale;
uniform vec3 bias;
uniform vec3 saturation;
uniform vec4 sharpen_kernel;
uniform vec3 sharpness;
uniform vec3 bloom_col;
uniform vec4 vignette_aspect;
uniform vec4 vignette;
uniform vec4 uGrainCoord;
uniform vec2 uGrainScaleBias;

varying vec2 _uv;

vec3 iY(vec3 c)
{
	vec3 iZ = sqrt(c);
	return(iZ-iZ * c) + c * (0.4672 * c + vec3(0.5328));
}

vec3 sharpen(inout vec3 rgb, sampler2D t, vec2 st, vec4 kernel)
{
	vec3 h = texture2D(t, st + kernel.xy).xyz;
	h += texture2D(t, st - kernel.xy).xyz;
	h += texture2D(t, st + kernel.zw).xyz;
	h += texture2D(t, st - kernel.zw).xyz;
	vec3 jd = sharpness.x * rgb - sharpness.y * h;
	rgb += clamp(jd,-sharpness.z,sharpness.z);
}

void main(void)
{
	vec4 jc = texture2D(tInput,_uv);
	vec3 rgb = jc.xyz;

	#ifdef SHARPEN
	/*
	vec3 hM = texture2D(tInput, _uv + sharpen_kernel.xy).xyz;
	hM += texture2D(tInput, _uv - sharpen_kernel.xy).xyz;
	hM += texture2D(tInput, _uv + sharpen_kernel.zw).xyz;
	hM += texture2D(tInput, _uv - sharpen_kernel.zw).xyz;
	vec3 jd = sharpness.x * rgb - sharpness.y * hM;
	rgb += clamp(jd,-sharpness.z,sharpness.z);
	*/
	sharpen(rgb, tInput, _uv, sharpen_kernel);
	#endif

	#ifdef BLOOM
	rgb += bloom_col * texture2D(bloom,_uv).xyz;
	#endif

	#ifdef VIGNETTE
	vec2 je = _uv * vignette_aspect.xy - vignette_aspect.zw;
	vec3 v = clamp(vec3(1.0) - vignette.xyz * dot(je,je),0.0,1.0);
	vec3 jf = v * v;
	jf *= v;
	rgb *= mix(v,jf,vignette.w);
	#endif

	#ifdef SATURATION
	float gray = dot(rgb, vec3(0.3,0.59,0.11));
	rgb = mix(vec3(gray), rgb, saturation);
	#endif

	#ifdef CONTRAST
	rgb = rgb * scale + bias;
	#endif

	#ifdef GRAIN
	float jh = uGrainScaleBias.x * texture2D(grain,_uv * uGrainCoord.xy + uGrainCoord.zw).x + uGrainScaleBias.y;
	rgb += rgb * jh;
	#endif

	#ifdef REINHARD
	{
		rgb *= 1.8;
		float ji = dot(rgb,vec3(0.3333));
		rgb = clamp(rgb/(1.0+ji),0.0,1.0);
	}
	#elif defined(HEJL)
	{
		const highp float jj = 0.22, jk=0.3, jl=0.1, jm=0.2, jn=.01, jo=0.3;
		const highp float ju = 1.25;
		highp vec3 eO = max(vec3(0.0),rgb-vec3(.004));
		rgb=(eO*((ju*jj)*eO+ju*vec3(jl*jk,jl*jk,jl*jk))+ju*vec3(jm*jn,jm*jn,jm*jn))/(eO*(jj*eO+vec3(jk,jk,jk))+vec3(jm*jo,jm*jo,jm*jo))-ju*vec3(jn/jo,jn/jo,jn/jo);
	}
	#endif

	#ifdef COLOR_LUT
	rgb = clamp(rgb,0.0,1.0);
	rgb = (255.0/256.0) * rgb + vec3(0.5/256.0);
	rgb.x = texture2D(LUT,rgb.xx).x;
	rgb.y = texture2D(LUT,rgb.yy).y;
	rgb.z = texture2D(LUT,rgb.zz).z;
	rgb *= rgb;
	#endif

	gl_FragColor.xyz = iY(rgb);
	gl_FragColor.w = jc.w;
}






