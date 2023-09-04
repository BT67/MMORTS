if(typeof(target_entity) == "string") {
	for(var i = 0; i < instance_number(entity); ++i;) {
		if(instance_find(entity, i).entity_name == target_entity){
			target_entity = instance_find(entity, i);
			target_x = target_entity.x;
			target_y = target_entity.y;
			break;
		}
	}
	if(typeof(target_entity) == "string"){
		instance_destroy();
	}
} else {
	try {
		move_towards_point(target_entity.x, target_entity.y, move_speed);
	} catch(error) {
		move_towards_point(target_x, target_y, move_speed);
	}
	if(distance_to_point(target_x, target_y) < 10){
		instance_destroy();
	}
}
