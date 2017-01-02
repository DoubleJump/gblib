'use strict';

function Preloader(container)
{
	var r = {};
	r.loaded_bytes = 0;
	r.load_percent = 0;
	r.svg = document.querySelector('.preloader');
	r.loading_bar = document.querySelector('.preloader-bar');
	return r;
}

function update_preloader(pl, percent)
{
	pl.loading_bar.style.width = Math.floor(94 * percent);
}

function hide_preloader(pl)
{
	pl.svg.style.display = 'none';
}
var app = {};

var AppState = 
{
    INIT: 0,
    RUNNING: 1,
};

function main()
{
    console.log('PRELOAD');
    
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

    //var r = Request('arraybuffer', 'assets/assets.bin.gz');
    var r = Request('arraybuffer', 'assets/assets.bin');
    r.onprogress = function(e)
    {
        var percent_loaded =  e.loaded / e.total;
        update_preloader(app.preloader, percent_loaded);
    }
    r.onload = function(e)
    {
        app.asset_file = read_asset_file(e.target.response);
        app.assets_loaded = true;
        //hide_preloader(app.preloader);
        //init_webgl(e.target.response);
    }
    r.send();
}

window.addEventListener('load', main);


