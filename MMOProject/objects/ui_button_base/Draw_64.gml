draw_self();	

draw_rectangle_colour(x-2, y-2, x + (sprite_get_width(sprite_index) * image_xscale) + 1, y + (sprite_get_width(sprite_index) * image_yscale) + 1, c_black, c_black, c_black, c_black, 2);

draw_set_halign(fa_center);
draw_set_valign(fa_middle);
draw_text(x + button_width/2, y + button_height/2, string(text));
draw_set_halign(fa_left);
draw_set_valign(fa_top);



