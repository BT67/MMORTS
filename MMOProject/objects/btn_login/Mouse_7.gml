event_inherited();

focused = true;
login_controller.tab_index = 3;

acceptable = true;

if(acceptable){
	if(
		string_length(txt_username_login.text) < network.username_min_chars ||
		string_length(txt_username_login.text) > network.username_max_chars
		){
			lbl_msg_login.text = "Invalid username or password";
			acceptable = false;
	}
}

if(acceptable){
	if(
		string_length(txt_password_login.text) < network.password_min_chars ||
		string_length(txt_password_login.text) > network.password_max_chars
		){
			lbl_msg_login.text = "Invalid username or password";
			acceptable = false;
	}
}

if(acceptable){
	for(var i = 1; i <= string_length(txt_username_login.text); ++i){
	    if string_pos(string_char_at(txt_username_login.text, i), "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_@") == 0 {
	        lbl_msg_login.text = "Invalid username or password";
			acceptable = false;
			show_debug_message("Invalid username char");
	        break;
	    }
	}
}

if(acceptable){
	for(var i = 1; i <= string_length(txt_password_login.text); ++i){
	    if string_pos(string_char_at(txt_password_login.text, i), "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_@") == 0 {
	        lbl_msg_login.text = "Invalid username or password";
			acceptable = false;
			show_debug_message("Invalid password char");
	        break;
	    }
	}
}

if(acceptable) {
	var login_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(login_packet, buffer_string, "LOGIN");
	buffer_write(login_packet, buffer_string, txt_username_login.text);
	buffer_write(login_packet, buffer_string, txt_password_login.text);
	network_write(network.socket, login_packet);
}



