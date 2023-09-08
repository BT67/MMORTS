is_visible = false;
for(var i = 0; i < instance_number(asset_get_index(move_right)); ++i){
	if(instance_find(asset_get_index(move_right), i).parent_entity == entity_name){
		variable_instance_set(instance_find(asset_get_index(move_right), i), "is_visible", false);
		break;
	}
}
for(var i = 0; i < instance_number(asset_get_index(move_left)); ++i){
	if(instance_find(asset_get_index(move_left), i).parent_entity == entity_name){
		variable_instance_set(instance_find(asset_get_index(move_left), i), "is_visible", false);
		break;
	}
}
var cont = true;
for(var i = 0; i < instance_number(asset_get_index(attack_right)); ++i){
	if(instance_find(asset_get_index(attack_right), i).parent_entity == entity_name){
		cont = false;
		break;
	}
}
for(var i = 0; i < instance_number(asset_get_index(attack_left)); ++i){
	if(instance_find(asset_get_index(attack_left), i).parent_entity == entity_name){
		cont = false;
		break;
	}
}
is_visible = cont;




