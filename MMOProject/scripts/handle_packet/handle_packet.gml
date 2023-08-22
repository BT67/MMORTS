function handle_packet(data_buffer){
	command = buffer_read(data_buffer, buffer_string);
	show_debug_message(date_datetime_string(date_current_datetime()) + " Networking event encountered: " + command);
	switch(command){
		case "HANDSHAKE":
			server_time = buffer_read(data_buffer, buffer_string);
			room_goto(rm_init);
			show_debug_message(date_datetime_string(date_current_datetime()) + " Connection with server established");
			break;
		case "LOGIN":
			status = buffer_read(data_buffer, buffer_string);
			msg = buffer_read(data_buffer, buffer_string);
			show_debug_message(date_datetime_string(date_current_datetime()) + " " + msg);
			if(status == "TRUE"){
				username = buffer_read(data_buffer, buffer_string);
				target_room = buffer_read(data_buffer, buffer_string);
				show_debug_message(string(target_room));
				pos_x = buffer_read(data_buffer, buffer_string);
				pos_y = buffer_read(data_buffer, buffer_string);
				player_health = buffer_read(data_buffer, buffer_string);
				player_sprite = buffer_read(data_buffer, buffer_string);
				room_goto(asset_get_index(target_room));
				var_player = "";
				with(instance_create_layer(real(pos_x), real(pos_y), "Instances", player)){
                var_player = other;
				}
				if(instance_exists(player)){
					show_debug_message(date_datetime_string(date_current_datetime()) + " " + "Created player object at pos=" + string(player.x) + "," + string(player.y));
				}
				
				//TODO make player object persistent, destroy player object on room exit  
			} else {
				if(instance_exists(lbl_msg_login)){
				lbl_msg_login.text = msg;
				}
			}
			break;
		case "REGISTER":
			status = buffer_read(data_buffer, buffer_string);
			msg = buffer_read(data_buffer, buffer_string);
			show_debug_message(date_datetime_string(date_current_datetime()) + msg);
			if(status == "TRUE") {
				room_goto(rm_register_success);
				network.server_text = msg;
			} else {
				if(instance_exists(lbl_msg_register)){
					lbl_msg_register.text = msg;
				}
			}
			break;
		case "SPAWN":
			break;
		case "ENTITY":
			break;
		case "ATTACK":
			break;
		case "LOGOUT":
			msg = buffer_read(data_buffer, buffer_string);
			show_debug_message(date_datetime_string(date_current_datetime()) + msg);
			room_goto(rm_login);
			break;
		case "DESTROY":
			break;
		case "CHAT":
			break;
	}
}