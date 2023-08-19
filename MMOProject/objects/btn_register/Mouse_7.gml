event_inherited();

var register_packet = buffer_create(1, buffer_grow, 1);
buffer_write(register_packet, buffer_string, "REGISTER");
buffer_write(register_packet, buffer_string, txt_username.text);
buffer_write(register_packet, buffer_string, txt_password.text);
network_write(network.socket, register_packet);

