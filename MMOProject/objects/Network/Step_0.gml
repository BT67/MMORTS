function playAudio(audio){
	if(audio_is_playing(audio)){

	} else {
		audio_play_sound(audio,5,true);
	}
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
	case "zone2":
		playAudio(zone2_amb);
		break;
}
















