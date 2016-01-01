#VERTEX
attribute vec3 position;

void main()
{ 
	gl_Position = vec4(position, 1.0);
}

#FRAGMENT
precision highp float;

uniform vec2 resolution;
uniform vec2 mouse;
uniform float t;

//INCLUDE lib/glsl/sdf.glsl

void main()
{ 
    vec2 st = gl_FragCoord.xy / resolution;
    vec2 mt = mouse / resolution;

    float y = circle(st, 0.2);
    vec3 color = vec3(y);

    gl_FragColor = vec4(color,1.0);
}