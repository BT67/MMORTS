if(focused) {
	draw_circle_colour(x + 16, y + 16, 16, c_green, c_green, true);
	if(distance_to_point(dest_x, dest_y) > 20){
		draw_circle_colour(dest_x, dest_y, 16, c_yellow, c_yellow, true);
	}
}
if(attacking){
	//set player object invisible
	//Create player attack object that destroys itself when the animatino ends
	//set player object visible again when player attack object animation ends
}
draw_self();
//draw_healthbar(x, y + 20, x + 20, y + 25, entity_health, c_red, c_lime, c_lime, 0, true, true);





