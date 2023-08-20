//write packet back to the server
function network_write(socket, data_buffer){
	var packet_size = buffer_tell(data_buffer);
	var buffer_packet = buffer_create(1, buffer_grow, 1);
	//Write size and packet into the buffer packet
	buffer_write(buffer_packet, buffer_u16, string(packet_size + 1));
	buffer_copy(data_buffer, 0, packet_size, buffer_packet, 1);
	buffer_seek(buffer_packet, 0, packet_size + 1);
	//Send the packet to the server
	network_send_raw(socket, buffer_packet, buffer_tell(buffer_packet));
	//Destroy used buffer
	buffer_delete(data_buffer);
	buffer_delete(buffer_packet);
}