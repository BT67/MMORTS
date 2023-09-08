if(is_visible){
	for(var i = 0; i < instance_number(asset_get_index(idle_left)); ++i){
		if(instance_find(asset_get_index(idle_left),i).parent_entity == entity_name){
			break;
		}		
	}
	for(var j = 0; j < instance_number(asset_get_index(idle_right)); ++j){
		if(instance_find(asset_get_index(idle_right),j).parent_entity == entity_name){
			break;
		}		
	}
	if(facing_left){
		variable_instance_set(instance_find(asset_get_index(idle_right),j), "is_visible", false);
		variable_instance_set(instance_find(asset_get_index(idle_left),i), "is_visible", true);
	} else {
		variable_instance_set(instance_find(asset_get_index(idle_left),j), "is_visible", false);
		variable_instance_set(instance_find(asset_get_index(idle_right),i), "is_visible", true);
	}
} else {
	for(var i = 0; i < instance_number(idle_animation); ++i){
		if(instance_find(idle_animation,i).parent_entity == entity_name){
			variable_instance_set(instance_find(idle_animation,i), "is_visible", false);
		}
	}
}
if(focused) {
	if(entity_name == network.username){
		draw_circle_colour(x + 16, y + 16, 16, c_green, c_green, true);
		if(target_entity == "" && distance_to_point(dest_x, dest_y) > 2){
			draw_circle_colour(dest_x, dest_y, 16, c_yellow, c_yellow, true);
		}
		if(target_entity != ""){
			for(var i = 0; i < instance_number(entity); ++i;) {
				if(instance_find(entity, i).entity_name == target_entity){
					draw_circle_colour(instance_find(entity, i).x + 16,instance_find(entity, i).y + 16, 16, c_red, c_red, true);
					break;
				}
			}
		}
	} else {
		draw_circle_colour(x + 16, y + 16, 16, c_red, c_red, true);	
	}
}


//draw_sprite(spr_player_idle, image_index, x + 100, y + 100);