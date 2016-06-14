<?php
	require('database_config.php');
	require('simple_html_dom.php');
	$runs_array = [];
	$hr_array = [];
	$park_array = ["LAA", "SF", "STL", "ARI", "NYM", "PHI", "DET", "COL", "LAD", "BOS", "TEX", "CIN", "KC", "MIA", "MIL", "HOU", "WAS", "OAK", "BAL", "SD", "PIT", "CLE", "TOR", "SEA", "MIN", "TB", "ATL", "CWS", "CHC", "NYY"];
	$data_array = [];
	$stats_page = file_get_html("http://espn.go.com/mlb/stats/parkfactor/_/sort/venueName");

	foreach ($stats_page->find('.oddrow, .evenrow') as $row) {
		$runs = $row->find('td')[2]->plaintext;
		$hr = $row->find('td')[3]->plaintext;
		array_push($runs_array, $runs);
		array_push($hr_array, $hr);		
	}

	for ($i = 0; $i < 30; $i++){
		array_push($data_array, ["park"=>$park_array[$i], "park_runs"=>$runs_array[$i], "park_hr"=>$hr_array[$i]]);
	}
	$conn->query("DROP TABLE IF EXISTS park_factor");
	$conn->query("CREATE TABLE park_factor(`id` int(10) unsigned NOT NULL AUTO_INCREMENT, park varchar(255) NOT NULL, park_runs decimal(4,3) unsigned NOT NULL, park_hr decimal(4,3) unsigned NOT NULL, PRIMARY KEY(`id`), INDEX(park))");
	foreach ($data_array as $item){
		$columns = implode(", ",array_keys($item));
		$escaped_values = array_map(array($conn, 'real_escape_string'), array_values($item));
		$values = implode("', '",$escaped_values);
		$conn->query("INSERT INTO park_factor ($columns) VALUES ('$values')");
	}
	
?>