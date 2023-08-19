draw_self();

if(focused){
	draw_rectangle(x-2, y-2, x + (sprite_get_width(sprite_index) * image_xscale) + 2, y + (sprite_get_width(sprite_index) * image_yscale) + 2, 2);
}

if(string_length(text) > 0 || focused){
	draw_text(x + 3, y + 8, string(text));	
}



