event_inherited();

if(string_length(txt_username.text) > 0 && string_length(txt_password.text) > 0){
	var login_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(login_packet, buffer_string, "LOGIN");
	buffer_write(login_packet, buffer_string, txt_username.text);
	buffer_write(login_packet, buffer_string, txt_password.text);
	network_write(network.socket, login_packet);
} else {
	
	//Error message, invalid username/password, etc.	
	
}




