var obj = "";
audio_play_sound(asset_get_index(death_sound), 10, false);
with(instance_create_layer(x, y, "Entities", asset_get_index(death_animation_ref))){
	obj = other;
}
instance_destroy();