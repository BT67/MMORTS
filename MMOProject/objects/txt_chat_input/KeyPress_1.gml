if(focused){	
	if(keyboard_key == vk_backspace){
		text = string_copy(text, 0, string_length(text) - 1);
	} else if(keyboard_key == vk_enter){
		var chat_packet = buffer_create(1, buffer_grow, 1);
		buffer_write(chat_packet, buffer_string, "CHAT");
		buffer_write(chat_packet, buffer_string, text);
		network_write(network.socket, chat_packet);
		text = "";
	} else if(keyboard_key != vk_tab && 
		keyboard_key != vk_up &&
		keyboard_key != vk_down &&
		keyboard_key != vk_left &&
		keyboard_key != vk_right){
			text += keyboard_lastchar;	
	}
}