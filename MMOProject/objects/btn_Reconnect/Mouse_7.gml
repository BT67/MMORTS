event_inherited();

focused = true;

network.socket = network_create_socket(network_socket_tcp);
network_connect_raw(network.socket, "127.0.0.1", 8082);





