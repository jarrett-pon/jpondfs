<?php
	require('database_config.php');
	require('simple_html_dom.php');
	
	$data_array =[];

	$stats_page = file_get_html("http://espn.go.com/mlb/stats/team/_/stat/batting");
	$expanded_stats_page = file_get_html("http://espn.go.com/mlb/stats/team/_/stat/batting/type/expanded");

	//function to change team name from full city to abbreviation 
	function convert_city_to_abbrev($city){
		switch ($city){
			case "Boston":
				return "BOS";
			case "St. Louis":
				return "STL";
			case "Chicago Cubs":
				return "CHC";
			case "Colorado":
				return "COL";
			case "Seattle":
				return "SEA";
			case "Texas":
				return "TEX";
			case "Toronto":
				return "TOR";
			case "Detroit":
				return "DET";
			case "Washington":
				return "WAS";
			case "Baltimore":
				return "BAL";
			case "Cleveland":
				return "CLE";
			case "Pittsburgh":
				return "PIT";
			case "Arizona":
				return "ARI";
			case "San Francisco":
				return "SF";
			case "Cincinnati":
				return "CIN";
			case "LA Dodgers":
				return "LAD";
			case "LA Angels":
				return "LAA";
			case "Houston":
				return "HOU";
			case "San Diego":
				return "SD";
			case "Miami":
				return "MIA";
			case "Milwaukee":
				return "MIL";
			case "Kansas City":
				return "KC";
			case "NY Yankees":
				return "NYY";
			case "Chicago Sox":
				return "CWS";
			case "Tampa Bay":
				return "TB";
			case "Oakland":
				return "OAK";
			case "Minnesota":
				return "MIN";
			case "NY Mets":
				return "NYM";
			case "Atlanta":
				return "ATL";
			case "Philadelphia":
				return "PHI";
		}
	}

	foreach ($stats_page->find('.oddrow, .evenrow') as $index => $row) {
		$team = convert_city_to_abbrev($row->find('td')[1]->plaintext);
		$avg = $row->find('td')[11]->plaintext;
		$gp = $row->find('td')[2]->plaintext;
		$so = $expanded_stats_page->find('.oddrow, .evenrow')[$index]->find('td')[2]->plaintext;
		array_push($data_array, ["team"=>$team,"team_avg"=>$avg,"team_so"=>$so,"team_gp"=>$gp]);
	}

	$conn->query("DROP TABLE IF EXISTS team_batting_stats");
	$conn->query("CREATE TABLE team_batting_stats(`id` int(10) unsigned NOT NULL AUTO_INCREMENT, team varchar(255) NOT NULL, team_avg decimal(4,3) unsigned NOT NULL, team_so int(10) unsigned NOT NULL, team_gp int(10) unsigned NOT NULL, PRIMARY KEY(`id`), INDEX(team))");
	foreach ($data_array as $item){
		$columns = implode(", ",array_keys($item));
		$escaped_values = array_map(array($conn, 'real_escape_string'), array_values($item));
		$values = implode("', '",$escaped_values);
		$conn->query("INSERT INTO team_batting_stats ($columns) VALUES ('$values')");
	}
	
?>