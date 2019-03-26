function Mat4()
{
	return new Float32Array([1,0,0,0,
							 0,1,0,0,
							 0,0,1,0,
							 0,0,0,1]);
}

var mat4_stack = new Stack(Mat4, 16);

function _Mat4()
{
	var r = mat4_stack.get();
	mat4_identity(r);
	return r;
}

function mat4_identity(m)
{
	m[ 0] = 1; m[ 1] = 0; m[ 2] = 0; m[ 3] = 0;
	m[ 4] = 0; m[ 5] = 1; m[ 6] = 0; m[ 7] = 0;
	m[ 8] = 0; m[ 9] = 0; m[10] = 1; m[11] = 0;
	m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
}

function mat4_mul(r, a,b)
{
	var t = _Mat4();
	t[ 0] = a[ 0] * b[0] + a[ 1] * b[4] + a[ 2] * b[ 8] + a[ 3] * b[12];
	t[ 1] = a[ 0] * b[1] + a[ 1] * b[5] + a[ 2] * b[ 9] + a[ 3] * b[13];
	t[ 2] = a[ 0] * b[2] + a[ 1] * b[6] + a[ 2] * b[10] + a[ 3] * b[14];
	t[ 3] = a[ 0] * b[3] + a[ 1] * b[7] + a[ 2] * b[11] + a[ 3] * b[15];
	t[ 4] = a[ 4] * b[0] + a[ 5] * b[4] + a[ 6] * b[ 8] + a[ 7] * b[12];
	t[ 5] = a[ 4] * b[1] + a[ 5] * b[5] + a[ 6] * b[ 9] + a[ 7] * b[13];
	t[ 6] = a[ 4] * b[2] + a[ 5] * b[6] + a[ 6] * b[10] + a[ 7] * b[14];
	t[ 7] = a[ 4] * b[3] + a[ 5] * b[7] + a[ 6] * b[11] + a[ 7] * b[15];	
	t[ 8] = a[ 8] * b[0] + a[ 9] * b[4] + a[10] * b[ 8] + a[11] * b[12];
	t[ 9] = a[ 8] * b[1] + a[ 9] * b[5] + a[10] * b[ 9] + a[11] * b[13];
	t[10] = a[ 8] * b[2] + a[ 9] * b[6] + a[10] * b[10] + a[11] * b[14];
	t[11] = a[ 8] * b[3] + a[ 9] * b[7] + a[10] * b[11] + a[11] * b[15];
	t[12] = a[12] * b[0] + a[13] * b[4] + a[14] * b[ 8] + a[15] * b[12];
	t[13] = a[12] * b[1] + a[13] * b[5] + a[14] * b[ 9] + a[15] * b[13];
	t[14] = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
	t[15] = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
	vec_eq(r,t);

	mat4_stack.index--;
}

function mat4_determinant(m)
{
	var a0 = m[ 0] * m[ 5] - m[ 1] * m[ 4];
	var a1 = m[ 0] * m[ 6] - m[ 2] * m[ 4];
	var a2 = m[ 0] * m[ 7] - m[ 3] * m[ 4];
	var a3 = m[ 1] * m[ 6] - m[ 2] * m[ 5];
	var a4 = m[ 1] * m[ 7] - m[ 3] * m[ 5];
	var a5 = m[ 2] * m[ 7] - m[ 3] * m[ 6];
	var b0 = m[ 8] * m[13] - m[ 9] * m[12];
	var b1 = m[ 8] * m[14] - m[10] * m[12];
	var b2 = m[ 8] * m[15] - m[11] * m[12];
	var b3 = m[ 9] * m[14] - m[10] * m[13];
	var b4 = m[ 9] * m[15] - m[11] * m[13];
	var b5 = m[10] * m[15] - m[11] * m[14];
	return a0 * b5 - a1 * b4 + a2 * b3 + a3 * b2 - a4 * b1 + a5 * b0;
}

function mat4_transposed(r, m)
{
	var t = _Mat4();
	t[ 0] = m[ 0]
	t[ 1] = m[ 4]; 
	t[ 2] = m[ 8]; 
	t[ 3] = m[12];
	t[ 4] = m[ 1];
	t[ 5] = m[ 5];
	t[ 6] = m[ 9]; 
	t[ 7] = m[13];
	t[ 8] = m[ 2]; 
	t[ 9] = m[ 6];
	t[10] = m[10]; 
	t[11] = m[14];
	t[12] = m[ 3]; 
	t[13] = m[ 7]; 
	t[14] = m[11];
	t[15] = m[15];
	vec_eq(r,t);
	mat4_stack.index--; 	
}

function mat4_inverse(r, m)
{
	var v0 = m[ 2] * m[ 7] - m[ 6] * m[ 3];
	var v1 = m[ 2] * m[11] - m[10] * m[ 3];
	var v2 = m[ 2] * m[15] - m[14] * m[ 3];
	var v3 = m[ 6] * m[11] - m[10] * m[ 7];
	var v4 = m[ 6] * m[15] - m[14] * m[ 7];
	var v5 = m[10] * m[15] - m[14] * m[11];

	var t0 =   v5 * m[5] - v4 * m[9] + v3 * m[13];
	var t1 = -(v5 * m[1] - v2 * m[9] + v1 * m[13]);
	var t2 =   v4 * m[1] - v2 * m[5] + v0 * m[13];
	var t3 = -(v3 * m[1] - v1 * m[5] + v0 * m[ 9]);

	var idet = 1.0 / (t0 * m[0] + t1 * m[4] + t2 * m[8] + t3 * m[12]);

	r[0] = t0 * idet;
	r[1] = t1 * idet;
	r[2] = t2 * idet;
	r[3] = t3 * idet;

	r[4] = -(v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
	r[5] =  (v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
	r[6] = -(v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
	r[7] =  (v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;

	v0 = m[1] * m[ 7] - m[ 5] * m[3];
	v1 = m[1] * m[11] - m[ 9] * m[3];
	v2 = m[1] * m[15] - m[13] * m[3];
	v3 = m[5] * m[11] - m[ 9] * m[7];
	v4 = m[5] * m[15] - m[13] * m[7];
	v5 = m[9] * m[15] - m[13] * m[11];

	r[ 8] =  (v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
	r[ 9] = -(v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
	r[10] =  (v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
	r[11] = -(v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;

	v0 = m[ 6] * m[1] - m[ 2] * m[ 5];
	v1 = m[10] * m[1] - m[ 2] * m[ 9];
	v2 = m[14] * m[1] - m[ 2] * m[13];
	v3 = m[10] * m[5] - m[ 6] * m[ 9];
	v4 = m[14] * m[5] - m[ 6] * m[13];
	v5 = m[14] * m[9] - m[10] * m[13];

	r[12] = -(v5 * m[4] - v4 * m[8] + v3 * m[12]) * idet;
	r[13] =  (v5 * m[0] - v2 * m[8] + v1 * m[12]) * idet;
	r[14] = -(v4 * m[0] - v2 * m[4] + v0 * m[12]) * idet;
	r[15] =  (v3 * m[0] - v1 * m[4] + v0 * m[ 8]) * idet;
}

function mat4_inverse_affine(r, m)
{
	var t0 = m[10] * m[5] - m[ 6] * m[9];
	var t1 = m[ 2] * m[9] - m[10] * m[1];
	var t2 = m[ 6] * m[1] - m[ 2] * m[5];

	var idet = 1.0 / (m[0] * t0 + m[4] * t1 + m[8] * t2);

	var v0 = m[0] * idet;
	var v4 = m[4] * idet;
	var v8 = m[8] * idet;

	r[ 0] = t0 * idet; 
	r[ 1] = t1 * idet; 
	r[ 2] = t2 * idet;
	r[ 3] = 0;
	r[ 4] = v8 * m[ 6] - v4 * m[10];
	r[ 5] = v0 * m[10] - v8 * m[ 2];
	r[ 6] = v4 * m[ 2] - v0 * m[ 6];
	r[ 7] = 0;
	r[ 8] = v4 * m[9] - v8 * m[5];
	r[ 9] = v8 * m[1] - v0 * m[9];
	r[10] = v0 * m[5] - v4 * m[1];
	r[11] = 0;
	r[12] = -(r[0] * m[12] + r[4] * m[13] + r[ 8] * m[14]);
	r[13] = -(r[1] * m[12] + r[5] * m[13] + r[ 9] * m[14]);
	r[14] = -(r[2] * m[12] + r[6] * m[13] + r[10] * m[14]);		
	r[15] = 1;

	return r;
}

function mat4_translate(m,v)
{
	var t = _Mat4();
	vec_eq(t,m);

	m[12] = t[0] * v[0] + t[4] * v[1] + t[ 8] * v[2] + t[12];
    m[13] = t[1] * v[0] + t[5] * v[1] + t[ 9] * v[2] + t[13];
    m[14] = t[2] * v[0] + t[6] * v[1] + t[10] * v[2] + t[14];
    m[15] = t[3] * v[0] + t[7] * v[1] + t[11] * v[2] + t[15];

    mat4_stack.index--;
}

function mat4_set_position(m, p)
{
	m[12] = p[0]; 
	m[13] = p[1]; 
	m[14] = p[2];
}

function mat4_get_position(r, m)
{
	r[0] = m[12];
	r[1] = m[13];
	r[2] = m[14];
}

function mat4_set_scale(m, s)
{
	m[ 0] = s[0]; 
	m[ 5] = s[1]; 
	m[10] = s[2];
}

function mat4_scale(m, s)
{
	m[ 0] *= s[0]; 
	m[ 1] *= s[0]; 
	m[ 2] *= s[0];
	m[ 3] *= s[0];
	m[ 4] *= s[1];
	m[ 5] *= s[1];
	m[ 6] *= s[1];
	m[ 7] *= s[1];
	m[ 8] *= s[2];
	m[ 9] *= s[2];
	m[10] *= s[2];
	m[11] *= s[2];
}

function mat4_get_scale(r, m)
{
	r[0] = m[0];
	r[1] = m[5];
	r[2] = m[10];
}

function mat4_rotate_x(m, rad) 
{
	var t = _Mat4();
	vec_eq(t,m);

    var s = Math.sin(rad);
    var c = Math.cos(rad);

    m[ 4] = t[ 4] * c + t[ 8] * s;
    m[ 5] = t[ 5] * c + t[ 9] * s;
    m[ 6] = t[ 6] * c + t[10] * s;
    m[ 7] = t[ 7] * c + t[11] * s;
    m[ 8] = t[ 8] * c - t[ 4] * s;
    m[ 9] = t[ 9] * c - t[ 5] * s;
    m[10] = t[10] * c - t[ 6] * s;
    m[11] = t[11] * c - t[ 7] * s;

    mat4_stack.index--;

    return m;
}

function mat4_rotate_y(m, rad) 
{
	var t = _Mat4();
	vec_eq(t,m);

    var s = Math.sin(rad);
    var c = Math.cos(rad);

    m[ 0] = t[0] * c - t[ 8] * s;
    m[ 1] = t[1] * c - t[ 9] * s;
    m[ 2] = t[2] * c - t[10] * s;
    m[ 3] = t[3] * c - t[11] * s;
    m[ 8] = t[0] * s + t[ 8] * c;
    m[ 9] = t[1] * s + t[ 9] * c;
    m[10] = t[2] * s + t[10] * c;
    m[11] = t[3] * s + t[11] * c;

    mat4_stack.index--;

    return m;
}

function mat4_rotate_z(m, rad) 
{
	var t = _Mat4();
	vec_eq(t,m);

    var s = Math.sin(rad);
    var c = Math.cos(rad);
    
    m[0] = t[0] * c + t[4] * s;
    m[1] = t[1] * c + t[5] * s;
    m[2] = t[2] * c + t[6] * s;
    m[3] = t[3] * c + t[7] * s;
    m[4] = t[4] * c - t[0] * s;
    m[5] = t[5] * c - t[1] * s;
    m[6] = t[6] * c - t[2] * s;
    m[7] = t[7] * c - t[3] * s;

    mat4_stack.index--;

    return m;
}

function mat4_set_rotation(m, r)
{
	var x2 = 2 * r[0]; 
	var y2 = 2 * r[1]; 
	var z2 = 2 * r[2];
	var xx = r[0] * x2; 
	var xy = r[0] * y2; 
	var xz = r[0] * z2;
	var yy = r[1] * y2;
	var yz = r[1] * z2;
	var zz = r[2] * z2;
	var wx = r[3] * x2; 
	var wy = r[3] * y2;
	var wz = r[3] * z2;

	m[ 0] = 1 - (yy + zz);
	m[ 1] = xy + wz;
	m[ 2] = xz - wy;
	m[ 3] = 0;
	m[ 4] = xy - wz;
	m[ 5] = 1 - (xx + zz);
	m[ 6] = yz + wx;
	m[ 7] = 0;
	m[ 8] = xz + wy;
	m[ 9] = yz - wx;
	m[10] = 1 - (xx + yy);
	m[11] = 0;
	m[12] = 0;
	m[13] = 0;
	m[14] = 0;
	m[15] = 1;
}

function mat4_get_rotation(r, m)
{
	var t;
	if(m[10] < 0)
	{
		if(m[0] > m[5])
		{
			t = 1 + m[0] - m[5] - m[10];
			vec4_set(t, m[1] + m[4], m[8] + m[2], m[6] - m[9]);
		}
		else
		{
			t = 1 - m[0] + m[5] - m[10];
			vec4_set(m[1] + m[4], t, m[6] + m[9], m[8] - m[2]);
		}
	}
	else
	{
		if (m[0] < -m[5])
		{
			t = 1 - m[0] - m[5] + m[10];
			vec4_set(m[8] + m[2], m[6] + m[9], t, m[1] - m[4]);
		}
		else
		{
			t = 1 + m[0] + m[5] + m[10];
			vec4_set(m[6] - m[9], m[8] - m[2], m[1] - m[4], t);
		}
	}

	var rf = _Vec4();
	vec_mul_f(rf, r, 0.5);
	vec_div_f(r, rf, t);
}

function mat4_compose(m, p, s, r)
{
	mat4_set_rotation(m,r);
	mat4_scale(m,s);
	mat4_set_position(m,p);
}

function mat4_mul_point(r, m, p)
{
	var x = m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12];
	var y = m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13];
	var z = m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14];
	r[0] = x; r[1] = y; r[2] = z;
}

function mat4_mul_dir(r, m, p)
{
	var x = m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2];
	var y = m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2];
	var z = m[2] * p[0] + m[6] * p[1] + m[10] * p[2];
	r[0] = x; r[1] = y; r[2] = z;
}

function mat4_mul_projection(r, m, p)
{
	var d = 1 / (m[3] * p[0] + m[7] * p[1] + m[11] * p[2] + m[15]);
	var x = (m[0] * p[0] + m[4] * p[1] + m[ 8] * p[2] + m[12]) * d;
	var y = (m[1] * p[0] + m[5] * p[1] + m[ 9] * p[2] + m[13]) * d;
	var z = (m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]) * d;

	r[0] = x; r[1] = y; r[2] = z;
}