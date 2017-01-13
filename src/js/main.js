var app = {};

var AppState = 
{
    INIT: 0,
    RUNNING: 1,
};

function main()
{
    // DEBUG
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
    // END

    app.has_focus = true;
    app.state = AppState.INIT;
   

    // LOAD ASSETS
    app.preloader = Preloader(app.container);
    app.assets_loaded = false;

    /*
    var r = Request('arraybuffer', 'assets/assets.bin.gz');
    r.setRequestHeader('accept-encoding','gzip');
    r.setRequestHeader('content-encoding','gzip');
    */
    var r = Request('arraybuffer', 'assets/assets.bin');
    r.onprogress = function(e)
    {
        var percent_loaded =  e.loaded / e.total;
        update_preloader(app.preloader, percent_loaded);
    }
    r.onload = function(e)
    {
        //app.assets = read_asset_file(e.target.response);
        app.assets_loaded = true;
        init_webgl(e.target.response);
    }
    r.send();
}

function init_webgl(asset_file)
{
    hide_preloader(app.preloader);

    app.res = window.devicePixelRatio;
    var container = document.querySelector('.app');
    app.container = container;

    var container_width = container.clientWidth;
    var container_height = container.clientHeight;
    var width = container_width * app.res;
    var height = container_height * app.res;

    app.time = Time();
    app.view = Vec4(0,0,width,height);
    app.canvas = Canvas(container, app.view);

    // SCALES TO DEVICE PIXEL RATIO
    var dw = -((width - container_width) / 2);
    var dh = -((height - container_height) / 2);
    app.canvas.style.transform = 'translateX(' + dw +'px) translateY('+dh+'px) scale(' + (1/app.res) + ')';

    app.input = Input(app.container);
    app.webgl = WebGL(app.canvas,
    {
        alpha: false,
        depth: true,
        stencil: false,
        antialias: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        preferLowPowerToHighPerformance: false,
        failIfMajorPerformanceCaveat: false,
    });

    app.sampler = default_sampler();
    app.assets = read_asset_file(asset_file);
    init();
}


window.addEventListener('load', main);
