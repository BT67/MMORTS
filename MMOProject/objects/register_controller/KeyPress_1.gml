if(keyboard_key == vk_tab){
	array_foreach(elements, set_focused_false);
	elements[tab_index].focused = true;
	tab_index += 1;
	//show_debug_message("tabIndex:" + string(tab_index));
	if(tab_index > 4){
		tab_index = 0;
	}
}



