if(focused){
	if(keyboard_key == vk_backspace){
		text = string_copy(text, 0, string_length(text) - 1);
		hidden_chars = string_copy(hidden_chars, 0, string_length(hidden_chars) - 1);
	} else if(keyboard_key != vk_tab){
		text += keyboard_lastchar;	
		hidden_chars += "*";
	}
}