#VERTEX

attribute vec3 position;
attribute vec2 uv;

varying vec2 _uv;

uniform mat4 mvp;

void main() 
{
    _uv = uv;
    gl_Position = mvp  * vec4(position, 1.0);
};

#FRAGMENT

precision highp float;

uniform sampler2D image;
uniform float pitch;
uniform float tilt;
uniform float center;
uniform float inv_view; 
uniform float sub_p;
uniform float tiles_x;
uniform float tiles_y;

varying vec2 _uv;

vec2 texture_array(vec3 uvz) 
{
    float z = floor(uvz.z * tiles_x * tiles_y);
    float x = (mod(z, tiles_x) + uvz.x) / tiles_x;
    float y = (floor(z / tiles_x) + uvz.y) / tiles_y;
    return vec2(x, y);
}

void main()
{
    vec4 rgb[3];
    vec3 nuv = vec3(_uv.xy, 0.0);

    for(int i = 0; i < 3; i++) 
    {
        nuv.z = (_uv.x + float(i) * sub_p + _uv.y * tilt) * pitch - center;
        nuv.z = mod(nuv.z + ceil(abs(nuv.z)), 1.0);
        nuv.z = (1.0 - inv_view) * nuv.z + inv_view * (1.0 - nuv.z);
        rgb[i] = texture2D(image, texture_array(vec3(_uv.x, _uv.y, nuv.z)));
    }

    gl_FragColor = vec4(rgb[0].r, rgb[1].g, rgb[2].b, 1);
}
    