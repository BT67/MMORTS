if(typeof(target_entity) == "string"){
	if(other.entity_name == target_entity){
		instance_destroy();	
	}
} else if(other.entity_name == target_entity.entity_name){
	instance_destroy();	
}


