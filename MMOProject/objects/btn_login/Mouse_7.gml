event_inherited();

var login_packet = buffer_create(1, buffer_grow, 1);
buffer_write(login_packet, buffer_string, "LOGIN");
buffer_write(login_packet, buffer_string, txt_username.text);
buffer_write(login_packet, buffer_string, txt_password.text);
network_write(network.socket, login_packet);


