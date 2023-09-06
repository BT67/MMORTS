var obj = "";
with(instance_create_layer(x, y, "Instances", player_death)){
	obj = other;
}
instance_destroy();