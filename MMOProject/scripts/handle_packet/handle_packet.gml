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
			origin_x = (real(origin_x) + 1) * 32;
			origin_y = buffer_read(data_buffer, buffer_string);
			origin_y = (real(origin_y) + 1) * 32;
			width = buffer_read(data_buffer, buffer_string);
			width = real(width);
			height = buffer_read(data_buffer, buffer_string);
			height = real(height);
			for(var h = 0; h < width; ++h){
				for(var v = 0; v < height; ++v){
					if(!position_meeting(origin_x + (h * 32), origin_y + (v * 32), obj_floor)){
						var_floor = "";
						with(instance_create_layer(origin_x + (h * 32), origin_y + (v * 32), "Walls_Floors", asset_get_index(floor_type))){
							var_floor = other;
						}
					}
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
			with(instance_create_layer(real(pos_x), real(pos_y), "Walls_Floors", asset_get_index(wall_type))){
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
			with(instance_create_layer(real(pos_x), real(pos_y), "Walls_Floors", asset_get_index(door_type))){
				var_door = other;
			}
			view_pos_x = pos_x - (camera_controller.view_width/2)
			if(view_pos_x < 0){
				view_pos_x = 0;
			}
			view_pos_y = pos_y - (camera_controller.view_height/2)
			if(view_pos_y < 0){
				view_pos_y = 0;
			}
			camera_set_view_pos(camera_controller.camera, view_pos_x, view_pos_y);
			camera_set_view_size(camera_controller.camera, camera_controller.camera_width, camera_controller.camera_height);	
			break;	
		case "SPAWN":
			entity_name = buffer_read(data_buffer, buffer_string);
			entity_type = buffer_read(data_buffer, buffer_string);
			show_debug_message(string(entity_type));
			target_x = buffer_read(data_buffer, buffer_string);
			target_x = ((real(target_x) + 1) * 32) + network.sprite_offset;
			target_y = buffer_read(data_buffer, buffer_string);
			target_y = ((real(target_y) + 1) * 32) + network.sprite_offset;
			entity_health = buffer_read(data_buffer, buffer_string);
			entity_max_health =  buffer_read(data_buffer, buffer_string);
			with(instance_create_layer(real(target_x), real(target_y), "Entities", asset_get_index(entity_type))){
				var_entity = other;
			}
			variable_instance_set(instance_find(entity, instance_number(entity) - 1), "entity_name", entity_name);
			variable_instance_set(instance_find(entity, instance_number(entity) - 1), "target_x", target_x);
			variable_instance_set(instance_find(entity, instance_number(entity) - 1), "target_y", target_y);
			variable_instance_set(instance_find(entity, instance_number(entity) - 1), "entity_health", entity_health);
			variable_instance_set(instance_find(entity, instance_number(entity) - 1), "entity_max_health", entity_max_health);
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
			instance_destroy(entity);
			instance_destroy(attack);
			instance_destroy(animation);
			instance_destroy(wall);
			instance_destroy(obj_floor);
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
			show_debug_message(target_entity);
			show_debug_message(origin_entity);
			origin_x = 0;
			origin_y = 0;
			target_x = "";
			target_y = "";
			for(var i = 0; i < instance_number(entity); ++i){
				if(instance_find(entity, i).entity_name == target_entity){
					target_x = instance_find(entity, i).x;
					target_y = instance_find(entity, i).y;
					break;
				}
			}
			if(target_x != "" && target_y != ""){
				for(var i = 0; i < instance_number(entity); ++i;) {
					if(instance_find(entity, i).entity_name == origin_entity){
						origin_entity = instance_find(entity, i).entity_name;
						origin_entity_index = i;
						origin_x = instance_find(entity, i).x;
						origin_y = instance_find(entity, i).y;
						variable_instance_set(instance_find(entity, i), "direction", point_direction(origin_x, origin_y, target_x, target_y));
						variable_instance_set(instance_find(entity, i), "target_entity", target_entity);
						variable_instance_set(instance_find(entity, i), "visible", false);
						variable_instance_set(instance_find(entity, i), "is_visible", false);
						show_debug_message(instance_find(entity, i).entity_name + " visible=" + string(instance_find(entity, i).visible));
						var obj = "";
						audio_play_sound(asset_get_index(instance_find(entity, i).attack_sound), 10, false);
						with(instance_create_layer(real(origin_x), real(origin_y), "Entities", asset_get_index(instance_find(entity, i).attack_animation_ref))){
							obj = other;
						}
						variable_instance_set(instance_find(attack_animation, instance_number(attack_animation) - 1), "parent_entity", origin_entity);
						variable_instance_set(instance_find(attack_animation, instance_number(attack_animation) - 1), "target_x", target_x);
						variable_instance_set(instance_find(attack_animation, instance_number(attack_animation) - 1), "target_y", target_y);
						break;
					}
				}
			}
			break;
		case "LOGOUT":
			msg = buffer_read(data_buffer, buffer_string);
			network.username = "";
			instance_destroy(entity);
			instance_destroy(attack);
			instance_destroy(animation);
			instance_destroy(wall);
			instance_destroy(obj_floor);
			instance_destroy(door);
			audio_stop_all();
			show_debug_message(date_datetime_string(date_current_datetime()) + msg);
			room_goto(rm_login);
			break;
		case "DESTROY":
			entity_name = buffer_read(data_buffer, buffer_string);
			//Destroy all child animations of the target 
			for(var i = 0; i < instance_number(animation); ++i){
				try{
					if(instance_find(animation,i).parent_entity == entity_name){
						instance_destroy(instance_find(animation,i));
						break;
					}
				} catch(error) {
					
				}
			}
			for(var i = 0; i < instance_number(entity); ++i;) {
				if(instance_find(entity, i).entity_name == entity_name){
					instance_destroy(instance_find(entity, i));
				}
				try{
					if(instance_find(entity, i).target_entity == entity_name){
						variable_instance_set(instance_find(entity, i), "target_entity", "");
					}
				} catch(error){
					
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
			pos_x = ((real(pos_x) + 1) * 32) + network.sprite_offset;
			pos_y = buffer_read(data_buffer, buffer_string);
			pos_y = ((real(pos_y) + 1) * 32) + network.sprite_offset;
			target_x = buffer_read(data_buffer, buffer_string);
			target_x = ((real(target_x) + 1) * 32) + network.sprite_offset;
			target_y = buffer_read(data_buffer, buffer_string);
			target_y = ((real(target_y) + 1) * 32) + network.sprite_offset;
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