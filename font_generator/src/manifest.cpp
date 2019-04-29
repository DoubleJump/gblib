#include <ft2build.h>
#include FT_FREETYPE_H 
#include FT_OUTLINE_H

#define _CRT_SECURE_NO_WARNINGS

#include <stdint.h>
#include <cstdio>
#include <cstdlib>
#define _USE_MATH_DEFINES
#include <cmath>
#include <cstring>
#include <wchar.h>
#include <wctype.h>
#include <locale.h>
#include <vector>

namespace msdfgen
{
	/*
	 * MULTI-CHANNEL SIGNED DISTANCE FIELD GENERATOR v1.4 (2017-02-09)
	 * ---------------------------------------------------------------
	 * A utility by Viktor Chlumsky, (c) 2014 - 2017
	 *
	 * The technique used to generate multi-channel distance fields in this code
	 * has been developed by Viktor Chlumsky in 2014 for his master's thesis,
	 * "Shape Decomposition for Multi-Channel Distance Fields". It provides improved
	 * quality of sharp corners in glyphs and other 2D shapes in comparison to monochrome
	 * distance fields. To reconstruct an image of the shape, apply the median of three
	 * operation on the triplet of sampled distance field values.
	 *
	 */
	
	#define MSDFGEN_USE_CPP11
	#define MSDFGEN_VERSION "1.4"

	#include "msdf/arithmetics.hpp"
	#include "msdf/Vector2.h"
	#include "msdf/Bitmap.h"
	#include "msdf/SignedDistance.h"
	#include "msdf/EdgeColor.h"
	#include "msdf/edge-segments.h"
	#include "msdf/EdgeHolder.h"
	#include "msdf/equation-solver.h"
	#include "msdf/Contour.h"
	#include "msdf/render-sdf.h"
	#include "msdf/save-bmp.h"
	#include "msdf/Shape.h"
	#include "msdf/shape-description.h"
	#include "msdf/msdfgen.h"
	#include "msdf/Bitmap.cpp"
	#include "msdf/Contour.cpp"
	#include "msdf/edge-coloring.cpp"
	#include "msdf/EdgeHolder.cpp"
	#include "msdf/edge-segments.cpp"
	#include "msdf/equation-solver.cpp"
	#include "msdf/render-sdf.cpp"
	#include "msdf/save-bmp.cpp"
	#include "msdf/Shape.cpp"
	#include "msdf/shape-description.cpp"
	#include "msdf/SignedDistance.cpp"
	#include "msdf/Vector2.cpp"
	#include "msdf/msdfgen.cpp"
	#include "msdf/font_utils.cpp"
}

#include "macros.cpp"
#include "primitive_types.cpp"
#include "vector_types.cpp"
#include "types.cpp"
#include "kerning.cpp"
#include "out_buffer.cpp"

#define LODEPNG_NO_COMPILE_CPP
#include "lodepng/lodepng.h"
#include "lodepng/lodepng.c"
