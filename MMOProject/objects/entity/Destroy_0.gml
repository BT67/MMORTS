var obj = "";
is_visible = false;
audio_play_sound(asset_get_index(death_sound), 10, false);
with(instance_create_layer(x, y, "Instances", asset_get_index(death_anim))){
	obj = other;
}
instance_destroy();