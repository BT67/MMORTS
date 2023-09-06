for(var i = 0; i < instance_number(entity); ++i){
	if(instance_find(entity, i).entity_name == parent_entity){
		x = instance_find(entity, i).x;
		y = instance_find(entity, i).y;
		break;
	}
}