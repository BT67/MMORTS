if(instance_exists(player)){
	if(distance_to_object(player) < player.view_range){
		visible = true
		image_alpha = 1;	
	} else {
		image_alpha = 0.5;
	}
}


