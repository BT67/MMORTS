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
camera_set_view_pos(camera, view_pos_x, view_pos_y);