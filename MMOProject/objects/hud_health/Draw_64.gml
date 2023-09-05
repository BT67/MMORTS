try{
	prev_health = player.entity_health;
	max_health = player.entity_max_health;
} catch(error){
	prev_health = 0;
}



draw_healthbar(view_width - health_bar_width, 0, view_width + health_bar_width, health_bar_height, prev_health, c_black, c_red, c_red, 0, true, true);
draw_set_halign(fa_center);
draw_set_valign(fa_middle);
draw_text(view_width, health_bar_height/2, string(prev_health) + "/" + string(max_health));
draw_set_halign(fa_left);
draw_set_valign(fa_top);

