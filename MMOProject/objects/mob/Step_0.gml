path_delete(path);
path = path_add();

if(target_entity != ""){
	mp_potential_path(path, real(target_entity.x), real(target_entity.y), move_speed, 4, 0);
	path_start(path, move_speed, path_action_stop, true);
	//mp_linear_step_object(target_x, target_y, move_speed, wall);

} else {
	mp_potential_path(path, real(target_x), real(target_y), move_speed, 4, 0);
	path_start(path, move_speed, path_action_stop, true);
	//mp_linear_step_object(target_x, target_y, move_speed, wall);
}