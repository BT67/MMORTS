if(focused) {
	draw_circle_colour(x + real(sprite_width/2), y + real(sprite_height/2), 16, c_green, c_green, true);
	if(distance_to_point(dest_x, dest_y) > 15){
		draw_circle_colour(dest_x, dest_y, 16, c_yellow, c_yellow, true);
	} else {
		dest_x = x;
		dest_y = y;
	}
}
draw_self();
//draw_healthbar(x, y + 20, x + 20, y + 25, entity_health, c_red, c_lime, c_lime, 0, true, true);



