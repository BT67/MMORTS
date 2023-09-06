is_visible = false;
for(var i = 0; i < instance_number(asset_get_index(move_anim)); ++i){
	if(instance_find(asset_get_index(move_anim), i).parent_entity == entity_name){
		variable_instance_set(instance_find(asset_get_index(move_anim), i), "is_visible", false);
		break;
	}
}
var cont = true;
for(var i = 0; i < instance_number(asset_get_index(attack_anim)); ++i){
	if(instance_find(asset_get_index(attack_anim), i).parent_entity == entity_name){
			cont = false;
	}
}
is_visible = cont;




