show_debug_message(date_datetime_string(date_current_datetime()) + " Networking event encountered");

switch(async_load[? "type"]){
	case network_type_data:
		buffer_copy(async_load[? "buffer"],0,async_load[? "size"], saved_buffer, buffer_tell(saved_buffer));
		buffer_seek(saved_buffer, buffer_seek_relative, async_load[? "size"] + 1);
		//While there is still data in the packet to read;
		while (true){
			buffer_size = buffer_peek(saved_buffer, 0, buffer_u8);
			if(buffer_get_size(saved_buffer) >= reading + buffer_size) {
				buffer_copy(saved_buffer, reading, buffer_size, cut_buffer, 0);
				buffer_seek(cut_buffer, 0, 1);
				handle_packet(cut_buffer);
				//If have not reached end of the packet;
				if(buffer_get_size(saved_buffer) != reading + buffer_size){
					reading += buffer_size;
				} else {
				//Resize the reading packet back to ;
				buffer_resize(saved_buffer, 1);
				reading = 0;
				break;
				}
			} else {
				break;
			}	
		}		
		break;
}
