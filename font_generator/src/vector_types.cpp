struct Vec2
{
	f32 x, y;
	f32& operator[](int i){ return (&x)[i]; } 
};

struct Vec3
{
	f32 x, y, z;
	f32& operator[](int i){ return (&x)[i]; } 
};

struct Vec4
{
	f32 x, y, z, w;
	f32& operator[](int i){ return (&x)[i]; } 
};

struct Mat3
{
	f32 m[9];
	f32& operator[](int i){ return m[i]; } 
};

struct Mat4
{
	f32 m[16];
	f32& operator[](int i){ return m[i]; }; 
};

struct Ray
{
	Vec3 origin;
	Vec3 direction;
	f32 length;
};

struct AABB
{
	Vec3 min;
	Vec3 max;
};

struct RGB
{
	u8 r,g,b;
};