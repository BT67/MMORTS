event_inherited();

focused = true;

var login_packet = buffer_create(1, buffer_grow, 1);
buffer_write(login_packet, buffer_string, "LOGOUT");
network_write(network.socket, login_packet);

room_goto(rm_login);




