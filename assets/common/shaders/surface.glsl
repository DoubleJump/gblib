#VERTEX
attribute vec3 position;
attribute vec3 normal;

uniform mat4 mvp;
uniform mat3 normal_matrix;

varying vec3 _normal;

void main()
{ 
	gl_Position = mvp * vec4(position, 1.0);
    _normal = normal_matrix * normal;
}

#FRAGMENT
precision highp float;

uniform float alpha;

varying vec3 _normal;

void main()
{ 
	vec3 N = (_normal / 2.0) + 0.5;
    gl_FragColor = vec4(N, alpha);
}