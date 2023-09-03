if(focused){	
	if(keyboard_key == vk_backspace){
		text = string_copy(text, 0, string_length(text) - 1);
	} else if(keyboard_key != vk_tab &&
		keyboard_key != vk_up &&
		keyboard_key != vk_down &&
		keyboard_key != vk_left &&
		keyboard_key != vk_right){
		text += keyboard_lastchar;	
	}
}