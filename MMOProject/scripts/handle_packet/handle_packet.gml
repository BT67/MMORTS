function handle_packet(data_buffer){
	command = buffer_read(data_buffer, buffer_string);
	show_debug_message(date_datetime_string(date_current_datetime()) + " Networking event encountered: " + command);
	switch(command){
		case "HANDSHAKE":
			server_time = buffer_read(data_buffer, buffer_string);
			room_goto_next();
			show_debug_message(date_datetime_string(date_current_datetime()) + " Connection with server established");
			break;
		case "LOGIN":
			status = buffer_read(data_buffer, buffer_string);
			msg = buffer_read(data_buffer, buffer_string);
			show_debug_message(date_datetime_string(date_current_datetime()) + msg);
			break;
		case "REGISTER":
			status = buffer_read(data_buffer, buffer_string);
			msg = buffer_read(data_buffer, buffer_string);
			show_debug_message(date_datetime_string(date_current_datetime()) + msg);
			break;
		case "SPAWN":
			break;
		case "ENTITY":
			break;
		case "ATTACK":
			break;
		case "LOGOUT":
			break;
		case "DESTROY":
			break;
	}
}