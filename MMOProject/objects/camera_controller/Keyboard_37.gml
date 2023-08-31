pos_x = camera_get_view_x(camera_get_active());
pos_y = camera_get_view_y(camera_get_active());
show_debug_message(string(pos_x) + "," + string(pos_y));

camera_set_view_pos(camera_get_active(), pos_x - scroll_speed, pos_y);

show_debug_message("left");
show_debug_message(string(camera_get_view_x(camera_get_active())) + "," + string(camera_get_view_y(camera_get_active())));