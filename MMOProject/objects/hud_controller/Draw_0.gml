if(selection_open){
	selection_target_x = mouse_x;
	selection_target_y = mouse_y;
	draw_rectangle(
		selection_origin_x,
		selection_origin_y,
		selection_target_x,
		selection_target_y,
		true
	);
	
	for(var i = 0; i < instance_number(entity); ++i;) {
		if(instance_find(entity, i).entity_name == network.username){
			if(
				collision_rectangle(
					selection_origin_x,
					selection_origin_y,
					selection_target_x,
					selection_target_y,
					entity,
					false,
					true
				) == instance_find(entity, i).id
			){
				instance_find(entity, i).focused = true;
				break;
			}
		}
	}
}