path_delete(path);
path = path_add();
mp_potential_path(path, real(target_x), real(target_y), move_speed, 4, 0);
path_start(path, move_speed, path_action_stop, true);

var target_entity_x = "";
var target_entity_y = "";

image_angle = direction;




