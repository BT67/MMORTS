event_inherited();

focused = true;
register_controller.tab_index = 4;

var acceptable = true;

if(
	string_length(txt_username_register.text < 1) ||
	string_length(txt_username_register.text > 30)
	){
		acceptable = false;
}

if(
	string_length(txt_password_register.text < 8) ||
	string_length(txt_password_register.text > 30)
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
	
if(acceptable){
	for(var i = 1; i <= string_length(txt_username_register.text); ++i){
	    if string_pos(string_char_at(txt_username_register.text, i), "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_@") == 0 {
	        acceptable = false;
	        break;
	    }
	}
}

if(acceptable){
	for(var i = 1; i <= string_length(txt_password_register.text); ++i){
	    if string_pos(string_char_at(txt_password_register.text, i), "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_@") == 0 {
	        acceptable = false;
	        break;
	    }
	}
}

if(acceptable){
	var register_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(register_packet, buffer_string, "REGISTER");
	buffer_write(register_packet, buffer_string, txt_email_register.text);
	buffer_write(register_packet, buffer_string, txt_username_register.text);
	buffer_write(register_packet, buffer_string, txt_password_register.text);
	network_write(network.socket, register_packet);
}