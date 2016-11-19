float circle(vec2 st, float r)
{
    vec2 dist = st - vec2(0.5);
	return 1.0 - smoothstep(r-(r * 0.01), r+(r * 0.01), dot(dist,dist) * 4.0);
}

float sphere(vec3 p, float s)
{
	return length(p)-s;
}

float ellipse(vec2 z, vec2 ab)
{
    vec2 p = abs( z ); 

    if( p.x > p.y )
    { 
    	p = p.yx; 
    	ab = ab.yx; 
    }
	
    float l = ab.y*ab.y - ab.x*ab.x;
    float m = ab.x*p.x/l; 
    float m2 = m*m;
    float n = ab.y*p.y/l; 
    float n2 = n*n;
    float c = (m2 + n2 - 1.0)/3.0; 
    float c3 = c*c*c;
    float q = c3 + m2*n2*2.0;
    float d = c3 + m2*n2;
    float g = m + m*n2;

    float co;

    if( d<0.0 )
    {
        float p = acos(q/c3)/3.0;
        float s = cos(p);
        float t = sin(p)*sqrt(3.0);
        float rx = sqrt( -c*(s + t + 2.0) + m2 );
        float ry = sqrt( -c*(s - t + 2.0) + m2 );
        co = ( ry + sign(l)*rx + abs(g)/(rx*ry) - m)/2.0;
    }
    else
    {
        float h = 2.0*m*n*sqrt( d );
        float s = sign(q+h)*pow( abs(q+h), 1.0/3.0 );
        float u = sign(q-h)*pow( abs(q-h), 1.0/3.0 );
        float rx = -s - u - c*4.0 + 2.0*m2;
        float ry = (s - u)*sqrt(3.0);
        float rm = sqrt( rx*rx + ry*ry );
        float p = ry/sqrt(rm-rx);
        co = (p + 2.0*g/rm - m)/2.0;
    }

    float si = sqrt( 1.0 - co*co );
 
    vec2 closestPoint = vec2( ab.x*co, ab.y*si );
	
    return length(closestPoint - p ) * sign(p.y-closestPoint.y);
}