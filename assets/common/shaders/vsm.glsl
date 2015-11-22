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
	vec3 light_pos = vec3(0.0, 10.0, 4.0);
    vec4 cam_depth_sample = texture2D(camera_depth_tex, _uv);
    float lamp_depth_1 = texture2D(lamp_depth_tex, _uv).r;
    float lamp_depth_2 = clamp(length(light_pos) / 40.0, 0.0, 1.0);
    //float lamp_depth_2 = texture2D(camera_depth_tex, _uv).r;
    float bias = 0.001;
    float illuminated = step(lamp_depth_1, lamp_depth_2 + bias);

    vec3 normal_sample = texture2D(normal_tex, _uv).rgb * illuminated;

    gl_FragColor = vec4(normal_sample, 1.0);
    //gl_FragColor = lamp_depth_sample;
    //gl_FragColor = normal_sample;
}