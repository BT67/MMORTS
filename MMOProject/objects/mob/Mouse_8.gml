if(player.focused == true){
	player.target_entity = self;
	var attack_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(attack_packet, buffer_string, "ATTACK");
	buffer_write(attack_packet, buffer_string, string(entity_name));
	network_write(network.socket, attack_packet);
}
