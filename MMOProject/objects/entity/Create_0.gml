entity_name = "";
target_x = x;
target_y = y;
moving = false;
focused = false;
//Facing: 1=left. 0=right
facing_left = false;
target_entity = "";
entity_max_health = 0;
entity_health = entity_max_health;
move_speed = 1;
path = path_add();
dest_x = x;
dest_y = y;
remainder = 0;
image_alpha = 0;
attacking = false;
is_visible = true;
entity_index = 0;
idle_right = "";
move_right = "";
attack_right = "";
death_right = "";
idle_left = "";
move_left = "";
attack_left = "";
death_left = "";
animations_created = false;
attack_sound = "";
death_sound = "";