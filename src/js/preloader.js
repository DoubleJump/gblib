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