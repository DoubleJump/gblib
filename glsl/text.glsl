#VERTEX

attribute vec2 position;
attribute vec2 uv;

uniform mat4 mvp;

varying vec2 _uv;

void main() 
{
    gl_Position = mvp * vec4(position, 0.0, 1);
    _uv = uv;
}

#FRAGMENT

#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform sampler2D texture;
uniform sampler2D disc;
uniform vec4 res;

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
    vec4 result;
    //result = color; //mix(vec4(0,0,1,0), color, alpha);
    //result *= alpha;
    //gl_FragColor = mix(vec4(0,0,1,0), color, alpha);


    vec2 st = gl_FragCoord.xy / res.zw;
    float disc_alpha = texture2D(disc, st).r;
    result = mix(color, vec4(1.0), 1.0-disc_alpha);
    //result = texture2D(disc, st);
    result.a = alpha;

    gl_FragColor = result;


    /*
    vec4 result;
    result.a = pow(color.a * alpha, zeta);
    result.rgb = color.rgb * color.a;
    gl_FragColor = result;
    */
}