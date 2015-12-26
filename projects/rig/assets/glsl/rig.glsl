#VERTEX
attribute vec3 position;
attribute vec3 normal;
attribute vec4 weight;

uniform mat4 model;
uniform mat4 view;
uniform mat4 projection;
uniform mat3 normal_matrix;
uniform mat4 rig[18];

varying vec3 _normal;

mat4 bone_transform() 
{
	float n = 1.0 / (weight.y + weight.w);
	return n * weight.w * rig[int(weight.z)] + n * weight.y * rig[int(weight.x)];
}

void main()
{ 
    mat4 bone = bone_transform();
	gl_Position = projection * view * model * bone * vec4(position, 1.0);

    _normal = normal_matrix * normal;
}

#FRAGMENT
precision highp float;

varying vec3 _normal;

void main()
{ 
	vec3 N = (_normal / 2.0) + 0.5;
    vec4 result = vec4(N, 1.0);
	gl_FragColor = result;
}