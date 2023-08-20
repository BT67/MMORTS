event_inherited();

focused = true;
login_controller.tab_index = 3;

var login_packet = buffer_create(1, buffer_grow, 1);
buffer_write(login_packet, buffer_string, "LOGIN");
buffer_write(login_packet, buffer_string, txt_username_login.text);
buffer_write(login_packet, buffer_string, txt_password_login.text);
network_write(network.socket, login_packet);



