for(var i = 0; i < instance_number(entity); ++i){
	if(instance_find(entity, i).entity_name == parent_entity){
		variable_instance_set(instance_find(entity,i), "visible", true);
		variable_instance_set(instance_find(entity,i), "is_visible", true);
		break;
	} 
}
instance_destroy();



