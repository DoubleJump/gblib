#define UV_OFFSET 
#define TSPACE_RENORMALIZE
#define TSPACE_ORTHOGONALIZE
#define SKIN_VERSION_2
#define SKIN_NO_FUZZ_TEX
#define SKIN_NO_TRANSLUCENCY_TEX
#define SKIN_NO_SUBDERMIS_TEX
#define SKIN
#define SHADOW_NATIVE_DEPTH
#define NOBLEND
#define SHADOW_COUNT 3
#define LIGHT_COUNT 3

precision highp float;

uniform mat4 uModelViewProjectionMatrix;
uniform mat4 uSkyMatrix;
uniform vec2 uUVOffset;

attribute vec3 vPosition;
attribute vec2 vTexCoord;
attribute vec2 vTangent;
attribute vec2 vBitangent;
attribute vec2 vNormal;

#ifdef VERTEX_COLOR
attribute vec4 vColor;
#endif

#ifdef TEXCOORD_SECONDARY
attribute vec2 vTexCoord2;
#endif

varying highp vec3 dv;
varying mediump vec2 d;
varying mediump vec3 dA;
varying mediump vec3 dB;
varying mediump vec3 dC;

#ifdef VERTEX_COLOR
varying lowp vec4 dD;
#endif

#ifdef TEXCOORD_SECONDARY
varying mediump vec2 dE;
#endif

vec3 iW(vec2 v)
{
	bool iX = (v.y > (32767.1/65535.0));
	v.y = iX ? (v.y-(32768.0/65535.0)):v.y;
	vec3 r;
	r.xy = (2.0 * 65535.0/32767.0) * v-vec2(1.0);
	r.z = sqrt(clamp(1.0-dot(r.xy,r.xy),0.0,1.0));
	r.z = iX ? -r.z:r.z;
	return r;
}

vec4 h(mat4 i,vec3 p)
{
	return i[0] * p.x + (i[1] * p.y + (i[2] * p.z + i[3]));
}

vec3 u(mat4 i,vec3 v)
{
	return i[0].xyz * v.x+i[1].xyz * v.y + i[2].xyz * v.z;
}

void main(void)
{
	gl_Position = h(uModelViewProjectionMatrix, vPosition.xyz);
	d = vTexCoord + uUVOffset;
	dA = u(uSkyMatrix, iW(vTangent));

	dB = u(uSkyMatrix, iW(vBitangent));
	dC = u(uSkyMatrix, iW(vNormal));
	dv = h(uSkyMatrix, vPosition.xyz).xyz;

	#ifdef VERTEX_COLOR
	dD = vColor;
	#endif

	#ifdef TEXCOORD_SECONDARY
	dE = vTexCoord2;
	#endif
}


#define UV_OFFSET 
#define TSPACE_RENORMALIZE
#define TSPACE_ORTHOGONALIZE
#define SKIN_VERSION_2
#define SKIN_NO_FUZZ_TEX
#define SKIN_NO_TRANSLUCENCY_TEX
#define SKIN_NO_SUBDERMIS_TEX
#define SKIN
#define SHADOW_NATIVE_DEPTH
#define NOBLEND
#define SHADOW_COUNT 3
#define LIGHT_COUNT 3

#extension GL_OES_standard_derivatives : enable
precision mediump float;

varying highp vec3 dv;
varying mediump vec2 d;
varying mediump vec3 dA;
varying mediump vec3 dB;
varying mediump vec3 dC;

#ifdef VERTEX_COLOR
varying lowp vec4 dD;
#endif

#ifdef TEXCOORD_SECONDARY
varying mediump vec2 dE;
#endif

uniform sampler2D tAlbedo;
uniform sampler2D tReflectivity;
uniform sampler2D tNormal;
uniform sampler2D tExtras;
uniform sampler2D tSkySpecular;

#ifdef REFRACTION
uniform sampler2D tRefraction;
#endif

uniform vec4 uDiffuseCoefficients[9];
uniform vec3 uCameraPosition;
uniform float uAlphaTest;
uniform vec3 uFresnel;
uniform float uHorizonOcclude;
uniform float uHorizonSmoothing;

#ifdef EMISSIVE
uniform float uEmissiveScale;
uniform vec4 uTexRangeEmissive;
#endif

#ifdef AMBIENT_OCCLUSION
uniform vec4 uTexRangeAO;
#endif

#ifdef REFRACTION
uniform float uRefractionIOREntry;
uniform float uRefractionRayDistance;
uniform vec3 uRefractionTint;
uniform float uRefractionAlbedoTint;
uniform mat4 uRefractionViewProjection;
uniform vec4 uTexRangeRefraction;
#endif

#ifdef LIGHT_COUNT
uniform vec4 uLightPositions[LIGHT_COUNT];
uniform vec3 uLightDirections[LIGHT_COUNT];
uniform vec3 uLightColors[LIGHT_COUNT];
uniform vec3 uLightParams[LIGHT_COUNT];
uniform vec3 uLightSpot[LIGHT_COUNT];
#endif

#ifdef ANISO
uniform float uAnisoStrength;
uniform vec3 uAnisoTangent;
uniform float uAnisoIntegral;
uniform vec4 uTexRangeAniso;
#endif

#define saturate(x) clamp( x, 0.0, 1.0 )

vec3 dG(vec3 c)
{
	return c*c;
}

vec3 dJ(vec3 n)
{
	vec3 hn=dA;
	vec3 ho=dB;
	vec3 hu = gl_FrontFacing ? dC : -dC;

	#ifdef TSPACE_RENORMALIZE
	hu = normalize(hu);
	#endif

	#ifdef TSPACE_ORTHOGONALIZE
	hn -= dot(hn,hu)*hu;
	#endif

	#ifdef TSPACE_RENORMALIZE
	hn = normalize(hn);
	#endif

	#ifdef TSPACE_ORTHOGONALIZE
	ho = (ho-dot(ho,hu)*hu)-dot(ho,hn)*hn;
	#endif

	#ifdef TSPACE_RENORMALIZE
	ho = normalize(ho);
	#endif

	#ifdef TSPACE_COMPUTE_BITANGENT
	vec3 hv = cross(hu,hn);
	ho = dot(hv,ho) < 0.0 ? -hv:hv;
	#endif

	n = 2.0 * n - vec3(1.0);
	return normalize(hn * n.x + ho * n.y + hu * n.z);
}

vec3 dL(vec3 t)
{
	vec3 hu = gl_FrontFacing ? dC: -dC;
	return normalize(dA*t.x+dB*t.y+hu*t.z);
}

vec4 dM(vec2 hA,vec4 hB)
{
	#if GL_OES_standard_derivatives
	vec2 hC=fract(hA);
	vec2 hD=fwidth(hC);
	float hE=(hD.x+hD.y) > 0.5 ? -6.0:0.0;
	return texture2D(tExtras,hC*hB.xy+hB.zw,hE);
	#else
	return texture2D(tExtras,fract(hA)*hB.xy+hB.zw);
	#endif
}

vec3 hF(sampler2D hG,vec2 hH,float hI)
{
	vec3 n = texture2D(hG,hH,hI * 2.5).xyz;
	return dJ(n);
}

vec3 eY(vec3 eZ,float fc)
{
	return exp(-0.5 * fc / (eZ*eZ)) / (eZ*2.5066283);
}

vec3 fd(vec3 eZ)
{
	return vec3(1.0,1.0,1.0) / (eZ * 2.5066283);
}

vec3 fe(vec3 ff)
{
	return vec3(-0.5,-0.5,-0.5)/(ff);
}

vec3 fh(vec3 fi,float fc)
{
	return exp(fi*fc);
}

#define SAMPLE_COUNT 21.0
#define SAMPLE_HALF 10.0
#define GAUSS_SPREAD 0.05

vec3 fj(float fk,float fl,vec3 fm)
{
	vec3 fn=vec3(fl,fl,fl);
	fn=0.8*fn+vec3(0.2);
	vec3 fo=cos(fn*3.14159);
	vec3 fu=cos(fn*3.14159*0.5);
	fu*=fu;
	fu*=fu;
	fu*=fu;
	fn=fn+0.05*fo*fu*fm;
	fu*=fu;
	fu*=fu;
	fu*=fu;
	fn=fn+0.1*fo*fu*fm;
	fn = saturate(fn);
	fn *= fn*1.2;
	return fn;
}

vec3 fv(vec3 fm)
{
	return vec3(1.0,1.0,1.0)/3.1415926;
}

float fA(float fk,float fm)
{
	return saturate(-fk*fm+fk+fm);
}

vec3 fB(float fk,vec3 fm)
{
	return saturate(-fk*fm+vec3(fk)+fm);
}

float fC(float fm)
{
	return-0.31830988618379*fm+0.31830988618379;
}

vec3 fD(vec3 fm)
{
	return-0.31830988618379*fm+vec3(0.31830988618379);
}

vec3 eT(vec3 dO,vec3 dI,vec3 dP,float fE)
{
	float C=1.0-saturate(dot(dO,dI));
	float fF=C*C;
	C*=fF*fF;
	C*=fE;
	return(dP-C*dP)+C*uFresnel;
}

vec2 fG(vec2 fH,vec2 fm)
{
	fH=1.0-fH;
	vec2 fI=fH*fH;
	fI*=fI;
	fH=mix(fI,fH*0.4,fm);
	return fH;
}

vec3 ej(vec3 fJ)
{
	#define c(n) uDiffuseCoefficients[n].xyz
	vec3 G=(c(0)+fJ.y*((c(1)+c(4)*fJ.x)+c(5)*fJ.z))+fJ.x*(c(3)+c(7)*fJ.z)+c(2)*fJ.z;
	#undef c
	
	vec3 sqr=fJ*fJ;
	G+=uDiffuseCoefficients[6].xyz*(3.0*sqr.z-1.0);
	G+=uDiffuseCoefficients[8].xyz*(sqr.x-sqr.y);
	return G;
}

void fK(inout vec3 fL,inout vec3 fM,inout vec3 fN,vec3 fJ)
{
	fL=uDiffuseCoefficients[0].xyz;
	fM=uDiffuseCoefficients[1].xyz * fJ.y;
	fM+=uDiffuseCoefficients[2].xyz * fJ.z;
	fM+=uDiffuseCoefficients[3].xyz*fJ.x;
	vec3 swz=fJ.yyz*fJ.xzx;
	fN=uDiffuseCoefficients[4].xyz*swz.x;
	fN+=uDiffuseCoefficients[5].xyz*swz.y;
	fN+=uDiffuseCoefficients[7].xyz*swz.z;
	vec3 sqr=fJ*fJ;
	fN+=uDiffuseCoefficients[6].xyz*(3.0*sqr.z-1.0);
	fN+=uDiffuseCoefficients[8].xyz*(sqr.x-sqr.y);
}

vec3 fO(vec3 fL,vec3 fM,vec3 fN,vec3 fP,float fm)
{
	fP=mix(vec3(1.0),fP,fm);
	return(fL+fM*fP.x)+fN*fP.z;
}

vec3 fQ(vec3 fL,vec3 fM,vec3 fN,vec3 fP,vec3 fR)
{
	vec3 fS=mix(vec3(1.0),fP.yyy,fR);
	vec3 fT=mix(vec3(1.0),fP.zzz,fR);
	return(fL+fM*fS)+fN*fT;
}

vec3 em(vec3 fJ,float dQ)
{
	fJ/=dot(vec3(1.0),abs(fJ));
	vec2 fU=abs(fJ.zx)-vec2(1.0,1.0);
	vec2 fV=vec2(fJ.x<0.0?fU.x:-fU.x,fJ.z<0.0?fU.y:-fU.y);
	vec2 fW=(fJ.y<0.0)?fV:fJ.xz;
	fW=vec2(0.5*(254.0/256.0),0.125*0.5*(254.0/256.0))*fW+vec2(0.5,0.125*0.5);
	float fX=fract(7.0*dQ);
	fW.y+=0.125*(7.0*dQ-fX);
	vec2 fY=fW+vec2(0.0,0.125);
	vec4 fZ=mix(texture2D(tSkySpecular,fW),texture2D(tSkySpecular,fY),fX);
	vec3 r=fZ.xyz*(7.0*fZ.w);return r*r;
}

float en(vec3 fJ,vec3 hc)
{
	float hd=dot(fJ,hc);
	hd=saturate(1.0+uHorizonOcclude*hd);
	return hd*hd;
}

#ifdef SHADOW_COUNT
#ifdef MOBILE
#define SHADOW_KERNEL (4.0/1536.0)
#else
#define SHADOW_KERNEL (4.0/2048.0)
#endif

highp vec4 h(highp mat4 i,highp vec3 p)
{
	return i[0]*p.x+(i[1]*p.y+(i[2]*p.z+i[3]));
}

uniform sampler2D tDepth0;
#if SHADOW_COUNT > 1
uniform sampler2D tDepth1;
#if SHADOW_COUNT > 2
uniform sampler2D tDepth2;
#endif
#endif

uniform highp vec2 uShadowKernelRotation;
uniform highp vec2 uShadowMapSize;
uniform highp mat4 uShadowMatrices[SHADOW_COUNT];
uniform highp vec4 uShadowTexelPadProjections[SHADOW_COUNT];

#ifndef MOBILE
uniform highp mat4 uInvShadowMatrices[SHADOW_COUNT];
#endif

highp float hJ(highp vec3 G)
{
	#ifdef SHADOW_NATIVE_DEPTH
	return G.x;
	#else
	return(G.x+G.y*(1.0/255.0))+G.z*(1.0/65025.0);
	#endif
}

#ifndef SHADOW_COMPARE
#define SHADOW_COMPARE(a,b) ((a) < (b) ? 1.0 : 0.0)
#endif

#ifndef SHADOW_CLIP
#define SHADOW_CLIP(c,v) v
#endif

float hK(sampler2D hL,highp vec2 hA,highp float H)
{
#ifndef MOBILE
highp vec2 c=hA*uShadowMapSize.x;highp vec2 a=floor(c)*uShadowMapSize.y,b=ceil(c)*uShadowMapSize.y;highp vec4 eE;eE.x=hJ(texture2D(hL,a).xyz);eE.y=hJ(texture2D(hL,vec2(b.x,a.y)).xyz);eE.z=hJ(texture2D(hL,vec2(a.x,b.y)).xyz);eE.w=hJ(texture2D(hL,b).xyz);highp vec4 hM;hM.x=SHADOW_COMPARE(H,eE.x);hM.y=SHADOW_COMPARE(H,eE.y);hM.z=SHADOW_COMPARE(H,eE.z);hM.w=SHADOW_COMPARE(H,eE.w);highp vec2 w=c-a*uShadowMapSize.x;vec2 s=(w.y*hM.zw+hM.xy)-w.y*hM.xy;return(w.x*s.y+s.x)-w.x*s.x;
#else
highp float G=hJ(texture2D(hL,hA.xy).xyz);return SHADOW_COMPARE(H,G);
#endif
}highp float hN(sampler2D hL,highp vec3 hA,float hO){highp vec2 l=uShadowKernelRotation*hO;float s;s=hK(hL,hA.xy+l,hA.z);s+=hK(hL,hA.xy-l,hA.z);s+=hK(hL,hA.xy+vec2(-l.y,l.x),hA.z);s+=hK(hL,hA.xy+vec2(l.y,-l.x),hA.z);s*=0.25;return s*s;}struct ev{float eL[LIGHT_COUNT];};void eB(out ev ss,float hO){highp vec3 hP[SHADOW_COUNT];vec3 hu=gl_FrontFacing?dC:-dC;for(int k=0;k<SHADOW_COUNT;++k){vec4 hQ=uShadowTexelPadProjections[k];float hR=hQ.x*dv.x+(hQ.y*dv.y+(hQ.z*dv.z+hQ.w));
#ifdef MOBILE
hR*=.001+hO;
#else
hR*=.0005+0.5*hO;
#endif
highp vec4 hS=h(uShadowMatrices[k],dv+hR*hu);hP[k]=hS.xyz/hS.w;}float m;
#if SHADOW_COUNT > 0
m=hN(tDepth0,hP[0],hO);ss.eL[0]=SHADOW_CLIP(hP[0].xy,m);
#endif
#if SHADOW_COUNT > 1
m=hN(tDepth1,hP[1],hO);ss.eL[1]=SHADOW_CLIP(hP[1].xy,m);
#endif
#if SHADOW_COUNT > 2
m=hN(tDepth2,hP[2],hO);ss.eL[2]=SHADOW_CLIP(hP[2].xy,m);
#endif
for(int k=SHADOW_COUNT;k<LIGHT_COUNT;++k){ss.eL[k]=1.0;}}struct eD{highp float eE[LIGHT_COUNT];};
#ifdef MOBILE
void eG(out eD ss,float hO){for(int k=0;k<LIGHT_COUNT;++k){ss.eE[k]=1.0;}}
#else
highp vec4 hT(sampler2D hL,highp vec2 hA,highp mat4 hU){highp vec4 E;E.xy=hA;
#ifndef MOBILE
highp vec2 c=hA*uShadowMapSize.x;highp vec2 a=floor(c)*uShadowMapSize.y,b=ceil(c)*uShadowMapSize.y;highp vec4 hM;hM.x=hJ(texture2D(hL,a).xyz);hM.y=hJ(texture2D(hL,vec2(b.x,a.y)).xyz);hM.z=hJ(texture2D(hL,vec2(a.x,b.y)).xyz);hM.w=hJ(texture2D(hL,b).xyz);highp vec2 w=c-a*uShadowMapSize.x;vec2 s=(w.y*hM.zw+hM.xy)-w.y*hM.xy;E.z=(w.x*s.y+s.x)-w.x*s.x;
#else 
E.z=hJ(texture2D(hL,hA.xy).xyz);
#endif
E=h(hU,E.xyz);E.xyz/=E.w;return E;}void eG(out eD ss,float hO){highp vec3 hV[SHADOW_COUNT];vec3 hu=gl_FrontFacing?dC:-dC;hu*=0.6;for(int k=0;k<SHADOW_COUNT;++k){vec4 hQ=uShadowTexelPadProjections[k];float hR=hQ.x*dv.x+(hQ.y*dv.y+(hQ.z*dv.z+hQ.w));
#ifdef MOBILE
hR*=.001+hO;
#else
hR*=.0005+0.5*hO;
#endif
highp vec4 hS=h(uShadowMatrices[k],dv-hR*hu);hV[k]=hS.xyz/hS.w;}highp vec4 hW;
#if SHADOW_COUNT > 0
hW=hT(tDepth0,hV[0].xy,uInvShadowMatrices[0]);ss.eE[0]=length(dv.xyz-hW.xyz);
#endif
#if SHADOW_COUNT > 1
hW=hT(tDepth1,hV[1].xy,uInvShadowMatrices[1]);ss.eE[1]=length(dv.xyz-hW.xyz);
#endif
#if SHADOW_COUNT > 2
hW=hT(tDepth2,hV[2].xy,uInvShadowMatrices[2]);ss.eE[2]=length(dv.xyz-hW.xyz);
#endif
for(int k=SHADOW_COUNT;k<LIGHT_COUNT;++k){ss.eE[k]=1.0;}}
#endif
#endif

/*
#ifdef SKIN
#ifndef SKIN_NO_SUBDERMIS_TEX
uniform vec4 uTexRangeSubdermis;
#endif
#ifndef SKIN_NO_TRANSLUCENCY_TEX
uniform vec4 uTexRangeTranslucency;
#endif
#ifndef SKIN_NO_FUZZ_TEX
uniform vec4 uTexRangeFuzz;
#endif
uniform vec4 uTransColor;uniform vec4 uFresnelColor;uniform vec3 uSubdermisColor;uniform float uTransScatter;uniform float uFresnelOcc;uniform float uFresnelGlossMask;uniform float uTransSky;uniform float uFresnelIntegral;uniform float uTransIntegral;uniform float uSkinTransDepth;uniform float uSkinShadowBlur;uniform float uNormalSmooth;struct dX{vec3 hX;vec3 hY,hZ,ic,he;vec3 ec,eh,id;vec3 ie;vec3 ih;vec3 ii;vec3 ij;float ik;float il;float im;float eC;};void dZ(out dX s){vec4 m;
#ifdef SKIN_NO_SUBDERMIS_TEX
s.hX=uSubdermisColor;s.im=1.0;
#else 
m=dM(d,uTexRangeSubdermis);s.hX=dG(m.xyz);s.im=m.w*m.w;
#endif
s.ij=uTransColor.rgb;s.ik=uTransScatter;
#ifdef SKIN_VERSION_1
s.eC=uSkinShadowBlur*s.im;
#else 
s.il=max(max(s.ij.r,s.ij.g),s.ij.b)*uTransColor.a;float io=max(s.hX.r,max(s.hX.g,s.hX.b));io=1.0-io;io*=io;io*=io;io*=io;io=1.0-(io*io);s.im*=io;s.eC=uSkinShadowBlur*s.im*dot(s.hX.rgb,vec3(0.333,0.334,0.333));
#endif
#ifndef SKIN_NO_TRANSLUCENCY_TEX
m=dM(d,uTexRangeTranslucency);s.ij*=dG(m.xyz);
#endif
s.ie=hF(tNormal,d,uNormalSmooth*s.im);vec3 iu,iv,iA;fK(iu,iv,iA,s.ie);s.eh=s.hY=iu+iv+iA;
#ifdef SKIN_VERSION_1 
s.ec=fQ(iu,iv,iA,vec3(1.0,0.6667,0.25),s.hX);
#else
s.ec=fQ(iu,iv,iA,vec3(1.0,0.6667,0.25),s.hX*0.2+vec3(0.1));
#endif
#ifdef SKIN_VERSION_1
vec3 iB,iC,iD;fK(iB,iC,iD,-s.ie);s.id=fO(iB,iC,iD,vec3(1.0,0.4444,0.0625),s.ik);s.id*=uTransSky;
#else 
s.id=vec3(0.0);
#endif
s.hZ=s.ic=s.he=vec3(0.0);s.hX*=0.5;s.ik*=0.5;s.ih=uFresnelColor.rgb;s.ii=uFresnelColor.aaa*vec3(1.0,0.5,0.25);
#ifndef SKIN_NO_FUZZ_TEX
m=dM(d,uTexRangeFuzz);s.ih*=dG(m.rgb);
#endif
}void eK(inout dX s,float iE,float iF,vec3 eH,vec3 dI,vec3 eJ){float fk=dot(eH,dI);float fl=dot(eH,s.ie);float eN=saturate((1.0/3.1415926)*fk);float hi=iE*iE;hi*=hi;hi=saturate(6.0*hi);
#ifdef SKIN_VERSION_1 
vec3 iG=fB(fl,s.hX);
#else 
vec3 iG=fj(fk,fl,s.hX);
#endif
float iH=fA(-fl,s.ik);vec3 ic=vec3(iH*iH);
#ifdef SKIN_VERSION_1
#ifdef SHADOW_COUNT
vec3 iI=vec3(iE);float iJ=saturate(hi-2.0*(iE*iE));iI+=iJ*s.hX;float iK=iE;
#endif
#else
#ifdef SHADOW_COUNT
vec3 iI;highp vec3 iL=(0.995*s.hX)+vec3(0.005,0.005,0.005);highp vec3 iM=vec3(1.0)-iL;iL=mix(iL,iM,iE);float iN=sqrt(iE);vec3 iO=2.0*vec3(1.0-iN);iN=1.0-iN;iN=(1.0-iN*iN);iI=saturate(pow(iL*iN,iO));highp float iP=0.35/(uSkinTransDepth+0.001);highp float iQ=saturate(iF*iP);iQ=saturate(1.0-iQ);iQ*=iQ;highp vec3 iR=vec3((-3.0*iQ)+3.15);highp vec3 iS=(0.9975*s.ij)+vec3(0.0025,0.0025,0.0025);highp float io=saturate(10.0*dot(iS,iS));vec3 iK=pow(iS*iQ,iR)*io;
#else 
ic=vec3(0.0);
#endif
#endif
float hj=fA(fl,s.ii.z);
#ifdef SHADOW_COUNT
vec3 hk=mix(vec3(1.0),iI,uFresnelOcc);vec3 he=hj*hk;
#else
vec3 he=vec3(hj);
#endif
#ifdef SHADOW_COUNT
iG*=iI;eN*=hi;ic*=iK;
#endif
s.he=he*eJ+s.he;s.ic=ic*eJ+s.ic;s.hZ=iG*eJ+s.hZ;s.hY=eN*eJ+s.hY;}void eQ(out vec3 ei,out vec3 diff_extra,inout dX s,vec3 dO,vec3 dI,float dQ){s.he*=uFresnelIntegral;float fH=dot(dO,dI);vec2 hl=fG(vec2(fH,fH),s.ii.xy);s.he=s.eh*hl.x+(s.he*hl.y);s.he*=s.ih;float hm=saturate(1.0+-uFresnelGlossMask*dQ);s.he*=hm*hm;s.ic=s.ic*uTransIntegral;
#ifdef SKIN_VERSION_1
s.hZ=(s.hZ*fD(s.hX))+s.ec;
#else
s.hZ=(s.hZ*fv(s.hX))+s.ec;
#endif
ei=mix(s.hY,s.hZ,s.im);
#ifdef SKIN_VERSION_1
s.ic=(s.ic+s.id)*s.ij;diff_extra=(s.he+s.ic)*s.im;
#else
ei+=s.ic*s.il;diff_extra=s.he*s.im;
#endif
}
#endif
*/

/*
#ifdef MICROFIBER
uniform vec4 uTexRangeFuzz;uniform vec4 uFresnelColor;uniform float uFresnelIntegral;uniform float uFresnelOcc;uniform float uFresnelGlossMask;struct ed{vec3 eh;vec3 eN;vec3 he;vec3 hf;vec3 hh;};void ef(out ed s,vec3 dI){s.eh=s.eN=ej(dI);s.he=vec3(0.0);s.hf=uFresnelColor.rgb;s.hh=uFresnelColor.aaa*vec3(1.0,0.5,0.25);
#ifndef MICROFIBER_NO_FUZZ_TEX
vec4 m=dM(d,uTexRangeFuzz);s.hf*=dG(m.rgb);
#endif
}void eM(inout ed s,float hi,vec3 eH,vec3 dI,vec3 eJ){float fk=dot(eH,dI);float eN=saturate((1.0/3.1415926)*fk);float hj=fA(fk,s.hh.z);
#ifdef SHADOW_COUNT
eN*=hi;float hk=mix(1.0,hi,uFresnelOcc);float he=hj*hk;
#else 
float he=hj;
#endif
s.he=he*eJ+s.he;s.eN=eN*eJ+s.eN;}void eR(out vec3 ei,out vec3 diff_extra,inout ed s,vec3 dO,vec3 dI,float dQ){s.he*=uFresnelIntegral;float fH=dot(dO,dI);vec2 hl=fG(vec2(fH,fH),s.hh.xy);s.he=s.eh*hl.x+(s.he*hl.y);s.he*=s.hf;float hm=saturate(1.0+-uFresnelGlossMask*dQ);s.he*=hm*hm;ei=s.eN;diff_extra=s.he;}
#endif
*/

/*
#ifdef STRIPVIEW
uniform float uStrips[5];uniform vec2 uStripRes;struct dT{float io[5];float bg;};void dV(out dT iT,inout float dQ,inout vec3 dP){highp vec2 hA=gl_FragCoord.xy*uStripRes-vec2(1.0,1.0);hA.x+=0.25*hA.y;iT.io[0]=step(hA.x,uStrips[0]);iT.io[1]=step(hA.x,uStrips[1]);iT.io[2]=step(hA.x,uStrips[2]);iT.io[3]=step(hA.x,uStrips[3]);iT.io[4]=step(hA.x,uStrips[4]);iT.bg=1.0-iT.io[4];iT.io[4]-=iT.io[3];iT.io[3]-=iT.io[2];iT.io[2]-=iT.io[1];iT.io[1]-=iT.io[0];bool iU=iT.io[4]>0.0;dQ=iU?0.5:dQ;dP=iU?vec3(0.1):dP;}vec3 eX(dT iT,vec3 dI,vec3 dF,vec3 dP,float dQ,vec3 ei,vec3 el,vec3 iV){return iT.io[0]*(dI*0.5+vec3(0.5))+iT.io[1]*dF+iT.io[2]*dP+vec3(iT.io[3]*dQ)+iT.io[4]*(vec3(0.12)+0.3*ei+el)+iT.bg*iV;}
#endif
*/

#ifdef TRANSPARENCY_DITHER
float f(highp float I){highp float G=0.5*fract(gl_FragCoord.x*0.5)+0.5*fract(gl_FragCoord.y*0.5);return 0.4+0.6*fract(G+3.141592e6*I);}
#endif
void main(void){vec4 m=texture2D(tAlbedo,d);vec3 dF=dG(m.xyz);float e=m.w;
#ifdef VERTEX_COLOR
{vec3 dH=dD.xyz;
#ifdef VERTEX_COLOR_SRGB
dH=dH*(dH*(dH*0.305306011+vec3(0.682171111))+vec3(0.012522878));
#endif
dF*=dH;
#ifdef VERTEX_COLOR_ALPHA
e*=dD.w;
#endif
}
#endif
#ifdef ALPHA_TEST
if(e<uAlphaTest){discard;}
#endif
#ifdef TRANSPARENCY_DITHER
e=(e>f(d.x))?1.0:e;
#endif
vec3 dI=dJ(texture2D(tNormal,d).xyz);
#ifdef ANISO
#ifdef ANISO_NO_DIR_TEX
vec3 dK=dL(uAnisoTangent);
#else
m=dM(d,uTexRangeAniso);vec3 dK=2.0*m.xyz-vec3(1.0);dK=dL(dK);
#endif
dK=dK-dI*dot(dK,dI);dK=normalize(dK);vec3 dN=dK*uAnisoStrength;
#endif
vec3 dO=normalize(uCameraPosition-dv);m=texture2D(tReflectivity,d);vec3 dP=dG(m.xyz);float dQ=m.w;float dR=dQ;
#ifdef HORIZON_SMOOTHING
float dS=dot(dO,dI);dS=uHorizonSmoothing-dS*uHorizonSmoothing;dQ=mix(dQ,1.0,dS*dS);
#endif
#ifdef STRIPVIEW
dT dU;dV(dU,dQ,dP);
#endif
float dW=1.0;
#ifdef AMBIENT_OCCLUSION
#ifdef AMBIENT_OCCLUSION_SECONDARY_UV
dW=dM(dE,uTexRangeAO).x;
#else
dW=dM(d,uTexRangeAO).x;
#endif
dW*=dW;
#endif
#if defined(SKIN)
dX dY;dZ(dY);dY.ec*=dW;
#elif defined(MICROFIBER)
ed ee;ef(ee,dI);ee.eh*=dW;
#else
vec3 ei=ej(dI);ei*=dW;
#endif
vec3 ek=reflect(-dO,dI);
#ifdef ANISO
vec3 rt=ek-(0.5*dN*dot(ek,dK));vec3 el=em(rt,mix(dQ,0.5*dQ,uAnisoStrength));
#else
vec3 el=em(ek,dQ);
#endif
el*=en(ek,dC);
#ifdef LIGHT_COUNT
highp float eo=10.0/log2(dQ*0.968+0.03);eo*=eo;float eu=eo*(1.0/(8.0*3.1415926))+(4.0/(8.0*3.1415926));eu=min(eu,1.0e3);
#ifdef SHADOW_COUNT
ev eA;
#ifdef SKIN
#ifdef SKIN_VERSION_1
eB(eA,SHADOW_KERNEL+SHADOW_KERNEL*dY.eC);
#else
eD eE;float eF=SHADOW_KERNEL+SHADOW_KERNEL*dY.eC;eG(eE,eF);eB(eA,eF);
#endif
#else
eB(eA,SHADOW_KERNEL);
#endif
#endif
#ifdef ANISO
eu*=uAnisoIntegral;
#endif
for(int k=0;k<LIGHT_COUNT;++k){vec3 eH=uLightPositions[k].xyz-dv*uLightPositions[k].w;float eI=inversesqrt(dot(eH,eH));eH*=eI;float a=saturate(uLightParams[k].z/eI);a=1.0+a*(uLightParams[k].x+uLightParams[k].y*a);float s=saturate(dot(eH,uLightDirections[k]));s=saturate(uLightSpot[k].y-uLightSpot[k].z*(1.0-s*s));vec3 eJ=(a*s)*uLightColors[k].xyz;
#if defined(SKIN)
#ifdef SHADOW_COUNT
#ifdef SKIN_VERSION_1
eK(dY,eA.eL[k],1.0,eH,dI,eJ);
#else
eK(dY,eA.eL[k],eE.eE[k],eH,dI,eJ);
#endif
#else
eK(dY,1.0,0.0,eH,dI,eJ);
#endif
#elif defined(MICROFIBER)
#ifdef SHADOW_COUNT
eM(ee,eA.eL[k],eH,dI,eJ);
#else
eM(ee,1.0,eH,dI,eJ);
#endif
#else
float eN=saturate((1.0/3.1415926)*dot(eH,dI));
#ifdef SHADOW_COUNT
eN*=eA.eL[k];
#endif
ei+=eN*eJ;
#endif
vec3 eO=eH+dO;
#ifdef ANISO
eO=eO-(dN*dot(eO,dK));
#endif
eO=normalize(eO);float eP=eu*pow(saturate(dot(eO,dI)),eo);
#ifdef SHADOW_COUNT
eP*=eA.eL[k];
#endif
el+=eP*eJ;}
#endif
#if defined(SKIN)
vec3 ei,diff_extra;eQ(ei,diff_extra,dY,dO,dI,dQ);
#elif defined(MICROFIBER)
vec3 ei,diff_extra;eR(ei,diff_extra,ee,dO,dI,dQ);
#endif
vec3 eS=eT(dO,dI,dP,dQ*dQ);el*=eS;
#ifdef REFRACTION
vec4 eU;{vec3 G=refract(-dO,dI,uRefractionIOREntry);G=dv+G*uRefractionRayDistance;vec4 eV=uRefractionViewProjection[0]*G.x+(uRefractionViewProjection[1]*G.y+(uRefractionViewProjection[2]*G.z+uRefractionViewProjection[3]));vec2 c=eV.xy/eV.w;c=0.5*c+vec2(0.5,0.5);vec2 i=mod(floor(c),2.0);c=fract(c);c.x=i.x>0.0?1.0-c.x:c.x;c.y=i.y>0.0?1.0-c.y:c.y;eU.rgb=texture2D(tRefraction,c).xyz;eU.rgb=mix(eU.rgb,eU.rgb*dF,uRefractionAlbedoTint);eU.rgb=eU.rgb-eU.rgb*eS;eU.rgb*=uRefractionTint;
#ifdef REFRACTION_NO_MASK_TEX
eU.a=1.0;
#else
eU.a=dM(d,uTexRangeRefraction).x;
#endif
}
#endif
#ifdef DIFFUSE_UNLIT
gl_FragColor.xyz=dF;
#else
gl_FragColor.xyz=ei*dF;
#endif
#ifdef REFRACTION
gl_FragColor.xyz=mix(gl_FragColor.xyz,eU.rgb,eU.a);
#endif
gl_FragColor.xyz+=el;
#if defined(SKIN) || defined(MICROFIBER)
gl_FragColor.xyz+=diff_extra;
#endif
#ifdef EMISSIVE
#ifdef EMISSIVE_SECONDARY_UV
vec2 eW=dE;
#else
vec2 eW=d;
#endif
gl_FragColor.xyz+=uEmissiveScale*dG(dM(eW,uTexRangeEmissive).xyz);
#endif
#ifdef STRIPVIEW
gl_FragColor.xyz=eX(dU,dI,dF,dP,dR,ei,el,gl_FragColor.xyz);
#endif
#ifdef NOBLEND
gl_FragColor.w=1.0;
#else
gl_FragColor.w=e;
#endif
}