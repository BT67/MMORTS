if(hover){
	draw_sprite_ext(sprite_index, image_index, x, y, image_xscale, image_yscale, image_angle, c_gray, 1.0);
} else {
	draw_self();	
}


if(focused){
	draw_rectangle(x-2, y-2, x + (sprite_get_width(sprite_index) * image_xscale) + 2, y + (sprite_get_width(sprite_index) * image_yscale) + 2, 2);
}

draw_text(x + 3, y + 8, string(text));

