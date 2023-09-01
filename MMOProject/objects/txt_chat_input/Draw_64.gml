draw_self();

if(focused){
	draw_rectangle(x-2, y-2, x + (sprite_get_width(sprite_index) * image_xscale) + 2, y + (sprite_get_width(sprite_index) * image_yscale) + 2, 2);
}

draw_text(x, y, string(network.username) + ": " + string(text));

