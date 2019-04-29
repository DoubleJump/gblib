struct FtContext 
{
    Point2 position;
    Shape *shape;
    Contour *contour;
};


static Point2 
ftPoint2(const FT_Vector& vector) 
{
    return Point2(vector.x / 64.0, vector.y / 64.0);
}

static int 
ftMoveTo(const FT_Vector *to, void *user) 
{
    FtContext *context = reinterpret_cast<FtContext *>(user);
    context->contour = &context->shape->addContour();
    context->position = ftPoint2(*to);
    return 0;
}

static int 
ftLineTo(const FT_Vector *to, void *user) 
{
    FtContext *context = reinterpret_cast<FtContext *>(user);
    context->contour->addEdge(new LinearSegment(context->position, ftPoint2(*to)));
    context->position = ftPoint2(*to);
    return 0;
}

static int 
ftConicTo(const FT_Vector *control, const FT_Vector *to, void *user) 
{
    FtContext *context = reinterpret_cast<FtContext *>(user);
    context->contour->addEdge(new QuadraticSegment(context->position, ftPoint2(*control), ftPoint2(*to)));
    context->position = ftPoint2(*to);
    return 0;
}

static int 
ftCubicTo(const FT_Vector* control1, const FT_Vector* control2, const FT_Vector *to, void *user) 
{
    FtContext *context = reinterpret_cast<FtContext *>(user);
    context->contour->addEdge(new CubicSegment(context->position, ftPoint2(*control1), ftPoint2(*control2), ftPoint2(*to)));
    context->position = ftPoint2(*to);
    return 0;
}

static double 
get_font_scale(FT_Face face) 
{
    return face->units_per_EM / 64.0;
}

struct Whitespace_Width
{
	double space_advance;
	double tab_advance;
};

static Whitespace_Width
get_font_whitespace_width(FT_Face face) 
{
	Whitespace_Width result;
    FT_Load_Char(face, ' ', FT_LOAD_NO_SCALE);
    result.space_advance = face->glyph->advance.x / 64.0;
    FT_Load_Char(face, '\t', FT_LOAD_NO_SCALE);
    result.tab_advance = face->glyph->advance.x / 64.0;
    return result;
}

static double 
get_kerning(FT_Face face, int a, int b) 
{
    FT_Vector kerning;
    auto index_a = FT_Get_Char_Index(face, a);
    auto index_b = FT_Get_Char_Index(face, b);
    if(FT_Get_Kerning(face, index_a, index_b, FT_KERNING_UNSCALED, &kerning)) 
    {
        return 0;
    }
    return kerning.x / 64.0;
}


static void 
load_glyph(Shape* output, FT_Face face, int unicode) 
{
    FT_Load_Char(face, unicode, FT_LOAD_NO_SCALE);
    output->contours.clear();
    output->inverseYAxis = false;
    //if(advance) *advance = face->glyph->advance.x / 64.0;

    FtContext context = { };
    context.shape = output;
    FT_Outline_Funcs ftFunctions;
    ftFunctions.move_to = &ftMoveTo;
    ftFunctions.line_to = &ftLineTo;
    ftFunctions.conic_to = &ftConicTo;
    ftFunctions.cubic_to = &ftCubicTo;
    ftFunctions.shift = 0;
    ftFunctions.delta = 0;
    FT_Outline_Decompose(&face->glyph->outline, &ftFunctions, &context);
}