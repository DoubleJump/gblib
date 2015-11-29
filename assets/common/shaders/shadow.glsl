#VERTEX

attribute vec3 position;

uniform mat4 model_matrix;
uniform mat4 view_matrix;
uniform mat4 proj_matrix;
uniform mat4 lamp_matrix;

varying vec4 _lamp_space_position;

void main(void) 
{
    _lamp_space_position = lamp_matrix * model_matrix * vec4(position, 1.0);
    gl_Position = proj_matrix * view_matrix * model_matrix * vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

uniform sampler2D lamp_depth_map;

varying vec4 _lamp_space_position;

void main() 
{
    vec3 uv = (_lamp_space_position.xyz / _lamp_space_position.w) * vec3(0.5) + vec3(0.5);
    float depth = 1.0 - uv.z;
    float lamp_depth = 1.0 - (texture2D(lamp_depth_map, uv.xy).r);
    //float illuminated = step(uv.z, lamp_depth + 0.0002) + 0.4;// + (lamp_depth);
    //float illuminated = depth - clamp((depth - lamp_depth), 0.0, 1.0);
    
	float diff = depth - (depth - lamp_depth);
    float illuminated = 1.0;
    if(depth < lamp_depth - 0.0002) illuminated = pow(uv.z, 2.0);

    gl_FragColor = vec4(illuminated);
}