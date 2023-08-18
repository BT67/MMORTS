//Argument 0: data buffer

function handle_packet(data_buffer){
	var command = buffer_read(data_buffer, buffer_string);
	show_debug_message(date_datetime_string(date_current_datetime()) + " Networking event encountered: " + command);
	switch(command){
		case "HANDSHAKE":
			server_time = buffer_read(data_buffer, buffer_string);
			room_goto_next();
			show_debug_message(date_datetime_string(date_current_datetime()) + " Connection with server established");
	}
}