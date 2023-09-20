function playAudio(audio){
	if(audio_is_playing(audio)){

	} else {
		audio_play_sound(audio,5,true);
	}
}

refresh_timer += 1;

if(refresh_timer % 3000 == 0){
	var refresh_packet = buffer_create(1, buffer_grow, 1);
	buffer_write(refresh_packet, buffer_string, "REFRESH");
	network_write(network.socket, refresh_packet);
}

if(refresh_timer >= refresh_timeout){
	show_debug_message("Connection Lost");
	instance_destroy(entity);
	instance_destroy(attack);
	instance_destroy(animation);
	instance_destroy(wall);
	instance_destroy(door);
	audio_stop_all();
	room_goto(rm_connection_lost);
	username = "";
	var_player = "";
	target_entity = "";  
	refresh_timer = 0;
}

room_name = room_get_name(room);

switch(room_name){
	case "rm_init":
		playAudio(menu_bgm);
		break;
	case "rm_login":
		playAudio(menu_bgm);
		break;
	case "rm_password_reset":
		playAudio(menu_bgm);
		break;
	case "rm_register":
		playAudio(menu_bgm);
		break;
	case "rm_register_success":
		playAudio(menu_bgm);
		break;
	case "zone1":
		playAudio(zone1_amb);
		break;
	case "rm_random":
		playAudio(zone2_amb);
		break;
	case "rm_connection_lost":
		audio_stop_all();
		break;	
}
















