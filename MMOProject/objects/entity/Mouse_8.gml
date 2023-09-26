for(i = 0; i < instance_number(entity); ++i;) {
	if(instance_find(entity, i).entity_name == network.username && instance_find(entity, i).focused){
		if(entity_name != network.username){
			variable_instance_set(instance_find(entity, i), "target_entity", entity_name);
			var attack_packet = buffer_create(1, buffer_grow, 1);
			buffer_write(attack_packet, buffer_string, "ATTACK");
			buffer_write(attack_packet, buffer_string, string(entity_name));
			network_write(network.socket, attack_packet);
		}
	}
}


