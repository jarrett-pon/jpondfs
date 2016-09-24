function search_players(player_array, regex, player_type){
	var $tbody_selector = $('.'+ player_type + 'Table'),
		$pages_selector = $('.'+ player_type + 'Pagination').find('.pages'),
		$next_selector = $('.'+ player_type + 'Pagination').find('.next'),
		$previous_selector = $('.'+ player_type + 'Pagination').find('.previous'),
		counter = 1;
	$tbody_selector.empty();
	$pages_selector.empty();
	$next_selector.addClass('hidden');
	$previous_selector.addClass('hidden');
	for(var key in player_array){
		if(regex.test(player_array[key]["player"])){
			$tbody_selector.append("<tr><th>" + counter + ". " + player_array[key]["player"] +"</th><th>"+ player_array[key]["status"]+"</th><th>"+ player_array[key]["playerteam"]+"</th><th>"+player_array[key]["position"]+"</th><th>"+player_array[key]["salary"]+"</th><th><input type='text' maxlength = '5' class = 'form-control points-input' data-player-type = '"+player_type+"' value = "+player_array[key]["points"]+"></th><th><img class = 'removePlayer' src = 'img/remove.png'</th></tr>");
			counter++;
		}
	}
};
