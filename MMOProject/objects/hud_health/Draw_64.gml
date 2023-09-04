draw_healthbar(view_width - health_bar_width, 0, view_width + health_bar_width, health_bar_height, player.entity_health, c_black, c_red, c_red, 0, true, true);
draw_set_halign(fa_center);
draw_set_valign(fa_middle);
draw_text(view_width, health_bar_height/2, string(player.entity_health) + "/" + string(player.entity_max_health));

