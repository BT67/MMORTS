var hovering = position_meeting(device_mouse_x_to_gui(0), device_mouse_y_to_gui(0), id);
if (hovering && mouse_check_button_released(mb_left)){
	focused = true;
	var logout_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(logout_packet, buffer_string, "LOGOUT");
	network_write(network.socket, logout_packet);
	instance_destroy(entity);
	instance_destroy(attack);
	instance_destroy(animation);
	instance_destroy(wall);
	instance_destroy(obj_floor);
	instance_destroy(door);
	audio_stop_all();
	room_goto(rm_login);
}
	
	