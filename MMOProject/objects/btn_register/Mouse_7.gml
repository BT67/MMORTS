event_inherited();

focused = true;
register_controller.tab_index = 4;

var register_packet = buffer_create(1, buffer_grow, 1);
buffer_write(register_packet, buffer_string, "REGISTER");
buffer_write(register_packet, buffer_string, txt_email_register.text);
buffer_write(register_packet, buffer_string, txt_username_register.text);
buffer_write(register_packet, buffer_string, txt_password_register.text);
network_write(network.socket, register_packet);