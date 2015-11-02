#CAMERA
#RIG
#VERTEX
attribute vec3 position;
attribute vec3 normal;
attribute vec4 weight;

uniform mat4 proj_matrix;
uniform mat4 view_matrix;
uniform mat4 model_matrix;
uniform mat3 normal_matrix;
uniform mat4 rig[2];

varying vec3 _position;
varying vec3 _normal;


mat4 bone_transform() 
{
	float n = 1.0 / (weight.y + weight.w);
	return n * weight.w * rig[int(weight.z)] + 
		   n * weight.y * rig[int(weight.x)];
	//return rig[1] * weight.w + rig[0] * weight.x;
}

void main()
{ 
    mat4 bone = bone_transform();
	vec4 pos = view_matrix * model_matrix * bone * vec4(position, 1.0);

    _position = pos.xyz;
    _normal = normal_matrix * normal;

    gl_Position = proj_matrix * pos;
}

#FRAGMENT
precision highp float;

varying vec3 _position;
varying vec3 _normal;

void main()
{ 
	vec3 N = ((_normal) / 2.0) + 0.5;
    vec4 result = vec4(N, 1.0);
	gl_FragColor = result;
}
