for(var j = 0; j < instance_number(moving_animation); ++j){
	if(instance_find(moving_animation,j).parent_entity == parent_entity){
		break;
	}			
}
for(var i = 0; i < instance_number(entity); ++i){
	if(instance_find(entity, i).entity_name == parent_entity){
		if(instance_find(entity,i).target_x == x &&
			instance_find(entity,i).target_y == y
		){
			is_visible = false;
			variable_instance_set(instance_find(moving_animation,j), "is_visible", false);
			variable_instance_set(instance_find(entity,i), "is_visible", true);
			break;
		} else if(instance_find(entity,i).target_x != x ||
			instance_find(entity,i).target_y != y
		){
			is_visible = false;
			variable_instance_set(instance_find(entity,i), "is_visible", false);
			variable_instance_set(instance_find(moving_animation,j), "is_visible", true);
		}
	}
}
instance_destroy();



