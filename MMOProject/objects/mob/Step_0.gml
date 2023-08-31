if(target_entity != ""){
	move_towards_point(target_entity.x, target_entity.y, move_speed);
} else if(x != target_x || y != target_y){
	move_towards_point(target_x, target_y, move_speed);	
}