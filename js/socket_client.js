'use strict';

//import src/js/webgl/macros.js
//import src/js/webgl/math.js
//import src/js/webgl/stack.js
//import src/js/webgl/time.js
//import src/js/webgl/vector.js
//import src/js/webgl/quaternion.js
//import src/js/webgl/input.js
//import src/js/webgl/socket.js

var app = {};

function init()
{
	app.input = Input();
	app.device_buffer = new Float32Array(21);
	app.socket = create_websocket('ws://192.168.0.XX:8080/');
	
	// Disable pinch to zoom
	document.addEventListener('gesturestart', function(e) 
	{
	    e.preventDefault();
	});

	if(input.is_touch_device === true)
	{
		requestAnimationFrame(update);
	}
	//else fallback message
}

function update()
{
	requestAnimationFrame(update);
	update_input();

	var b = app.device_buffer;
	if(input.is_touch_device === true)
	{
		var gyro = input.gyro;
		if(gyro.updated === true)
		{
			b[0] = 1.0;
			b[1] = gyro.acceleration[0];
			b[2] = gyro.acceleration[1]; 
			b[3] = gyro.acceleration[2];

			b[4] = gyro.angular_acceleration[0]; 
			b[5] = gyro.angular_acceleration[1]; 
			b[6] = gyro.angular_acceleration[2]; 

			b[7] = gyro.rotation[0]; 
			b[8] = gyro.rotation[1]; 
			b[9] = gyro.rotation[2]; 
			
			gyro.updated = false;
			app.socket.send(app.device_buffer.buffer);
		}
	}
}

window.addEventListener('load', init);