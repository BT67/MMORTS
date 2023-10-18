if(instance_exists(player)){
	if(distance_to_object(player) < player.view_range && is_visible){
		visible = true;
	} else {
		visible = false;
	}
}

