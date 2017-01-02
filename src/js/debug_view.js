function DebugView(GL, view, buffer_size)
{
    var v = {};
    v.groups = [];
    v.matrix = Mat4();

    v.camera = Camera(0,10,60,view, true);
    LOG(view[2]);
    set_vec3(v.camera.entity.position, view[2] / 2, view[3] / 2,0);
    update_camera(v.camera);

    v.text = TextMesh(assets.fonts.source_code_pro, assets.textures.source_code_pro, 6000);
    v.text.size = 0.5;
    v.text.buffer = -0.5;
    v.text.gamma = 0.47;
    v.text.theta = 0.47;
    //v.text.theta = 0.47;

    bind_mesh(GL, v.text.mesh);
    set_text(v.text, 'label');
    update_mesh(GL, v.text.mesh);

    v.background = Vec4(0.1,0.1,0.1,1.0);
    v.white = Vec4(1,1,1,1);
    v.text_color = Vec4(0.9,0.9,0.9,1);
    v.highlight = Vec4(0.3,0.6,0.9,1.0);
    v.inactive_grey = Vec4(0.3,0.3,0.3,1.0);
    v.active_grey = Vec4(0.5,0.5,0.5,1.0);

    var attributes = 
    {
        position: VertexAttribute(3),
        color: VertexAttribute(4, true)
    };

    var vb = VertexBuffer(null, attributes, BufferUpdateRate.DYNAMIC);
    alloc_vertex_buffer_memory(vb, buffer_size);

    var ib = IndexBuffer(new Uint32Array(buffer_size), BufferUpdateRate.DYNAMIC);
    v.quads = Mesh(vb, ib);
    bind_mesh(GL, v.quads, MeshLayout.TRIANGLES);

    v.x = 0; 
    v.y = 0;
    v.width = 200;
    //v.height = h;
    return v;
}
 
function DebugGroup(view, x,y)
{
    var g = 
    {
        x: x,
        y: y,
        px: 0,
        py: 0,
        visible: true,
        is_dragging: false
    };
    view.groups.push(g);
    return g;
}
 
function update_debug_view(view, screen, input)
{
    var ctx = view.ctx;
 
    view.mx = input.mouse.position[0];
    view.my = app.view[3] - input.mouse.position[1];
    view.mdx = input.mouse.delta[0];
    view.mdy = input.mouse.delta[1];
    view.m_down = key_down(Keys.MOUSE_LEFT);
    view.m_held = key_held(Keys.MOUSE_LEFT);
    view.m_released = key_released(Keys.MOUSE_LEFT);
 
 
    // Group dragging
    var n = view.groups.length;
    for(var i = 0; i < n; ++i)
    {
        var group = view.groups[i];
     
        
        var hover = point_in_rect_fast(view.mx, view.my, group.x, group.y,view.width,20);
         
        if(group.is_dragging === true)
        {
            if(view.m_released) group.is_dragging = false;
            else
            {
                group.x += view.mdx;
                group.y -= view.mdy;
                if(group.x < 0) group.x = 0;
                if(group.x > (screen[2] - view.width)) group.x = (screen[2] - view.width);

                if(group.y > screen[3]) group.y = screen[3];
                if(group.y < -20) group.y = -20;
            }
        }
        else
        {
            if(hover && view.m_down) group.is_dragging = true;
        }
 
        debug_rect(view, group.x, group.y, view.width,20, view.background);
 
        //var bar_color = view.inactive_grey;
        //if(hover) bar_color = view.active_grey;
        //LERPY.canvas_rect(group.x + 50, group.y + 5, 50, 2, bar_color);
         
        group.px = group.x;
        group.py = group.y - 20;
    }
}

function render_debug_view(GL, view)
{
    disable_depth_testing(GL);
    disable_backface_culling(GL);

    var shader = assets.shaders.basic;
    var mesh = view.quads;

    update_mesh(GL, mesh);
    use_shader(GL, shader);
    set_uniform(GL, shader.uniforms.mvp, view.camera.view_projection);
    draw_mesh(GL, shader, mesh);

    shader = assets.shaders.text;
    mesh = view.text.mesh;

    update_mesh(GL, mesh);
    use_shader(GL, shader);
    set_uniform(GL, shader.uniforms.mvp, view.camera.view_projection);

    set_uniform(GL, shader.uniforms.buffer, view.text.buffer);
    set_uniform(GL, shader.uniforms.gamma, view.text.gamma);
    set_uniform(GL, shader.uniforms.theta, view.text.theta);

    set_uniform(GL, shader.uniforms.depth, 0.0);
    set_uniform(GL, shader.uniforms.color, view.text_color);
    set_uniform(GL, shader.uniforms.texture, view.text.atlas);
    draw_mesh(GL, shader, mesh);

    //reset
    clear_mesh_buffers(view.quads);
    reset_text(view.text);
}

function debug_rect(view, x,y,w,h, c)
{
    var r = _Vec4(x,y,w,h);
    gl_push_rect(r, 0, view.quads, c, view.matrix);
    vec4_stack.index--;
}
function debug_line(view, ax,ay,bx,by, thickness, c)
{
    var start = _Vec3(ax,ay);
    var end = _Vec3(bx,by);

    gl_push_line_segment(start,end,thickness,0, view.quads, c, view.matrix);
    vec3_stack.index -= 2;
}

function debug_text(view, x,y,c, str)
{
    view.text.px = x;
    view.text.py = y;
    append_text(view.text, str);
}

function debug_label(view, str, group, px,py)
{
    var x = px;
    var y = py;
    var w = view.width;
    var h = 30;

    if(group)
    {
        x = group.px;
        y = group.py;
        group.py -= h+1;
    }

    //draw bg
    debug_rect(view, x,y,w,h, view.background);
    debug_text(view, x+5,y-20, view.text_color, str);
}

 
function print_val(view, name, val, group, x,y)
{
    var str = name + ': ' + round_to(val, 2);
    debug_label(view, str, group, x,y);
}
function print_vec(view, name, val, group, x,y)
{
    var str = name + ': ' + vec_to_string(val, 2);
    debug_label(view, str, group, x,y);
}

function debug_slider(view, name, value, min, max, group, px,py)
{
    var x = px;
    var y = py;
    var w = view.width;

    if(group)
    {
        x = group.px;
        y = group.py;
        group.py -= 56;
    }
 
    var range = max-min;
    var result = clamp(value, min, max);
    var dx = result - min;
    var val_percent =  dx / range;

    //draw bg
    debug_rect(view, x,y,w,55, view.background);

    //draw value
    var str = name + ': ' + round_to(result, 2);
    debug_text(view, x+5,y-20, view.text_color, str);
    
    x += 5;
    y -= 30;
    w -= 10;

    //check mouse
    var hover = point_in_rect_fast(view.mx, view.my, x,y,w,20);
    if(hover && view.m_held)
    {
        dx = view.mx - x;
        val_percent = dx / (w-5);
    }
    val_percent = clamp(val_percent, 0.0, 1.0);

    // draw slide bar
    if(hover === true) debug_rect(view, x,y,w,20, view.active_grey);
    else debug_rect(view, x,y,w,20, view.inactive_grey);
 
    //draw fill bar
    debug_rect(view, x,y, w * val_percent, 20, view.highlight);
 
    return min + (range * val_percent);
}
 
function debug_slider_infinite(view, name, val, rate, group, px,py)
{
    var x = px;
    var y = py;
    var w = view.width;
    var h = 40;

    if(group)
    {
        x = group.px;
        y = group.py;
        group.py -= 55;
    }

    //draw bg
    debug_rect(view, x,y,w,55, view.background);
 
    //draw value
    var str = name + ': ' + round_to(val, 2);
    debug_text(view, x+5,y-20, view.text_color, str);

    x += 5;
    y -= 30;
    w -= 10;
 
    //check mouse
    var hover = point_in_rect_fast(view.mx, view.my, x,y,w,20);
    if(hover && view.m_held)
    {
        val += view.mdx * rate;
        debug_rect(view, view.width/2, y-10, view.mx - (view.width/2), 1, view.highlight, 1);
    }
     
    return val;
}

 
function debug_boolean(view, name, val, group, px,py)
{
    var x = px;
    var y = py;
    var w = view.width;
    var h = 30;

    if(group)
    {
        x = group.px;
        y = group.py;
        group.py -= h+1;
    }

    //draw bg
    debug_rect(view, x,y,w,h, view.background);
 
    debug_text(view, x+5,y-20, view.text_color, name);
    
    x = x + (w - 20);
    y -= 8;

    //check hover
    var hover = point_in_rect_fast(view.mx, view.my, x,y,15,15);

    //draw checkbox
    if(hover) debug_rect(view, x,y,15,15, view.active_grey);
    else debug_rect(view, x,y,15,15, view.inactive_grey);
 
    if(val === true) debug_rect(view, x+5,y-5,5,5, view.highlight);
 
    if(hover && view.m_down) val = !val;
    return val
}

function debug_button(view, label, x,y,w,h)
{
    var result = false;
    var hover = point_in_rect_fast(view.mx, view.my, x,y,w,h);
    if(hover === true)
    {
        debug_rect(view, x,y,w,h, view.active_grey);
        if(view.m_down === true) result = true;
    }
    else
    {
        debug_rect(view, x,y,w,h, view.inactive_grey);
    }
    //var width = LERPY.canvas_text_width(view.ctx, label);
    //LERPY.canvas_text(view.ctx, label, x + (w / 2)-(width/2), y+15, view.text_color);
    return result;
}
 

function debug_curve(view, name, curve, group, px,py)
{
    var x = px;
    var y = py;
    var w = view.width;
    var h = 30;

    if(group)
    {
        x = group.px;
        y = group.py;
        group.py -= (w + 25);
    }

    // draw bg
    debug_rect(view, x,y,w,w+20, view.background);

    debug_text(view, x+5,y-20, view.text_color, name);
    y -= 25;
 
    x += 5;
    debug_rect(view, x,y,w-10,w-10, view.inactive_grey);
 
    //var hover = point_in_rect_fast(view.mx, view.my, x,y,145,140);
 
    //draw quarters
    debug_line(view, x,y-((w/2)-10), x+(w-10), y-((w/2)-10), 0.5, view.active_grey);
    debug_line(view, x+((w/2)-5), y, x+((w/2)-5), y-(w-10), 0.5, view.active_grey);
    x+=5;
 
    /*
    // scale curve by our display range
    var n = curve.length / 2;
    var index = 0;
    for(var i = 0; i < n; ++i)
    {
        view.f_buff[index]   = (curve[index] * 140) + x; 
        view.f_buff[index+1] = ((1.0 - curve[index+1]) * 140) + y;
        index += 2;
    }
 
    //check each handle for mouse hover
    var n_segments = (curve.length / 3) - 3; //TODO: check this
    index = 0;
    for(var i = 0; i < n_segments; ++i)
    {
        var over_handle = LERPY.point_in_circle_f(view.mx, view.my, view.f_buff[index + 4], view.f_buff[index + 5], 24);
        if(over_handle === true)
        {
            LERPY.canvas_circle(view.ctx, view.f_buff[index + 4],view.f_buff[index + 5],5, view.white);
 
            if(LERPY.key_held(LERPY.Keys.MOUSE_LEFT))
            {
                view.f_buff[index + 4] += view.mdx;
                view.f_buff[index + 5] += view.mdy;
            }
        }
        else
        {
            over_handle = LERPY.point_in_circle_f(view.mx, view.my, view.f_buff[index + 6], view.f_buff[index + 7], 24);
            if(over_handle === true)
            {
                LERPY.canvas_circle(view.f_buff[index + 6],view.f_buff[index + 7], 5, view.white);
 
                if(LERPY.key_held(LERPY.Keys.MOUSE_LEFT))
                {
                    view.f_buff[index + 6] += view.mdx;
                    view.f_buff[index + 7] += view.mdy;
                }
            }
        }
 
        index += 10;
    }
     
    //TODO: move this into loop above
    //draw handle lines
    LERPY.canvas_line(view.ctx, view.f_buff[2], view.f_buff[3], view.f_buff[4], view.f_buff[5], '#484848', 1);
    LERPY.canvas_line(view.ctx, view.f_buff[6], view.f_buff[7], view.f_buff[8], view.f_buff[9], '#484848', 1);
 
    //draw curve
    LERPY.canvas_curve(view.ctx, view.f_buff, view.white, 1);
 
    // draw handles
    LERPY.canvas_circle(view.ctx, view.f_buff[4], view.f_buff[5], 3, view.highlight);
    LERPY.canvas_circle(view.ctx, view.f_buff[6], view.f_buff[7], 3, view.highlight);
 
 
    // reverse data back into array
    index = 0;
    for(var i = 0; i < n; ++i)
    {
        curve[index  ] = (view.f_buff[index]-x) / 140; 
        curve[index+1] = 1.0 - ((view.f_buff[index+1]-y) / 140);
        index += 2;
    }
    */
}
  
/*
LERPY.create_picker_gradient(view, hue)
{
    LERPY.vec3_set(view.f_buff, hue,1,1);
    LERPY.HSB_to_RGB(view.f_buff, view.f_buff);
 
    var grad = view.ctx.createLinearGradient(0,0,125,0);
    grad.addColorStop(0, 'rgb(255,255,255)');
    grad.addColorStop(1, color_to_rgb_string(view.f_buff));
    return grad;
}
LERPY.create_alpha_gradient(view, c)
{
    var r = (255 * c[0])|0;
    var g = (255 * c[1])|0;
    var b = (255 * c[2])|0;
 
    var grad = view.ctx.createLinearGradient(0,0,125,0);
    grad.addColorStop(0, 'rgba('+ r + ',' + g + ',' + b +',' + 0.0 +')');
    grad.addColorStop(1, 'rgba('+ r + ',' + g + ',' + b +',' + 1.0 +')');
    return grad;
}
  
 
LERPY.control_color(view, name, c, group, px,py)
{
    var st = c.debug_state;
    if(st === undefined)
    {
        st = {};
        st.picking = false,
        st.col_string = LERPY.color_to_rgba_string(c),
        st.display_string = LERPY.vec_to_string(c),
        st.color_gradient = LERPY.create_picker_gradient(c);
        st.alpha_gradient = LERPY.create_alpha_gradient(c);
        st.undo = new Float32Array(4);
        st.undo_string = LERPY.color_to_rgba_string(c);
        LERPY.vec_eq(st.undo, c);
        c.debug_state = st;
    }
 
    var x = px;
    var y = py;
    if(group)
    {
        x = group.px;
        y = group.py;
    }
    var tx = x;
    var ty = y;
 
 
    LERPY.draw_label(view, name, null, x,y,150,20);
    y += 20;
 
    LERPY.canvas_rect(view.ctx, x,y, 150,20, view.background);
    y += 20;
 
    if(st.picking === true)
    {
        var hover = false;
 
        LERPY.RGB_to_HSB(c, view.f_buff);
        var hue = view.f_buff[0];
        var saturation = view.f_buff[1];
        var brightness = view.f_buff[2];
        var alpha = c[3];
 
        // bg
        LERPY.canvas_rect(view.ctx, x,y, 150,175, view.black);
        x+=5;
 
        //SATURATION & BRIGHTNESS
        LERPY.canvas_gradient_rect(view.ctx, x,y, 125,125, st.color_gradient);
        LERPY.canvas_gradient_rect(view.ctx, x,y, 125,125, view.greyscale_gradient);
        hover = LERPY.point_in_rect_wh(view.mx, view.my, x,y,125,125);
        if(hover && view.m_held)
        {
            saturation = Math.clamp((view.mx - x) / 125, 0,1);
            brightness = Math.clamp(1.0 - ((view.my - y) / 125), 0,1);
            st.update_color = true;
        }
        //cursor
        LERPY.canvas_wire_rect(view.ctx, x + (saturation * 125) -1, y + ((1.0 - brightness) * 125) - 1, 3,3,1,view.white);
 
        // HUE
         
        x += 130;
        LERPY.canvas_gradient_rect(view.ctxm x,y,10,125, view.color_gradient);
        hover = LERPY.point_in_rect_wh(view.mx, view.my, x,y,10,125);
        if(hover && view.m_held)
        {
            var dy = 125.0 - Math.clamp(view.my - y, 0.0, 125.0);
            hue = (dy/125.0) * 360.0;
            st.update_hue = true;
            st.update_color = true;
        }
        var hue_pos = 1.0 - (hue / 360.0);
        LERPY.canvas_rect(view.ctx, x, y + (hue_pos * 125), 10,1, view.black);
 
        // ALPHA
        x-= 130;
        y+= 130;
         
        LERPY.canvas_gradient_rect(view.ctx, x,y,125,10, view.alpha_pattern);
        LERPY.canvas_gradient_rect(view.ctx, x,y,125,10, st.alpha_gradient);
        hover = LERPY.point_in_rect_wh(view.mx, view.my, x,y,125,10);
        if(hover && view.m_held)
        {
            alpha = (view.mx-x) / 125;
            st.update_color = true;
        }
        // alpha cursor
        LERPY.canvas_rect(view.ctx, x + (c[3] * 125), y,1,10, view.white);
 
        //buttons
        y += 15;
        var ok = LERPY.control_button(view, 'ok', x,y,68,25);
        var cancel = LERPY.control_button(view, 'cancel', x+73, y, 68,25);
 
        if(ok === true)
        {
            LERPY.vec_eq(st.undo, c);
            st.undo_string = LERPY.color_to_rgba_string(st.undo);
            st.picking = false;
        }
        if(cancel === true)
        {
            LERPY.RGB_to_HSB(st.undo, view.f_buff);
            hue = view.f_buff[0];
            saturation = view.f_buff[1];
            brightness = view.f_buff[2];
            alpha = st.undo[3];
 
            st.update_color = true;
            st.picking = false;
        }
        if(st.update_color === true)
        {
            LERPY.vec3_set(view.f_buff, hue, saturation, brightness);
            LERPY.HSB_to_RGB(view.f_buff, c);
            c[3] = alpha;
 
            st.col_string = LERPY.color_to_rgba_string(c);
            st.display_string = LERPY.vec_to_string(c);
            if(st.update_hue)
            {
                st.color_gradient = LERPY.create_picker_gradient(view, hue);
                st.update_hue = false;
            }
            st.alpha_gradient = LERPY.create_alpha_gradient(view, c);
 
            st.update_color = false;
        }
         
        x = tx+60;
        y = ty+25;
        LERPY.canvas_rect(view.ctx, x,y,50,10, st.undo_string);
 
        if(group) group.py += 215;
    }
    else
    {
        x = tx+5;
        y = ty+25;
        var hover = LERPY.point_in_rect_wh(view.mx, view.my, x,y,50,15);
        if(hover && view.m_down)
        {
            st.picking = true;
            st.update_hue = true;
            st.update_color = true;
        }
        if(group) group.py += 40;
    }
 
    x = tx+5;
    y = ty+25;
    LERPY.canvas_rect(view.ctx, x,y, 50,10, view.alpha_pattern);
    LERPY.canvas_rect(view.ctx, x,y, 50,10, st.col_string);
}
 
LERPY.control_time_line(time)
{
    var x = 0;
    var y = view.height-25;
 
    //draw lhs
    LERPY.canvas_rect(view.ctx, x,y,50,25, view.background);
 
    //draw rhs
    LERPY.canvas_rect(view.ctx, 50, y, view.width-50,25, '#222222');
     
    var range = time.end - time.start;
    var step = range / (view.width-50); 
    var cx = ((time.current - time.start) / step) + 50; 
 
    //draw second divisors
    var num_seconds = range | 0;
    for(var i = 1; i < num_seconds; ++i)
    {
        LERPY.canvas_rect(view.ctx, 50 + (i / step), y + 4, 1,17, view.inactive_grey);
    }
 
    //draw time cursor
    LERPY.canvas_rect(view.ctx, cx,y, 1,25, view.highlight);
 
    var last = time.current;
    var hover = LERPY.point_in_rect_f(view.ctx, view.mx, view.my, 45, y, view.width, view.height);
    if(hover === true)
    {
        if(view.m_held)
        {
            var dx = view.mx - 50;
            time.current = time.start + (dx * step); 
        }
    }
 
    time.current = Math.clamp(time.current, time.start, time.end);
    time.dt = time.current - last;
 
    LERPY.canvas_text(view.ctx, Math.round_to(time.current, 2), 5, y + 15, view.white);
}
*/