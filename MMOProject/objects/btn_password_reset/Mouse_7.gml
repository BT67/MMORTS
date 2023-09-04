event_inherited();

focused = true;
//reset_controller.tab_index = 3;

var reset_packet = buffer_create(1, buffer_grow, 1);
buffer_write(reset_packet, buffer_string, "RESETPASSWORD");
buffer_write(reset_packet, buffer_string, txt_email_reset.text);
network_write(network.socket, reset_packet);



