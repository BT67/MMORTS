if(focused && !(position_meeting(mouse_x, mouse_y, entity))){
	show_debug_message("Writing packet");
	var entity_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(entity_packet, buffer_string, "ENTITY");
	buffer_write(entity_packet, buffer_string, string(mouse_x));
	buffer_write(entity_packet, buffer_string, string(mouse_y));
	network_write(network.socket, entity_packet);
}
