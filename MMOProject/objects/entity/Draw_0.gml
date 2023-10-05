if(focused) {
	if(entity_name == network.username){
		draw_circle_colour(x + 16, y + 16, 16, c_green, c_green, true);
		try{
			if(target_entity == "" && distance_to_point(dest_x, dest_y) > 2){
				draw_circle_colour(dest_x, dest_y, 16, c_yellow, c_yellow, true);
			} 
		} catch(error) {
				
		}
	} else {
		draw_circle_colour(x + 16, y + 16, 16, c_red, c_red, true);	
	}
}

draw_self()

/*
spr_rotation = 0;

draw_sprite_general(
	asset_get_index(base_sprite),
	image_index,
	0,
	0,
	0,
	0,
	x,
	y,
	1,
	1,
	spr_rotation,
	c_white,
	c_white,
	c_white,
	c_white,
	1
);
*/