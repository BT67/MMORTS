if(focused && !(position_meeting(mouse_x, mouse_y, entity))){
	show_debug_message("Writing packet");
	var entity_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(entity_packet, buffer_string, "POS");
	buffer_write(entity_packet, buffer_string, string(mouse_x));
	buffer_write(entity_packet, buffer_string, string(mouse_y));
	network_write(network.socket, entity_packet);
}

if(focused && !(position_meeting(mouse_x, mouse_y, entity))){
	target_entity = "";
	
	remainder = round(mouse_x) % 32;
	if(remainder == 0){
		dest_x = round(mouse_x);
	} else {
		dest_x = round(mouse_x) - floor(remainder);	
	}

	remainder = mouse_y % 32;
	if(remainder == 0){
		dest_y = round(mouse_y);
	} else {
		dest_y = round(mouse_y) - floor(remainder);	
	}

	dest_x += 16;
	dest_y += 16;
}
