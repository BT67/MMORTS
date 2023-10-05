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
username_min_chars = 4;
username_max_chars = 30;
password_min_chars = 8;
password_max_chars = 30;
email_min_chars = 4;
email_max_chars = 40;
sprite_offset = 16;

lang_config = ds_map_create();
english = ds_map_create();
english[?"msg_username_length"] = "username must contain 8~30 characters ";
english[?"msg_password_length"] = "password must contain 8~30 characters";


lang_config[?"english"] = english;


socket = network_create_socket(network_socket_tcp);
network_connect_raw(socket, "127.0.0.1", 8082);


