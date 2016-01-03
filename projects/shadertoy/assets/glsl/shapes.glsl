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
/*
float voronoi( in vec2 x )
{
    ivec2 p = floor( x );
    vec2  f = fract( x );

    float res = 8.0;
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        ivec2 b = ivec2( i, j );
        vec2  r = vec2( b ) - f + random2f( p + b );
        float d = dot( r, r );

        res = min( res, d );
    }
    return sqrt( res );
}
*/

void main()
{ 
    vec2 st = gl_FragCoord.xy / resolution;
    vec2 mt = mouse / resolution;

    //float y = ellipse(st, 0.2, 0.1);
    
    float y = ellipse(st, vec2(0.2,0.1));

    vec3 color = vec3(y);

    gl_FragColor = vec4(color,1.0);
}