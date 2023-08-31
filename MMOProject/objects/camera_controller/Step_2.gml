view_pos_x = camera_get_view_x(camera);
view_pox_y = camera_get_view_y(camera);

if(keyboard_check(vk_up)){
	view_pox_y -= scroll_speed;
} else if(keyboard_check(vk_down)){
	view_pox_y += scroll_speed;
} 
if(keyboard_check(vk_left)){
	view_pos_x -= scroll_speed;	
} else if(keyboard_check(vk_right)){
	view_pos_x += scroll_speed;
}

var wheel = mouse_wheel_down() - mouse_wheel_up();

if(wheel != 0){
	wheel *= zoom_speed;
	camera_width += (camera_width * wheel);
	camera_height += (camera_height * wheel);
	view_pos_x -= (camera_width * wheel)/2;
	view_pox_y -= (camera_height * wheel)/2;
}

camera_set_view_pos(camera, view_pos_x, view_pox_y);
camera_set_view_size(camera, camera_width, camera_height);