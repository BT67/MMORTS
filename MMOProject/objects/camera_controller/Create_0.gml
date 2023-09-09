#macro view_width 900
#macro view_height 506
#macro view_scale 1
#macro view_smooth 0.1

try{
	view_pos_x = player.x - (view_width/2);
	view_pos_y = player.y - (view_height/2);
} catch(error){
	view_pos_x = 0;
	view_pos_y = 0;
}
	
view_enabled = true;
view_visible[0] = true;

camera = camera_create_view(view_pos_x,view_pos_y,view_width, view_height);
view_set_camera(0, camera);

scroll_speed = 8;
zoom_speed = 0.3;

camera_width = camera_get_view_width(camera);
camera_height = camera_get_view_height(camera);

hud_elements = [btn_logout_hud, btn_quit_hud, txt_chat_input, txt_chat_log];
