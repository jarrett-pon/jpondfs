//Takes data in form of objects with player, status, playerteam, position, salary, points
//Takes in player array and appends to corresponding selector
function paginate_data(player_array,player_type,start_index = 0){
	var max_results_per_page = 25,
		page_total = Math.ceil(player_array.length/max_results_per_page),
		results_total = player_array.length,
		$tbody_selector = $('.'+ player_type + 'Table'),
		$pagination_selector = $('.'+ player_type + 'Pagination'),
		$pages_selector = $pagination_selector.find('.pages'),
		page_number = Math.ceil(start_index/max_results_per_page) + 1,
		results_per_page = results_total < max_results_per_page*page_number ? results_total-max_results_per_page*(page_number-1) : max_results_per_page;

	$tbody_selector.empty();
	for(var i = start_index; i < start_index + results_per_page; i++){
		var counter = i + 1;
		$tbody_selector.append("<tr><th>" + counter + ". " + player_array[i]["player"] +"</th><th>"+ player_array[i]["status"]+"</th><th>"+ player_array[i]["playerteam"]+"</th><th>"+player_array[i]["position"]+"</th><th>"+player_array[i]["salary"]+"</th><th><input type='text' maxlength = '5' class = 'form-control points-input' data-player-type = '"+player_type+"' value = "+player_array[i]["points"]+"></th><th><img class = 'removePlayer' src = 'img/remove.png'</th></tr>");
	}
	$pages_selector.empty();
	$pages_selector.append("Page " + page_number + " out of " + page_total);
	$pagination_selector.data('index', start_index);
	if(page_total > page_number){
		$pagination_selector.find('.next').removeClass('hidden');
	}
	else{
		$pagination_selector.find('.next').addClass('hidden');
	}
	if(page_number > 1){
		$pagination_selector.find('.previous').removeClass('hidden');
	}
	else{
		$pagination_selector.find('.previous').addClass('hidden');
	}

};
