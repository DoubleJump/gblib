function Leap_Motion
{
    var r = {};
    r.connected = false;
    r.controller = LeapController();
    r.SCALE = 0.02;
    r.last_hand_angle = 0;
    r.finger_bounds = Vec4();
    r.frame = null;
    return r;
}

function draw_leap_motion(lm)
{
    var frame = lm.frame;
    if(lm.connected === true && frame !== null) return;

    //draw the interaction box
    /*
    var interaction_box = frame.interactionBox;
    var center = interaction_box.center;
    var hw = interaction_box.width / 2;
    var hh = interaction_box.height / 2;
    var rect = _Vec4(center - hw, center + hh, center + hw, center - hh);
    vec_mul_f(rect, app.LEAP_SCALE);
    draw_wire_rect(ctx, rect);
    */

    for(var i = 0; i < frame.hands.length; ++i)
    {
        var hand = frame.hands[i];
        //if(hand.type !== 'RIGHT') continue;
        //LOG(hand)

        var finger_min = _Vec3(100,100,100);
        var finger_max = _Vec3(-100,-100,-100);
        
        var finger_center = _Vec3();
        var fingers = hand.fingers;
        for(var f = 0; f < fingers.length; ++f)
        {
            var finger = fingers[f];
            var tip = finger.tipPosition;

            var x = tip[0] * lm.SCALE;
            var y = tip[1] * lm.SCALE;
            var z = 0; //tip[2] * app.LEAP_SCALE;

            //draw_quad_f(ctx, x,y,z, 0.2,0.2, 0.5);
            draw_point(ctx, _Vec3(x,y,z), 0.1);
            vec3_stack.index--;

            finger_center[0] += x;
            finger_center[1] += y;
            //finger_center[2] += z;

            if(x < finger_min[0]) finger_min[0] = x;
            if(y < finger_min[1]) finger_min[1] = y;

            if(x > finger_max[0]) finger_max[0] = x;
            if(y > finger_max[1]) finger_max[1] = y;
        }

        // drag finger center
        vec_div_f(finger_center, finger_center, fingers.length);
        draw_point(ctx, finger_center, 0.05);

        // draw finger bounds
        var finger_bounds = _Vec4(finger_min[0], finger_min[1], finger_max[0], finger_max[1]);
        var width_delta  = (finger_bounds[0] - finger_bounds[2]) - (app.finger_bounds[0] - app.finger_bounds[2]);
        var height_delta = (finger_bounds[1] - finger_bounds[3]) - (app.finger_bounds[1] - app.finger_bounds[3]);
        vec_eq(app.finger_bounds, finger_bounds);

        set_vec4(ctx.color, 0.4,0.4,0.4,1.0);
        draw_line(ctx, _Vec3(finger_min[0], finger_min[1]), _Vec3(finger_min[0], finger_max[1]));
        draw_line(ctx, _Vec3(finger_min[0], finger_max[1]), _Vec3(finger_max[0], finger_max[1]));
        draw_line(ctx, _Vec3(finger_max[0], finger_max[1]), _Vec3(finger_max[0], finger_min[1]));
        draw_line(ctx, _Vec3(finger_max[0], finger_min[1]), _Vec3(finger_min[0], finger_min[1]));
        vec3_stack.index -= 8;

        //draw_bounds(ctx, finger_bounds);

        //store the angle between the center and the thumb for rotation
        /*
        var angle = 0;
        if(hand.thumb !== null)
        {
            var thumb_pos = hand.thumb.toPosition;
            var dx = thumb_pos[0] - finger_center[0];
            var dy = thumb_pos[1] - finger_center[1];
            angle = Math.atan2(dy, dy);
        }
        var angle_delta = angle - app.last_hand_angle;
        app.last_hand_angle = angle;
        */  
    }
}



    
    
        
    

