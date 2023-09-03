view_pos_x = 0;
view_pox_y = 0;

#macro view_width 640
#macro view_height 360
#macro view_scale 1
#macro view_smooth 0.1

view_enabled = true;
view_visible[0] = true;

camera = camera_create_view(0,0,view_width, view_height);
view_set_camera(0, camera);

scroll_speed = 8;
zoom_speed = 0.1;

camera_width = camera_get_view_width(camera);
camera_height = camera_get_view_height(camera);

hud_elements = [btn_logout_hud, btn_quit_hud, txt_chat_input, txt_chat_log];
