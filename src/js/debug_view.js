function DebugView(view, buffer_size)
{
    var r = {};
    r.groups = [];
    r.color;
    r.matrix = Mat4();
    r.padding = 5;
    r.x = 0; 
    r.y = 0;
    r.width = 280;

    r.text_style = TextStyle(app.assets.fonts.space_mono);
    r.text = TextMesh(r.text_style, "test", 2048);
    r.text_style.size = 0.6;

    r.background = Vec4(0.1,0.1,0.1,0.8);
    r.white = Vec4(1,1,1,1);
    r.text_color = Vec4(0.5,0.5,0.5,1);
    r.highlight = Vec4(0.3,0.6,0.9,1.0);
    r.inactive_grey = Vec4(0.2,0.2,0.2,0.8);
    r.active_grey = Vec4(0.25,0.25,0.25,1.0);

    var update_rate = BufferUpdateRate.DYNAMIC;

    // LINES

    r.line_shader = app.assets.shaders.basic;
    var line_attributes = 
    {
        position: PositionAttribute(),
        color: ColorAttribute()
    };

    var vb = VertexBuffer(null, line_attributes, update_rate);
    alloc_vertex_buffer_memory(vb, buffer_size);
    r.lines = Mesh(vb, null, MeshLayout.LINES);
    bind_mesh(r.lines);

    // TRIANGLES

    r.tri_shader = app.assets.shaders.basic;

    var tri_attributes = 
    {
        position: PositionAttribute(),
        uv: UVAttribute(),
        radius: VertexAttribute(1),
        color: ColorAttribute()
    };

    var vb = VertexBuffer(null, tri_attributes, update_rate);
    alloc_vertex_buffer_memory(vb, buffer_size);

    var ib = IndexBuffer(new Uint32Array(buffer_size), update_rate);
    r.triangles = Mesh(vb, ib, MeshLayout.TRIANGLES);
    bind_mesh(r.triangles);
    
    return r;
}
 
function DebugGroup(ctx, name, x,y)
{
    var g = {};
    g.name = name;
    g.x = x;
    g.y = y;
    g.px = 0;
    g.py = 0;
    g.visible = true;
    g.is_dragging = false;
    g.controls = [];
    ctx.groups.push(g);
    return g;
}

function UI_Label(name, value, group)
{
    var r = {};
    r.type = 0;
    r.name = name;
    r.value = value;
    r.height = 30;
    if(group) group.controls.push(r);
    return r;
}

function UI_Toggle(name, value, group)
{
    var r = {};
    r.type = 2;
    r.name = name;
    r.value = value;
    r.height = 30;
    if(group) group.controls.push(r);
    return r;
}

function UI_Slider_Control(min, max, value)
{
    var r = {};
    r.min = min;
    r.max = max;
    r.value = value || min;
    r.dragging = false;
    return r;
}

function UI_Slider(name, min, max, value, group)
{
    var r = {};
    r.type = 1;
    r.height = 0;
    r.name = name;
    r.sliders = [];

    if(value.length)
    {
        for(var i = 0; i < value.length; ++i)
        {
            r.sliders.push(UI_Slider_Control(min, max, value[i]));
        }
        r.value = new Float32Array(value.length);
    }
    else
    {
        r.sliders.push(UI_Slider_Control(min, max, value));
        r.value = value;
    }

    if(group) group.controls.push(r);

    return r;
}

function UI_Curve(name, value, group)
{
    var r = {};
    r.name = name;
    r.type = 3;
    r.value = value;
    r.height = 160;
    r.handle_a = Vec3(0,0,0);
    r.handle_b = Vec3(0,0,0);
    r.dragging_a = false;
    r.dragging_b = false;
    if(group) group.controls.push(r);
    return r;
}

function update_debug_view(ctx)
{
    ctx.mx = input.mouse.position[0];
    ctx.my = -input.mouse.position[1];
    ctx.mdx = input.mouse.delta[0];
    ctx.mdy = input.mouse.delta[1];
    ctx.m_down = key_down(Keys.MOUSE_LEFT);
    ctx.m_held = key_held(Keys.MOUSE_LEFT);
    ctx.m_released = key_released(Keys.MOUSE_LEFT);
 }

function render_debug_view(ctx, camera)
{
    var n = ctx.groups.length;
    for(var i = 0; i < n; ++i)
    {
        draw_ui_group(ctx, ctx.groups[i]);
    }

    disable_depth_testing();

    use_shader(app.assets.shaders.rect);
    set_uniform('mvp', camera.view_projection);
    update_mesh(ctx.triangles);
    draw_mesh(ctx.triangles);

    use_shader(app.assets.shaders.basic);
    set_uniform('mvp', camera.view_projection);
    update_mesh(ctx.lines);
    draw_mesh(ctx.lines);

    update_mesh(ctx.text.mesh);
    draw_text(ctx.text, app.assets.shaders.text, camera)

    //reset
    clear_mesh_buffers(ctx.triangles);
    clear_mesh_buffers(ctx.lines);
    reset_text(ctx.text);
}

function draw_ui_group(ctx, group)
{
    var hover = point_in_rect_fast(ctx.mx, ctx.my, group.x, group.y,ctx.width,20);

    // TODO: hide button
         
    if(group.is_dragging === true)
    {
        if(ctx.m_released) group.is_dragging = false;
        else
        {
            var screen = app.view;
            group.x += ctx.mdx;
            group.y -= ctx.mdy;

            if(group.x < screen[0]) group.x = screen[0];
            if(group.x > (screen[2] - ctx.width)) group.x = (screen[2] - ctx.width);
            if(group.y < -screen[3]) group.y = -screen[3];
            if(group.y > 0) group.y = 0;
        }
    }
    else
    {
        if(hover && ctx.m_down) group.is_dragging = true;
    }

    if(hover || group.is_dragging) ctx.color = ctx.inactive_grey;
    else ctx.color = ctx.background;
    draw_quad_f(ctx, group.x, group.y, ctx.width,20, 0);

    group.px = group.x;
    group.py = group.y - 20;

    var n = group.controls.length;
    for(var i = 0; i < n; ++i)  
    {
        var control = group.controls[i];
        switch(control.type)
        {
            case 0:
            {
                draw_ui_label(ctx, control, group.px, group.py);
                group.py -= control.height;
                break;
            }
            case 1:
            {
                draw_ui_slider(ctx, control, group.px, group.py);
                group.py -= control.height;
                break;
            }
            case 2:
            {
                draw_ui_toggle(ctx, control, group.px, group.py);
                group.py -= control.height;
                break;
            }
            case 3:
            {
                draw_ui_curve(ctx, control, group.px, group.py);
                group.py -= control.height;
                break;
            }
        }
    }
}

function draw_ui_label(ctx, control, px,py)
{
    var x = px;
    var y = py;
    var w = ctx.width;
    var h = control.height;

    ctx.color = ctx.background;
    draw_quad_f(ctx, x,y,w,h, 0);

    // TODO: format string here?
    ctx.color = ctx.text_color;
    draw_text_f(ctx, x+5,y-20, control.name + ': ' + control.value.toString());
}

function draw_ui_slider(ctx, control, px,py)
{
    control.height = 0;

    ctx.color = ctx.background;
    draw_quad_f(ctx, px, py, ctx.width, 30, 0);

    ctx.color = ctx.text_color;
    draw_text_f(ctx, px + ctx.padding, py-25, control.name);
    control.height += 30;

    var y = py - 30;
    if(control.value.length)
    {
        for(var i = 0; i < control.value.length; ++i)
        {
            var val = draw_slider_control(ctx, control.sliders[i], px,y);
            control.value[i] = val;

            y -= 30;
            control.height += 30;
        }
    }
    else 
    {
        draw_slider_control(ctx, control.sliders[0], px,y);
        control.value = control.sliders[0].value;
        control.height += 30;
    }
}

function draw_slider_control(view, slider, px,py)
{
    var x = px;
    var y = py;
    var pad = view.padding;
    var container_w = view.width;
    var text_width = 50;
    var bar_h = 20;
    var bar_w = 200;
    var container_h = bar_h + (pad * 2);
    var range = slider.max - slider.min;

    //draw bg
    view.color = view.background;
    draw_quad_f(view, x,y,container_w,container_h, 0);
 
    x += pad;
    y -= pad;

    //check mouse
    var hover = point_in_rect_fast(view.mx, view.my, x,y,bar_w,bar_h); 
    if(hover && view.m_down) slider.dragging = true;
    else if(view.m_released) slider.dragging = false;

    //draw value bar background
    if(slider.dragging || hover) 
    {
        view.color = view.active_grey;
        draw_quad_f(view, x,y,bar_w,bar_h, 0);
    }
    else 
    {
        view.color = view.inactive_grey;
        draw_quad_f(view, x,y,bar_w,bar_h, 0);
    }

    if(slider.dragging)
    {
        var dx = view.mx - x;
        var percent = clamp(dx / bar_w, 0,1);
        slider.value = slider.min + (range * percent);
    }

    // draw value bar
    var percent = (slider.value - slider.min) / range;
    view.color = view.highlight;
    draw_quad_f(view, x,y, bar_w * percent, bar_h, 0);

    // draw value string
    x = px + bar_w + (pad * 3);
    y = py;
    var val_str = round_to(slider.value, 2).toString();

    view.color = view.text_color;
    draw_text_f(view, x, y-25, val_str);
}
  
function draw_ui_toggle(ctx, control, px,py)
{
    var x = px;
    var y = py;
    var w = ctx.width;
    var h = control.height;
    var pad = ctx.padding;

    //draw bg
    ctx.color = ctx.background;
    draw_quad_f(ctx, x,y,w,h, 0);
 
    ctx.color = ctx.text_color;
    draw_text_f(ctx, x+pad,y-20, control.name);
    
    x = (px + ctx.text.width);
    y -= 8;

    //check hover
    var hover = point_in_rect_fast(ctx.mx, ctx.my, x,y,15,15);

    //draw checkbox
    if(hover) ctx.color = ctx.active_grey;
    else ctx.color = ctx.inactive_grey;
    draw_quad_f(ctx, x,y,15,15,0);
 
    if(control.value === true) 
    {
        ctx.color = ctx.highlight;
        draw_quad_f(ctx, x+5,y-5,5,5,0);
    }
    if(hover && ctx.m_down) control.value = !control.value;
}

function draw_ui_curve(ctx, control, px, py)
{
    var x = px;
    var y = py;
    var w = ctx.width;
    var h = control.height;
    var pad = ctx.padding;
    var v3 = vec3_stack.index;

    //draw bg
    ctx.color = ctx.background;
    draw_quad_f(ctx, x,y,w,h, 0);

    h-= pad;
 
    ctx.color = ctx.text_color;
    draw_text_f(ctx, x+pad,y-20, control.name);

    // draw curve box
    w -= pad * 2;
    y -= 30;
    h -= 30;
    x += pad;

    ctx.color = ctx.inactive_grey;
    draw_quad_f(ctx, x,y,w,h, 0);
    
    var curve = control.value.data;

    control.handle_a[0] = x + (curve[4] * w);
    control.handle_a[1] = y - ((1.0 - curve[5]) * h);
    control.handle_b[0] = x + (curve[6] * w);
    control.handle_b[1] = y - ((1.0-curve[7]) * h);

    if(ctx.m_released)
    {
        control.dragging_a = false;
        control.dragging_b = false;
    }

    var hover = point_in_rect_fast(ctx.mx, ctx.my, control.handle_a[0] - 5,control.handle_a[1] + 5,10,10);

    if(hover && ctx.m_down) control.dragging_a = true;

    if(control.dragging_a)
    {
        control.handle_a[0] += ctx.mdx;
        control.handle_a[1] -= ctx.mdy;
    }

    control.handle_a[0] = clamp(control.handle_a[0], x-5, x+(w-5));
    control.handle_a[1] = clamp(control.handle_a[1], (y-h)+5, y+5);

    curve[4] = (control.handle_a[0] - x) / w;
    curve[5] = 1.0 - ((y - control.handle_a[1]) / h);


    if(hover || control.dragging_a) ctx.color = ctx.white;
    else ctx.color = ctx.highlight;
    draw_quad_f(ctx, control.handle_a[0],control.handle_a[1],10,10, 0.5);

    ctx.color = ctx.highlight;
    draw_line(ctx, _Vec3(x, y-h, 0), _Vec3(control.handle_a[0] + 5, control.handle_a[1] - 5, 0));

    hover = point_in_rect_fast(ctx.mx, ctx.my, control.handle_b[0] - 5,control.handle_b[1] + 5,10,10);

    if(hover && ctx.m_down) control.dragging_b = true;

    if(control.dragging_b)
    {
        control.handle_b[0] += ctx.mdx;
        control.handle_b[1] -= ctx.mdy;
    }

    control.handle_b[0] = clamp(control.handle_b[0], x-5, x+(w-5));
    control.handle_b[1] = clamp(control.handle_b[1], (y-h)+5, y+5);

    curve[6] = (control.handle_b[0] - x) / w;
    curve[7] = 1.0 - ((y - control.handle_b[1]) / h);

    if(hover || control.dragging_b) ctx.color = ctx.white;
    else ctx.color = ctx.highlight;
    draw_quad_f(ctx, control.handle_b[0],control.handle_b[1],10,10, 0.5);

    ctx.color = ctx.highlight;
    draw_line(ctx, _Vec3(x+w, y, 0), _Vec3(control.handle_b[0] + 5, control.handle_b[1] - 5, 0));

    ctx.color = ctx.white;

    var STEPS = 20;
    var step = 1 / STEPS;
    var t = step;

    var a = _Vec3(0,0,0);
    var b = _Vec3(1,1,0);

    eval_curve(a, control.value, t, 0);
    a[0] = x + (w * a[0]);
    a[1] = y - (h * (1.0 - a[1]));
    a[2] = 0;
    
    for(var i = 1; i < STEPS+1; ++i)
    {
        eval_curve(b, control.value, t, 2);

        b[0] = x + (w * b[0]);
        b[1] = y - (h * (1.0 - b[1]));
        b[2] = 0;
        t += step;

        draw_line(ctx, a,b);
        vec_eq(a,b);
    }

    vec3_stack.index = v3;
}