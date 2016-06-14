<?php
	require('database_config.php');
	require('simple_html_dom.php');
	$data_array =[];
	$count = 1;

	while (true){
		$stats_page = file_get_html("http://espn.go.com/mlb/stats/batting/_/count/$count/qualified/false/minpa/25");
		$expanded_stats_page = file_get_html("http://espn.go.com/mlb/stats/batting/_/count/$count/qualified/false/type/expanded/minpa/25");

		if (empty($stats_page->find('.oddrow'))){
			break;
		}

		foreach ($stats_page->find('.oddrow, .evenrow') as $index => $row) {
			$player = $row->find('td')[1]->plaintext;
			$avg = $row->find('td')[14]->plaintext;
			$obp = $row->find('td')[15]->plaintext;
			$slg = $row->find('td')[16]->plaintext;
			$ops = $row->find('td')[17]->plaintext;
			$sb = $row->find('td')[10]->plaintext;
			$rbi = $row->find('td')[9]->plaintext;
			$runs = $row->find('td')[4]->plaintext;
			$hr = $row->find('td')[8]->plaintext;
			$walks = $row->find('td')[12]->plaintext;
			$gp = $expanded_stats_page->find('.oddrow, .evenrow')[$index]->find('td')[3]->plaintext;
			array_push($data_array, ["player"=>$player,"avg"=>$avg,"obp"=>$obp,"slg"=>$slg,"ops"=>$ops,"sb"=>$sb,"rbi"=>$rbi,"runs"=>$runs,"hr"=>$hr,"walks"=>$walks,"gp"=>$gp]);
		}
		$count += 40;
	}

	$conn->query("DROP TABLE IF EXISTS batters_stats");
	$conn->query("CREATE TABLE batters_stats(`id` int(10) unsigned NOT NULL AUTO_INCREMENT, player varchar(255) NOT NULL, avg decimal(4,3) unsigned NOT NULL, obp decimal(4,3) unsigned NOT NULL, slg decimal(4,3) unsigned NOT NULL, ops decimal(4,3) unsigned NOT NULL, sb int(10) unsigned NOT NULL, rbi int(10) unsigned NOT NULL, runs int(10) unsigned NOT NULL, hr int(10) unsigned NOT NULL, walks int(10) unsigned NOT NULL, gp int(10) unsigned NOT NULL, PRIMARY KEY(`id`), INDEX(player))");
	foreach ($data_array as $item){
		$columns = implode(", ",array_keys($item));
		$escaped_values = array_map(array($conn, 'real_escape_string'), array_values($item));
		$values = implode("', '",$escaped_values);
		$conn->query("INSERT INTO batters_stats ($columns) VALUES ('$values')");
	}
?>

