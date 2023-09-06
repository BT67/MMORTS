if(entity_name != "" && animations_created = false){
	with(instance_create_layer(x,y, "Instances", asset_get_index(move_anim))){
		//
	}
	variable_instance_set(instance_find(asset_get_index(move_anim), instance_number(asset_get_index(move_anim)) - 1), "parent_entity", entity_name);
	variable_instance_set(instance_find(asset_get_index(move_anim), instance_number(asset_get_index(move_anim)) - 1), "is_visible", false);
	animations_created = true;
}

path_delete(path);
path = path_add();
mp_potential_path(path, real(target_x), real(target_y), move_speed, 4, 0);

//mp_linear_step_object(target_x, target_y, move_speed, wall);
path_start(path, move_speed, path_action_stop, true);


