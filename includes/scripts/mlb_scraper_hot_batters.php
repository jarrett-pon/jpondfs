<?php
	require('database_config.php');
	require('simple_html_dom.php');
	$data_array =[];
	$count = 1;

	while (true){
		$stats_page = file_get_html("http://espn.go.com/mlb/stats/batting/_/split/61/count/$count/qualified/false/minpa/20");

		if (empty($stats_page->find('.oddrow'))){
			break;
		}

		foreach ($stats_page->find('.oddrow, .evenrow') as $row) {
			$player = $row->find('td')[1]->plaintext;
			$ops = $row->find('td')[17]->plaintext;
			array_push($data_array, ["player"=>$player,"hot_ops"=>$ops]);
		}
		$count += 40;
	}
	$conn->query("DROP TABLE IF EXISTS hot_batters_stats");
	$conn->query("CREATE TABLE hot_batters_stats(`id` int(10) unsigned NOT NULL AUTO_INCREMENT, player varchar(255) NOT NULL, hot_ops decimal(4,3) unsigned NOT NULL, PRIMARY KEY(`id`), INDEX(player))");
	foreach ($data_array as $item){
		$columns = implode(", ",array_keys($item));
		$escaped_values = array_map(array($conn, 'real_escape_string'), array_values($item));
		$values = implode("', '",$escaped_values);
		$conn->query("INSERT INTO hot_batters_stats ($columns) VALUES ('$values')");
	}
	
?>