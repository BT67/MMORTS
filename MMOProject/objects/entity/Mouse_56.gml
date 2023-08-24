if(mouse_x < x) ||
	(mouse_x > x + 16) ||
	(mouse_y < y) ||
	(mouse_y > y + 16)
	{
	focused = false;
}
show_debug_message("unfocused " + string(entity_name));



