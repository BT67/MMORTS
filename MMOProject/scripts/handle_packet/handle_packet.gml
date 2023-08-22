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
				entity_name = buffer_read(data_buffer, buffer_string);
				show_debug_message("Entity_name=" + string(entity_name));
				target_room = buffer_read(data_buffer, buffer_string);
				pos_x = buffer_read(data_buffer, buffer_string);
				pos_y = buffer_read(data_buffer, buffer_string);
				player_health = buffer_read(data_buffer, buffer_string);
				player_sprite = buffer_read(data_buffer, buffer_string);
				room_goto(asset_get_index(target_room));
				var_player = "";
				with(instance_create_layer(real(pos_x), real(pos_y), "Instances", player)){
					var_player = other;
				}
				variable_instance_set(instance_find(player, 0), "entity_name", entity_name);
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
			entity_name = buffer_read(data_buffer, buffer_string);
			target_x = buffer_read(data_buffer, buffer_string);
			target_y = buffer_read(data_buffer, buffer_string);
			entity_health = buffer_read(data_buffer, buffer_string);
			entity_sprite = buffer_read(data_buffer, buffer_string);
			for(var i = 0; i < instance_number(entity); ++i;) {
				show_debug_message("Packet entity name: " + entity_name);
				show_debug_message("Entity name: " + entity.entity_name);
				if(instance_find(entity, i).entity_name == entity_name){
					instance_find(entity, i).target_x = target_x;
					instance_find(entity, i).target_y = target_y;
					show_debug_message("Moving to :" + string(target_x) + "," + string(target_y));
					show_debug_message("Player at :" + string(instance_find(entity, i).target_x) + "," + string(instance_find(entity, i).target_y));
				}
			}
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