function handle_packet(data_buffer){
	command = buffer_read(data_buffer, buffer_string);
	show_debug_message(date_datetime_string(date_current_datetime()) + " Networking event encountered: " + command);
	show_debug_message(date_datetime_string(date_current_datetime()) + string(data_buffer));
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
				variable_instance_set(instance_find(hud_controller, 0), "username", entity_name);
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
			cont = true;
			show_debug_message("data_buffer size=" + string(buffer_get_size(data_buffer)));
			while(cont) {
				try {
					entity_name = buffer_read(data_buffer, buffer_string);
					show_debug_message(string(entity_name));
					entity_type = buffer_read(data_buffer, buffer_string);
					show_debug_message(string(entity_type));
					target_x = buffer_read(data_buffer, buffer_string);
					show_debug_message(string(target_x));
					target_y = buffer_read(data_buffer, buffer_string);
					show_debug_message(string(target_y));
					entity_health = buffer_read(data_buffer, buffer_string);
				} catch(exception) {
					cont = false;
				}
				if(entity_name == "end"){
					cont = false;
				}
				var_entity = "";
				with(instance_create_layer(real(target_x), real(target_y), "Instances", asset_get_index(entity_type))){
					var_entity = other;
				}
				variable_instance_set(instance_find(entity, instance_number(entity) - 1), "entity_name", entity_name);
				variable_instance_set(instance_find(entity, instance_number(entity) - 1), "target_x", target_x);
				variable_instance_set(instance_find(entity, instance_number(entity) - 1), "target_y", target_y);
				show_debug_message(date_datetime_string(date_current_datetime()) + " Created entity: " + entity_name);
			}
			break;
		case "ENTITY":
			entity_name = buffer_read(data_buffer, buffer_string);
			//pos_x = buffer_read(data_buffer, buffer_string);
			//pos_y = buffer_read(data_buffer, buffer_string);
			target_x = buffer_read(data_buffer, buffer_string);
			target_y = buffer_read(data_buffer, buffer_string);
			entity_health = buffer_read(data_buffer, buffer_string);
			entity_sprite = buffer_read(data_buffer, buffer_string);
			for(var i = 0; i < instance_number(entity); ++i;) {
				if(instance_find(entity, i).entity_name == entity_name){
					//instance_find(entity, i).x = pos_x;
					//instance_find(entity, i).y = pos_y;
					instance_find(entity, i).target_x = target_x;
					instance_find(entity, i).target_y = target_y;
				}
			}
			break;
		case "ROOM":
			instance_destroy(entity);
			entity_name = buffer_read(data_buffer, buffer_string);
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
	//buffer_delete(data_buffer);
}