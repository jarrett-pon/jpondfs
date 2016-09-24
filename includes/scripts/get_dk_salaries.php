<?php
	//Some names don't match in dk_salaries with scraped names from espn.com Currently the way around this is to change salaries names to source names
	//I am catching unmatched names as we go and adding them to a list:
	function edit_player_name($player_name){
		switch ($player_name){
			case "Norichika Aoki":
				return "Nori Aoki";
			case "Albert Almora Jr.":
				return "Albert Almora";
			case "Michael A. Taylor":
				return "Michael Taylor";
			case "Rob Refsnyder":
				return "Robert Refsnyder";
			case "Rickie Weeks Jr.":
				return "Rickie Weeks";
			case "Dae-Ho Lee":
				return "Dae Ho Lee";
			case "Ivan De Jesus Jr.":
				return "Ivan De Jesus";
			case "Tim Anderson":
				return "Timothy Anderson";
			case "Steven Souza Jr.":
				return "Steve Souza";
			case "Jung Ho Kang":
				return "Jung-Ho Kang";
			case "Jackie Bradley Jr.":
				return "Jackie Bradley";
			case "Joey Wendle":
				return "Joseph Wendle";
			case "Melvin Upton Jr.":
				return "Melvin Upton";
			case "Mike Clevinger":
				return "Michael Clevinger";
			case "Joe Musgrove":
				return "Joseph Musgrove";
			case "Buck Farmer":
				return "Joe Farmer";
			case "Manny Pina":
				return "Manuel Pina";
			default:
				return $player_name;
		}
	}
	function find_opp_team($gameinfo, $playerteam){
		$matchup = explode(" ",$gameinfo);
		$teams = explode("@",$matchup[0]);
		if ($teams[0] == $playerteam){
			return $teams[1];
		}
		else{
			return $teams[0];
		}
	}
	function find_park($gameinfo){
		$matchup = explode(" ",$gameinfo);
		$teams = explode("@",$matchup[0]);
		return $teams[1];
	}
	function get_dk_salaries($link){
		//Not automated, executed after prompted for download link.
	    require('database_config.php');
	    //check if link is correct format 
		if (strpos($link, "https://www.draftkings.com/lineup/getavailableplayerscsv?contestTypeId=28&draftGroupId=") === FALSE){
			return -1; //"Link provided was a download link, but not for MLB Draftkings Salaries"
		}
		$data = file_get_contents($link);
		if ($data === FALSE){
			return -2; //Could not open download link.
		}
		$rows = explode("\n",$data);
		$s = array();
		foreach($rows as $row) {
		    $s[] = str_getcsv($row);
		}
		//check if csv file has certain format
		if ($s[0][0] != "Position" || $s[0][1] != "Name" || $s[0][2] != "Salary" || $s[0][3] != "GameInfo" || $s[0][5] != "teamAbbrev"){
			return -3; //The link contains correct format for MLB Draftkings Salaries, but did not contain a csv file. 
		}
		//csv columns are:position,name,salary,gameinfo,avgpoints,team
	    $pitcher_array = [];
	    $batter_array = [];
	    for ($i = 1; $i < sizeof($s)-1; $i++){
	    	//if games are in progress, cannot get game info
	    	if ($s[$i][3] == "In Progress"){
	    		apologize("Some games are in progress, cannot use these Draftkings Salaries!");
	    	}
	    	$player = edit_player_name($s[$i][1]);
	    	$oppteam = find_opp_team($s[$i][3], $s[$i][5]);
	    	$park = find_park($s[$i][3]);
	    	if ($s[$i][0] == "SP" || $s[$i][0] == "RP"){
	    		array_push($pitcher_array,["position"=>$s[$i][0],"player"=>$player,"salary"=>$s[$i][2],"playerteam"=>strtoupper($s[$i][5]),"oppteam"=>strtoupper($oppteam),"park"=>strtoupper($park)]);
	    	}
	    	else{
	    		array_push($batter_array,["position"=>$s[$i][0],"player"=>$player,"salary"=>$s[$i][2],"playerteam"=>strtoupper($s[$i][5]),"oppteam"=>strtoupper($oppteam),"park"=>strtoupper($park)]);
	    	}
	    }

	    $conn->query("DROP TABLE IF EXISTS batter_dk_salaries");
		$conn->query("CREATE TABLE batter_dk_salaries(`id` int(10) unsigned NOT NULL AUTO_INCREMENT, position varchar(255) NOT NULL, player varchar(255) NOT NULL, salary int(10) unsigned NOT NULL, playerteam varchar(255) NOT NULL, oppteam varchar(255) NOT NULL, park varchar(255) NOT NULL, PRIMARY KEY(`id`), INDEX(player), INDEX(playerteam), INDEX(park))");
		foreach ($batter_array as $item){
			$columns = implode(", ",array_keys($item));
			$escaped_values = array_map(array($conn, 'real_escape_string'), array_values($item));
			$values = implode("', '",$escaped_values);
			$conn->query("INSERT INTO batter_dk_salaries ($columns) VALUES ('$values')");
		}

		$conn->query("DROP TABLE IF EXISTS pitcher_dk_salaries");
		$conn->query("CREATE TABLE pitcher_dk_salaries(`id` int(10) unsigned NOT NULL AUTO_INCREMENT, position varchar(255) NOT NULL, player varchar(255) NOT NULL, salary int(10) unsigned NOT NULL, playerteam varchar(255) NOT NULL, oppteam varchar(255) NOT NULL, park varchar(255) NOT NULL, PRIMARY KEY(`id`), INDEX(player), INDEX(playerteam), INDEX(oppteam), INDEX(park))");
		foreach ($pitcher_array as $item){
			$columns = implode(", ",array_keys($item));
			$escaped_values = array_map(array($conn, 'real_escape_string'), array_values($item));
			$values = implode("', '",$escaped_values);
			$conn->query("INSERT INTO pitcher_dk_salaries ($columns) VALUES ('$values')");
		}
		return 0; //Draftkings salaries added to database!
	}

	$link = $argv[1];
	echo(get_dk_salaries($link));

?>