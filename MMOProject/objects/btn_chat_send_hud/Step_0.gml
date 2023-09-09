var hovering = position_meeting(device_mouse_x_to_gui(0), device_mouse_y_to_gui(0), id);
if (hovering && mouse_check_button_released(mb_left)){
	focused = true;
	var chat_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(chat_packet, buffer_string, "CHAT");
	buffer_write(chat_packet, buffer_string, txt_chat_input.text);
	network_write(network.socket, chat_packet);
}
	
	