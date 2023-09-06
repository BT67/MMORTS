var i = 0
for(i = 0; i < instance_number(entity); ++i;) {
	if(instance_find(entity, i).entity_name == network.username){
		entity_index = i;
		break;
	}
}

if(instance_find(entity, entity_index).focused){
	if(entity_name != network.username){
		variable_instance_set(instance_find(entity, entity_index), "target_entity", entity_name);
		var attack_packet = buffer_create(1, buffer_grow, 1);
		buffer_write(attack_packet, buffer_string, "ATTACK");
		buffer_write(attack_packet, buffer_string, string(entity_name));
		network_write(network.socket, attack_packet);
	}
}


