event_inherited();

focused = true;

acceptable = true;


//Check mail address length
if(
	string_length(txt_email_reset.text < network.email_min_chars) ||
	string_length(txt_email_reset.text > network.email_max_chars)
	){
		acceptable = false;
}

//Check valid characters
if(acceptable){
	for(var i = 1; i <= string_length(txt_email_reset.text); ++i){
	    if string_pos(string_char_at(txt_email_reset.text, i), "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_@") == 0 {
	        acceptable = false;
	        break;
	    }
	}
}

if(acceptable){
	var reset_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(reset_packet, buffer_string, "RESETPASSWORD");
	buffer_write(reset_packet, buffer_string, txt_email_reset.text);
	network_write(network.socket, reset_packet);
}



