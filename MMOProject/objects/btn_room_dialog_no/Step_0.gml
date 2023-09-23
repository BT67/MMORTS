var hovering = position_meeting(device_mouse_x_to_gui(0), device_mouse_y_to_gui(0), id);
if (visible && hovering && mouse_check_button_released(mb_left)){
	var room_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(room_packet, buffer_string, "ROOM");
	buffer_write(room_packet, buffer_string, "CANCEL");
	network_write(network.socket, room_packet);
	i
}
	
	