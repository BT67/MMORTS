if(focused){
	if(keyboard_key == vk_backspace){
		text = string_copy(text, 0, string_length(text) - 1);
		hidden_chars = string_copy(hidden_chars, 0, string_length(hidden_chars) - 1);
	} else if(keyboard_key != vk_tab &&
		keyboard_key != vk_up &&
		keyboard_key != vk_down &&
		keyboard_key != vk_left &&
		keyboard_key != vk_right &&
		string_length(text) < max_chars
		){
			text += keyboard_lastchar;	
			hidden_chars += "*";
	}
}