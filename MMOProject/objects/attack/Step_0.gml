if(typeof(target_entity) == "string") {
	show_debug_message("Target entity name=" + target_entity);
	for(var i = 0; i < instance_number(entity); ++i;) {
		if(instance_find(entity, i).entity_name == target_entity){
			target_entity = instance_find(entity, i);
			show_debug_message("Found attack target entity");
			break;
		}
	}
} else {
	move_towards_point(target_entity.x, target_entity.y, 2);	
}
