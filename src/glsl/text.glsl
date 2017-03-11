#VERTEX

attribute vec3 position;
attribute vec2 uv;
attribute vec4 color;
attribute float index;

uniform mat4 mvp;

varying vec2 _uv;
varying vec4 _color;

void main() 
{
    _uv = uv;
    _color = color;
    gl_Position = mvp * vec4(position, 1);
}

#FRAGMENT

//#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform sampler2D texture;

varying vec2 _uv;
varying vec4 _color;

float median(vec3 c) 
{
    return max(min(c.r, c.g), min(max(c.r, c.g), c.b));
}

void main() 
{
    //float buffer = 0.11554;
    //float gamma  = 0.18013;
    float theta  = 0.3;
    //float zeta   = 1.29792;

    vec3 sample = texture2D(texture, _uv).rgb;
    float sd = median(sample) - theta;
    float a = smoothstep(0.18, 0.19, sd);

    vec4 result = _color;
    result.a *= a;// + 0.2;
    gl_FragColor = result;
    //gl_FragColor = vec4(a,a,a, 1.0);
    //gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}