var obj = "";
is_visible = false;

audio_play_sound(asset_get_index(death_sound), 10, false);

if(facing_left){
	with(instance_create_layer(x, y, "Entities", asset_get_index(death_left))){
		obj = other;
	}
} else {
	with(instance_create_layer(x, y, "Entities", asset_get_index(death_right))){
		obj = other;
	}	
}
instance_destroy();