event_inherited();

focused = true;
login_controller.tab_index = 3;

acceptable = true;

if(acceptable){
	if(
		string_length(txt_username_login.text < 1) ||
		string_length(txt_username_login.text > network.username_max_chars)
		){
			lbl_msg_login.text = "";
			acceptable = false;
	}
}

if(acceptable){
	for(var i = 1; i <= string_length(txt_username_login.text); ++i){
	    if string_pos(string_char_at(txt_username_login.text, i), "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_@") == 0 {
	        acceptable = false;
	        break;
	    }
	}
}

if(
	string_length(txt_password_login.text < 8) ||
	string_length(txt_password_login.text > 30)
	){
		acceptable = false;
}

if(acceptable){
	for(var i = 1; i <= string_length(txt_email_register.text); ++i){
	    if string_pos(string_char_at(txt_email_register.text, i), "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_@") == 0 {
	        acceptable = false;
	        break;
	    }
	}
}

var login_packet = buffer_create(1, buffer_grow, 1);
buffer_write(login_packet, buffer_string, "LOGIN");
buffer_write(login_packet, buffer_string, txt_username_login.text);
buffer_write(login_packet, buffer_string, txt_password_login.text);
network_write(network.socket, login_packet);



