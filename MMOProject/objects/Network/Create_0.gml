//Connect to server

refresh_timer = 0;
refresh_timeout = 1000;
saved_buffer = buffer_create(1, buffer_grow, 1);
reading = 0;
cut_buffer = buffer_create(1, buffer_grow, 1);
buffer_size = 0;
server_text = "";
room_name = room_get_name(room);
username = "";
var_player = "";
target_entity = "";
map_width = 0;
map_height = 0;


socket = network_create_socket(network_socket_tcp);
network_connect_raw(socket, "127.0.0.1", 8082);


