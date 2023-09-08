if(x != target_x ||
	y != target_y){
	moving = true;
} else {
	moving = false;	
}

if(target_x < x){
	facing_left = true;
} else if(target_x > x){
	facing_left = false;
}

path_delete(path);
path = path_add();
mp_potential_path(path, real(target_x), real(target_y), move_speed, 4, 0);
path_start(path, move_speed, path_action_stop, true);


