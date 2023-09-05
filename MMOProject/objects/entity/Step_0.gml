//if(x != target_x || y != target_y){
//move_towards_point(target_x, target_y, 1);	
//}

path_delete(path);
path = path_add();
mp_potential_path(path, real(target_x), real(target_y), move_speed, 4, 0);


//mp_linear_step_object(target_x, target_y, move_speed, wall);
path_start(path, move_speed, path_action_stop, true);


