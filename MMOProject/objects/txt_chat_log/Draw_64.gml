draw_self();

if(array_length(chat_log) > display_length){
	array_shift(chat_log);
}


for(var i = 0; i < array_length(chat_log); ++i){
	chat_text += chat_log[i] + "\n";
}

draw_text(x, y, string(chat_text));
chat_text = "";