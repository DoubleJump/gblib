#VERTEX

attribute vec2 position;
attribute vec2 uv;
attribute float index;

uniform mat4 mvp;

varying vec2 _uv;

void main() 
{
    gl_Position = mvp * vec4(position, index * 0.001, 1);
    _uv = uv;
}

#FRAGMENT

//#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform sampler2D texture;
uniform vec4 color;
uniform float buffer;
uniform float gamma;
uniform float theta;
uniform float zeta;

varying vec2 _uv;

float median(vec3 c) 
{
    return max(min(c.r, c.g), min(max(c.r, c.g), c.b));
}

void main() 
{
    vec3 sample = texture2D(texture, _uv).rgb;
    float sd = median(sample) - theta;
    float alpha = smoothstep(buffer, gamma, sd);

    vec4 result = color;
    result.a *= alpha;
    gl_FragColor = result;
    //gl_FragColor = vec4(1.0,0.0,0.0,1.0);
}