function Canvas(container)
{
	var canvas = document.createElement('canvas');
    resize_canvas(canvas, container);
    container.appendChild(canvas);
    return canvas;
}

function resize_canvas(canvas, container)
{
    var container_width = container.clientWidth;
    var container_height = container.clientHeight;

    var width = container_width * app.res;
    var height = container_height * app.res;

    canvas.width = width;
    canvas.height = height;

    // SCALES TO DEVICE PIXEL RATIO
    
    var dw = -((width - container_width) / 2);
    var dh = -((height - container_height) / 2);
    canvas.style.transform = 'translateX(' + dw +'px) translateY('+dh+'px) scale(' + (1/app.res) + ')';
}