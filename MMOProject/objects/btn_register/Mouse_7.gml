event_inherited();

focused = true;
register_controller.tab_index = 4;

var register_packet = buffer_create(1, buffer_grow, 1);
buffer_write(register_packet, buffer_string, "REGISTER");
buffer_write(register_packet, buffer_string, txt_username_login.text);
buffer_write(register_packet, buffer_string, txt_password_login.text);
network_write(network.socket, register_packet);



