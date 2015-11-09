#CAMERA
#RIG
#VERTEX
attribute vec3 position;
attribute vec4 color;
attribute vec4 weight;

uniform mat4 proj_matrix;
uniform mat4 view_matrix;
uniform mat4 model_matrix;
uniform mat4 rig[18];

varying vec4 _color;

mat4 bone_transform() 
{
	float n = 1.0 / (weight.y + weight.w);
	return n * weight.w * rig[int(weight.z)] + n * weight.y * rig[int(weight.x)];
}
void main()
{ 
    mat4 bone = bone_transform();
	vec4 pos = view_matrix * model_matrix * bone * vec4(position, 1.0);

    _color = color;

    gl_Position = proj_matrix * pos;
}

#FRAGMENT
precision highp float;

varying vec4 _color;

void main()
{ 
	gl_FragColor = _color;
}