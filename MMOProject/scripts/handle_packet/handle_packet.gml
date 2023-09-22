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
		case "REFRESH":
		show_debug_message(string(network.refresh_timer));
			network.refresh_timer = 0;
			break;
		case "LOGIN":
			status = buffer_read(data_buffer, buffer_string);
			msg = buffer_read(data_buffer, buffer_string);
			show_debug_message(date_datetime_string(date_current_datetime()) + " " + msg);
			if(status == "TRUE"){
				entity_name = buffer_read(data_buffer, buffer_string);
				network.username = entity_name;
				audio_stop_all();
				room_goto(rm_game);
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
		case "FLOOR":
			floor_type = buffer_read(data_buffer, buffer_string);
			origin_x = buffer_read(data_buffer, buffer_string);
			origin_y = buffer_read(data_buffer, buffer_string);
			width = buffer_read(data_buffer, buffer_string);
			height = buffer_read(data_buffer, buffer_string);
			origin_x = real(origin_x);
			origin_y = real(origin_y);
			width = real(width);
			height = real(height);
			var layer_id = layer_get_id("Tiles_1");
			var tilemap_id = layer_tilemap_get_id(layer_id);
			var tilemap = tilemap_get(tilemap_id, 0, 1); 
			for(var h = 0; h < width + 1; ++h){
				for(var v = 0; v < height + 1; ++v){
					camera_set_view_pos(camera_controller.camera, 0, 0);
					camera_set_view_size(camera_controller.camera, room_width, room_height);
					tilemap_set(tilemap_id, tilemap, origin_x + h, origin_y + v);
				}
			}
			break;	
		case "WALL":
			wall_type = buffer_read(data_buffer, buffer_string);
			pos_x = buffer_read(data_buffer, buffer_string);
			pos_x = (real(pos_x) + 1) * 32;
			pos_y = buffer_read(data_buffer, buffer_string);
			pos_y = (real(pos_y) + 1) * 32;
			wall_num = buffer_read(data_buffer, buffer_string);
			wall_num = real(wall_num);
			var_wall = "";
			with(instance_create_layer(real(pos_x), real(pos_y), "Instances", asset_get_index(wall_type))){
				var_wall = other;
			}
			break;
		case "DOOR":
			door_type = buffer_read(data_buffer, buffer_string);
			pos_x = buffer_read(data_buffer, buffer_string);
			pos_x = (real(pos_x) + 1) * 32;
			pos_y = buffer_read(data_buffer, buffer_string);
			pos_y = (real(pos_y) + 1) * 32;
			var_door = "";
			with(instance_create_layer(real(pos_x), real(pos_y), "Instances", asset_get_index(door_type))){
				var_door = other;
			}
			break;	
		case "SPAWN":
			entity_name = buffer_read(data_buffer, buffer_string);
			entity_type = buffer_read(data_buffer, buffer_string);
			show_debug_message(string(entity_type));
			target_x = buffer_read(data_buffer, buffer_string);
			target_x = (real(target_x) + 1) * 32;
			target_y = buffer_read(data_buffer, buffer_string);
			target_y = (real(target_y) + 1) * 32;
			entity_health = buffer_read(data_buffer, buffer_string);
			with(instance_create_layer(real(target_x), real(target_y), "Instances", asset_get_index(entity_type))){
				var_entity = other;
			}
			variable_instance_set(instance_find(entity, instance_number(entity) - 1), "entity_name", entity_name);
			variable_instance_set(instance_find(entity, instance_number(entity) - 1), "target_x", target_x);
			variable_instance_set(instance_find(entity, instance_number(entity) - 1), "target_y", target_y);
			show_debug_message(string(entity_name));
			break;
		case "HEALTH":
			entity_name = buffer_read(data_buffer, buffer_string);
			entity_health = buffer_read(data_buffer, buffer_string);
			for(var i = 0; i < instance_number(entity); ++i;) {
				if(instance_find(entity, i).entity_name == entity_name){
					instance_find(entity, i).entity_health = real(entity_health);
				}
			}			
			break;
		case "ROOM":
		//Do not clear the area of the tilemap that holds tile presets, since these are used to draw other tiles
			var tilemap_id = layer_tilemap_get_id(layer_get_id("Tiles_1"))
			for (var i = 2; i < tilemap_get_width(tilemap_id); i++;)
			{
			    for (var j = 2; j < tilemap_get_height(tilemap_id); j++;)
			    {
			        var data = tilemap_get(tilemap_id, i, j);
			        data = tile_set_empty(data)
			        tilemap_set(tilemap_id, data, i, j);
			    }
			}
			instance_destroy(entity);
			instance_destroy(attack);
			instance_destroy(animation);
			instance_destroy(wall);
			instance_destroy(door);
			audio_stop_all();
			grid_width = buffer_read(data_buffer, buffer_string);
			new_width = (real(grid_width) + 2 ) * 32;
			grid_height = buffer_read(data_buffer, buffer_string);
			new_height = (real(grid_height) + 2 ) * 32;
			room_width = new_width;
			room_height = new_height;
			network.map_width = room_width;
			network.map_height = room_height;
			break;
		case "ATTACK":
			attack_type = buffer_read(data_buffer, buffer_string);
			target_entity = buffer_read(data_buffer, buffer_string);
			origin_entity = buffer_read(data_buffer, buffer_string);
			origin_x = 0;
			origin_y = 0;
			for(var i = 0; i < instance_number(move_animation); ++i){
				if(instance_find(move_animation,i).parent_entity == origin_entity){
					variable_instance_set(instance_find(move_animation, i), "is_visible", false);
				}
			}
			for(var i = 0; i < instance_number(entity); ++i;) {
				if(instance_find(entity, i).entity_name == origin_entity){
					origin_entity = instance_find(entity, i).entity_name;
					origin_entity_index = i;
					origin_x = instance_find(entity, i).x;
					origin_y = instance_find(entity, i).y;
					variable_instance_set(instance_find(entity, i), "is_visible", false);
					var obj = "";
					audio_play_sound(asset_get_index(instance_find(entity, i).attack_sound), 10, false);
					if(instance_find(entity, i).facing_left == true){
						with(instance_create_layer(real(origin_x), real(origin_y), "Instances", asset_get_index(instance_find(entity, i).attack_left))){
							obj = other;
						}
					} else {
						with(instance_create_layer(real(origin_x), real(origin_y), "Instances", asset_get_index(instance_find(entity, i).attack_right))){
							obj = other;
						}
					}
					variable_instance_set(instance_find(attack_animation, instance_number(attack_animation) - 1), "parent_entity", origin_entity);
					break;
				}
			}
			break;
		case "LOGOUT":
			msg = buffer_read(data_buffer, buffer_string);
			network.username = "";
			show_debug_message(date_datetime_string(date_current_datetime()) + msg);
			room_goto(rm_login);
			break;
		case "DESTROY":
			entity_name = buffer_read(data_buffer, buffer_string);
			//Destroy all child animations of the target 
			for(var i = 0; i < instance_number(animation); ++i){
				if(instance_find(animation,i).parent_entity == entity_name){
					instance_destroy(instance_find(animation,i));
					break;
				}
			}
			for(var i = 0; i < instance_number(entity); ++i;) {
				if(instance_find(entity, i).entity_name == entity_name){
					instance_destroy(instance_find(entity, i));
					break;
				}
			}
			break;
		case "CHAT":
			msg = buffer_read(data_buffer, buffer_string);
			array_push(txt_chat_log.chat_log, msg);
			break;
		case "POS":
			entity_name = buffer_read(data_buffer, buffer_string);
			pos_x = buffer_read(data_buffer, buffer_string);
			pos_x = (real(pos_x) + 1) * 32;
			pos_y = buffer_read(data_buffer, buffer_string);
			pos_y = (real(pos_y) + 1) * 32;
			target_x = buffer_read(data_buffer, buffer_string);
			target_x = (real(target_x) + 1) * 32;
			target_y = buffer_read(data_buffer, buffer_string);
			target_y = (real(target_y) + 1) * 32;
			for(var i = 0; i < instance_number(entity); ++i;) {
				if(instance_find(entity, i).entity_name == entity_name){
					if(abs(instance_find(entity, i).x - pos_x) > 50){
						instance_find(entity, i).x = pos_x;
					}
					if(abs(instance_find(entity, i).y - pos_y) > 50){
						instance_find(entity, i).y = pos_y;
					}
					instance_find(entity, i).target_x = target_x;
					instance_find(entity, i).target_y = target_y;
					break;
				}
			}
			break;
	}
}