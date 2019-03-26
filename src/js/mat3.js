function Mat3()
{
	return new Float32Array([1,0,0,
							 0,1,0,
							 0,0,1]);
}

var mat3_stack = new Stack(Mat3, 16);

function _Mat3()
{
	var r = mat3_stack.get();
	mat3_identity(r);
	return r;
}
function mat3_from_mat4(r, m)
{
	r[0] = m[0]; 
	r[1] = m[1]; 
	r[2] = m[2];
	r[3] = m[4]; 
	r[4] = m[5]; 
	r[5] = m[6];
	r[6] = m[8]; 
	r[7] = m[9]; 
	r[8] = m[10];
}

function mat3_identity(m)
{
	m[0] = 1; m[1] = 0; m[2] = 0;
	m[3] = 0; m[4] = 1; m[5] = 0;
	m[6] = 0; m[7] = 0; m[8] = 1;
}
function mat3_determinant(m)
{
	return m[0] * (m[4] * m[8] - m[5] * m[7]) -
      	   m[1] * (m[3] * m[8] - m[5] * m[6]) +
      	   m[2] * (m[3] * m[7] - m[4] * m[6]);
}
function mat3_inverse(r, m)
{
	var t = _Mat3();

    t[0] = m[4] * m[8] - m[5] * m[7];
    t[1] = m[2] * m[7] - m[1] * m[8];
    t[2] = m[1] * m[5] - m[2] * m[4];
    t[3] = m[5] * m[6] - m[3] * m[8];
    t[4] = m[0] * m[8] - m[2] * m[6];
    t[5] = m[2] * m[3] - m[0] * m[5];
    t[6] = m[3] * m[7] - m[4] * m[6];
    t[7] = m[1] * m[6] - m[0] * m[7];
    t[8] = m[0] * m[4] - m[1] * m[3];

    var det = m[0] * t[0] + m[1] * t[3] + m[2] * t[6];
    if(Math.abs(det) <= EPSILON)
    {
    	mat3_identity(r);
    	return;
    }

   	var idet = 1 / det;
   	for(var i = 0; i < 9; ++i) r[i] = t[i] * idet;

   	mat3_stack.index--;
}
function mat3_mul(r, a,b)
{
	var t = _Mat3();
	t[0] = a[0] * b[0] + a[1] * b[3] + a[2] * b[6];
	t[1] = a[0] * b[1] + a[1] * b[4] + a[2] * b[7];
	t[2] = a[0] * b[2] + a[1] * b[5] + a[2] * b[8];
	t[3] = a[3] * b[0] + a[4] * b[3] + a[5] * b[6];
	t[4] = a[3] * b[1] + a[4] * b[4] + a[5] * b[7];
	t[5] = a[3] * b[2] + a[4] * b[5] + a[5] * b[8];
	t[6] = a[6] * b[0] + a[7] * b[3] + a[8] * b[6];
	t[7] = a[6] * b[1] + a[7] * b[4] + a[8] * b[7];
	t[8] = a[6] * b[2] + a[7] * b[5] + a[8] * b[8];
	vec_eq(r,t);
}

function mat3_transposed(r,m)
{
	var t = _Mat3();
	t[0] = m[0];
	t[1] = m[3];
	t[2] = m[6]; 
	t[3] = m[1];
	t[4] = m[4];
	t[5] = m[7]; 
	t[6] = m[2]; 
	t[7] = m[5];
	t[8] = m[8];
	vec_eq(r,t);
}

function mat3_set_position(m, x, y)
{
	m[2] = x;
	m[5] = y;
}
function mat3_set_rotation(m, r)
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

	m[0] = 1 - (yy + zz);
	m[1] = xy + wz;
	m[2] = xz - wy;
	m[3] = xy - wz;
	m[4] = 1 - (xx + zz);
	m[5] = yz + wx;
	m[6] = xz + wy;
	m[7] = yz - wx;
	m[8] = 1 - (xx + yy);
}
function mat3_compose_f(m, x,y, sx,sy, r)
{
	var theta = -r * 0.01745329251;
	var st = Math.sin(theta);
	var ct = Math.cos(theta);

	m[0] = ct * sx;
	m[1] = st * sy;
	m[2] = x;
	m[3] = -st * sx;
	m[4] = ct * sy;
	m[5] = y;
	m[6] = 0;
	m[7] = 0;
	m[8] = 1;
}
function mat3_compose(m, p, s, r)
{
	mat3_compose_f(m, p[0], p[1], s[0], s[1], r);
}

function get_normal_matrix(r, model)
{
	mat3_from_mat4(r, model);
    mat3_inverse(r, r);
    mat3_transposed(r, r);
}