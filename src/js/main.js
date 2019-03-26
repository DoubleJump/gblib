var app = {};

var AppState =
{
    DEBUG: -1,
    INIT: 0,
    LOADING: 1,
    INTRO: 2,
    RUNNING: 3,
};

function app_start(lang, gl_info)
{
    console.log('app start')

    app.gl_info = gl_info;
    app.has_focus = true;
    app.resize = false;
    app.do_resize = false;
    app.auto_init = true;
    app.resize_timer = 0;
    app.res = window.devicePixelRatio;
    app.container = document.querySelector('.canvas-container');
    app.time = Timer();
    app.ticker = Ticker();
    app.canvas = Canvas(app.container);
    app.view = Vec4(0,0,app.canvas.width, app.canvas.height);
    app.input = Input(app.container);
    
    var aa = true;
    if(app.res > 1.5 || app.view[2] > 3000) aa = false;
    app.webgl = WebGL(app.canvas,
    {
        alpha: false,
        depth: true,
        stencil: false,
        antialias: aa,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        preferLowPowerToHighPerformance: false,
        failIfMajorPerformanceCaveat: false,
    });

    app.sampler = default_sampler();

    window.addEventListener('focus', function()
    {
        console.log('FOCUS');
        app.has_focus = true;
    });
    window.addEventListener('blur', function()
    {
        console.log('BLUR');
        app.has_focus = false;
    });
    window.addEventListener('resize', function()
    {
        app.resize = true;
        app.resize_timer = 0;
    });

    app.assets = AssetGroup('common');
    load_assets(app.assets,
    [
        'assets/common.txt',
    ],
    function()
    {
        bind_assets(app.assets);
    });


    app.debug_tools = Debug_Tools();

    app.state = AppState.INIT;

    requestAnimationFrame(update);
}

function update(t)
{
    requestAnimationFrame(update);

    var ticker = app.ticker;
    advance_ticker(ticker);

    if(app.resize === true)
    {
        app.resize_timer += ticker.dt;
        if(app.resize_timer > 0.5)
        {
            app.do_resize = true;
        }
    }
  
    if(app.has_focus)
    {
        switch(app.state)
        {
            case AppState.INIT:
            
                app.screen_quad = quad_mesh(2,2,0);
                app.quad = quad_mesh(1,1,0);
                app.gl_draw = GL_Draw(16000);
                app.vector = Vector();

                set_viewport(app.view);
                set_clear_color_f(0,0,0,1);
                clear_screen();
                clear_stacks();

                app.state = AppState.LOADING;

            break;
            case AppState.LOADING:

                if(app.auto_init && app.assets.loaded)
                {
                    app.state = AppState.RUNNING;
                }

            break;
            case AppState.RUNNING:

                if(app.time.paused) break;

                if(app.do_resize)
                {
                    resize_canvas(app.canvas, app.container);
                    app.view[2] = app.canvas.width;
                    app.view[3] = app.canvas.height;
                }

                //console.log(ticker.frames_to_tick)
                for(var i = 0; i < ticker.frames_to_tick; ++i)
                {
                    update_input();
                    advance_timer(app.time, ticker.advance);
                    update_vector(app.vector, ticker.advance);
                    update_key_states();

                    if(app.do_resize)
                    {
                        console.log('resized');
                        app.do_resize = false;
                        app.resize = false;
                        app.resize_timer = 0;
                    }
                }

                if(ticker.frames_to_tick > 0)
                {
                    render_vector(app.vector);
                }
                
                update_debug_fps();
                

            break;
        }
    }

    clear_stacks();
}