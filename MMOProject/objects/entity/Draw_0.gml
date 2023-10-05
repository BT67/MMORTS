if(focused) {
	if(entity_name == network.username){
		draw_circle_colour(x, y, 16, c_green, c_green, true);
		try{
			if(target_entity == "" && distance_to_point(dest_x, dest_y) > 2){
				draw_circle_colour(dest_x, dest_y, 16, c_yellow, c_yellow, true);
			} 
		} catch(error) {
				
		}
	} else {
		draw_circle_colour(x, y, 16, c_red, c_red, true);	
	}
}

draw_self()