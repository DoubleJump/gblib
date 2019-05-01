#VERTEX

attribute vec3 position;
attribute vec2 uv;
attribute float index;

uniform mat4 mvp;

varying vec2 _uv;

void main() 
{
    vec3 p = position;
    p.z += index * 0.001;
    gl_Position = mvp * vec4(p, 1.0);
    _uv = uv;
}

#FRAGMENT

#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform sampler2D texture;
/*
uniform vec4 color;
uniform float buffer;
uniform float gamma;
uniform float theta;
uniform float zeta;
*/

varying vec2 _uv;

float median(vec3 c) 
{
    return max(min(c.r, c.g), min(max(c.r, c.g), c.b));
}
/*

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


float median(float r, float g, float b) 
{
    return max(min(r, g), min(max(r, g), b));
}
*/

void main()
{
    vec2 st = _uv;
    st.y = 1.0 - _uv.y;

    vec3 sample = texture2D(texture, st).rgb;
    float dx = dFdx(st.x) * 512.0; 
    float dy = dFdy(st.y) * 512.0;
    float toPixels = 8.0 * inversesqrt(dx * dx + dy * dy);
    float sigDist = median(sample);
    float w = fwidth(sigDist);
    float opacity = smoothstep(0.5 - w, 0.5 + w, sigDist);

    gl_FragColor = vec4(1.0,1.0,1.0, opacity);
    
    //gl_FragColor = vec4(1.0);
}