//Connect to server

saved_buffer = buffer_create(1, buffer_grow, 1);
reading = 0;
cut_buffer = buffer_create(1, buffer_grow, 1);
buffer_size = 0;

socket = network_create_socket(network_socket_tcp);
network_connect_raw(socket, "127.0.0.1", 8082);


