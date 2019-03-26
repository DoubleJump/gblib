function hex_to_rgb(hex, normalize) 
{
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if(!result) return null;

    var r = parseInt(result[1], 16);
    var g = parseInt(result[2], 16);
    var b = parseInt(result[3], 16);

    if(normalize)
    {
        r /= 255;
        g /= 255;
        b /= 255;
    }

    return [r,g,b,1];
}

function RGB_to_HSB(rgb, hsb)
{
    var r = rgb[0];
    var g = rgb[1];
    var b = rgb[2];

    var max = Math.max(Math.max(r,g),b);
    var min = Math.min(Math.min(r,g),b);

    var delta = max - min;

    if(delta !== 0.0)
    {
        var hue;
        if(r == max)
        {
            hue = (g - b) / delta;
        }
        else
        {
            if(g == max) hue = 2.0 + (b - r) / delta;
            else hue = 4.0 + (r - g) / delta;
        }
        hue *= 60.0;
        if (hue < 0) hue += 360.0;
        hsb[0] = hue;
    }
    else
    {
        hsb[0] = 0;
    }

    if(max === 0.0)
    {
        hsb[1] = 0.0;
    }
    else
    {
        hsb[1] = (max - min) / max;
    }
    hsb[2] = max;
}

function HSB_to_RGB(hsb, rgb)
{
    var h = hsb[0];
    var s = hsb[1];
    var v = hsb[2];

    var hh = h;
    if(hh > 360.0) hh = 0.0;
    if(hh === 360.0) hh = 359.9; //fix singularity
    hh /= 60.0;
    var i = Math.floor(hh);
    var ff = hh - i;
    var p = v * (1.0 - s);
    var q = v * (1.0 - (s * ff));
    var t = v * (1.0 - (s * (1.0 - ff)));

    switch(i) 
    {
        case 0:
        {
            rgb[0] = v;
            rgb[1] = t;
            rgb[2] = p;
            break;
        }
        case 1:
        {
            rgb[0] = q;
            rgb[1] = v;
            rgb[2] = p;
            break;
        }
        case 2:
        {
            rgb[0] = p;
            rgb[1] = v;
            rgb[2] = t;
            break;
        }
        case 3:
        {
            rgb[0] = p;
            rgb[1] = q;
            rgb[2] = v;
            break;
        }
        case 4:
        {
            rgb[0] = t;
            rgb[1] = p;
            rgb[2] = v;
            break;
        }
        default:
            rgb[0] = v;
            rgb[1] = p;
            rgb[2] = q;
            break;
    }
}

function datGUI_to_webgl_color(c)
{
    var r = _Vec3();
    vec_div_f(r, c, 255);
    return r;
}