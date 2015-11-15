#VERTEX
precision mediump float;

attribute vec3 position;
attribute vec2 uv;

varying vec2 _uv;

void main(void) 
{
    _uv = uv;
    gl_Position = vec4(position, 1.0);
}

#FRAGMENT
precision mediump float;

varying vec2 _uv;

uniform sampler2D normal_tex;
uniform sampler2D camera_depth_tex;
uniform sampler2D lamp_depth_tex;

void main() 
{
    float cam_depth_sample = texture2D(camera_depth_tex, _uv).r;
    float lamp_depth_sample = texture2D(lamp_depth_tex, _uv).r;
    vec4 normal_sample = texture2D(normal_tex, _uv);

    gl_FragColor = vec4(pow(cam_depth_sample, 4.0));
}