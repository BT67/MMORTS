	view_pos_x = camera_get_view_x(camera);
	view_pos_y = camera_get_view_y(camera);
	if(keyboard_check(vk_up)){
		view_pos_y -= scroll_speed;
	} else if(keyboard_check(vk_down)){
		view_pos_y += scroll_speed;
	} 
	if(keyboard_check(vk_left)){
		view_pos_x -= scroll_speed;	
	} else if(keyboard_check(vk_right)){
		view_pos_x += scroll_speed;
	}

/*
var wheel = mouse_wheel_down() - mouse_wheel_up();

if(wheel != 0){
	wheel *= zoom_speed;
	camera_width += (camera_width * wheel);
	camera_height += (camera_height * wheel);
	
	var adjust_pos = true;
	
	if(camera_height > 630){
		camera_height = 630;
		adjust_pos = false;
	} else if(camera_height < 128){
		camera_height = 128;	
		adjust_pos = false;
	}
	
	if(camera_width > 1120){
		camera_width = 1120;
		adjust_pos = false;
	} else if(camera_width < 225){
		camera_width = 225;	
		adjust_pos = false;
	}
	
	if(adjust_pos){
		view_pos_x -= (camera_width * wheel)/2;
		view_pos_y -= (camera_height * wheel)/2;
	}
}
*/
	if(view_pos_y < -26){
		view_pos_y = -26;
	} else if(view_pos_y + view_height >= network.map_height + 118){
		view_pos_y = network.map_height - view_height + 118;
	}
	if(view_pos_x < 0){
		view_pos_x = 0;
	} else if(view_pos_x + view_width >= network.map_width){
		view_pos_x = network.map_width - view_width;
	}
	
	try {
		view_pos_x = player.x - (view_width/2);
		if(view_pos_x < 0){
			view_pos_x = 0;
		}
		view_pos_y = player.y - (view_height/2);
		if(view_pos_y < 0){
			view_pos_y = 0;
		}
	} catch(error){
		
	}
	
	camera_set_view_pos(camera, view_pos_x, view_pos_y);
	camera_set_view_size(camera, camera_width, camera_height);

