if(focused) {
	if(entity_name == network.username){
		draw_circle_colour(x + 16, y + 16, 16, c_green, c_green, true);
		try{
			if(target_entity == "" && distance_to_point(dest_x, dest_y) > 2){
				draw_circle_colour(dest_x, dest_y, 16, c_yellow, c_yellow, true);
			} 
		} catch(error) {
				
		}
		//if(target_entity != ""){
			//for(var i = 0; i < instance_number(entity); ++i;) {
				//if(instance_find(entity, i).entity_name == target_entity){
				//	draw_circle_colour(instance_find(entity, i).x + 16,instance_find(entity, i).y + 16, 16, c_red, c_red, true);
				//	break;
				//}
			//}
		//}
	} else {
		draw_circle_colour(x + 16, y + 16, 16, c_red, c_red, true);	
	}
}
if(is_visible){
	if(facing_left){
		if(moving){
			draw_sprite(asset_get_index(move_left), image_index, x, y);
		} else {
			draw_sprite(asset_get_index(idle_left), image_index, x, y);
		}
	} else {
		if(moving){
			draw_sprite(asset_get_index(move_right), image_index, x, y);
		} else {
			draw_sprite(asset_get_index(idle_right), image_index, x, y);
		}
	}
}
//draw_sprite(spr_player_idle, image_index, x + 100, y + 100);