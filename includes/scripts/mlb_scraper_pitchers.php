<?php
	require('database_config.php');
	require('simple_html_dom.php');
	$data_array =[];
	$count = 1;

	while (true){
		$stats_page = file_get_html("http://espn.go.com/mlb/stats/pitching/_/count/$count/qualified/false/order/false/minip/30");
		$expanded_stats_page = file_get_html("http://espn.go.com/mlb/stats/pitching/_/count/$count/qualified/false/type/opponent-batting/order/false/minip/30");

		if (empty($stats_page->find('.oddrow'))){
			break;
		}

		foreach ($stats_page->find('.oddrow, .evenrow') as $index => $row) {
			$player = $row->find('td')[1]->plaintext;
			$ip = $row->find('td')[5]->plaintext;
			$so = $row->find('td')[10]->plaintext;
			$wins = $row->find('td')[11]->plaintext;
			$whip = $row->find('td')[16]->plaintext;
			$era = $row->find('td')[17]->plaintext;
			$walks = $row->find('td')[9]->plaintext;
			$gp = $row->find('td')[3]->plaintext;
			$ops = $expanded_stats_page->find('.oddrow, .evenrow')[$index]->find('td')[16]->plaintext;
			array_push($data_array, ["player"=>$player,"ip"=>$ip,"so"=>$so,"wins"=>$wins,"whip"=>$whip,"era"=>$era,"walks"=>$walks,"ops"=>$ops,"gp"=>$gp]);
		}
		$count += 40;
	}
	$conn->query("DROP TABLE IF EXISTS pitchers_stats");
	$conn->query("CREATE TABLE pitchers_stats(`id` int(10) unsigned NOT NULL AUTO_INCREMENT, player varchar(255) NOT NULL, ip decimal(4,1) unsigned NOT NULL, so int(10) unsigned NOT NULL, wins int(10) unsigned NOT NULL, whip decimal(4,3) unsigned NOT NULL, era decimal(4,2) unsigned NOT NULL, walks int(10) unsigned NOT NULL, ops decimal(4,3) unsigned NOT NULL, gp int(10) unsigned NOT NULL, PRIMARY KEY(`id`), INDEX(player))");
	foreach ($data_array as $item){
		$columns = implode(", ",array_keys($item));
		$escaped_values = array_map(array($conn, 'real_escape_string'), array_values($item));
		$values = implode("', '",$escaped_values);
		$conn->query("INSERT INTO pitchers_stats ($columns) VALUES ('$values')");
	}
?>