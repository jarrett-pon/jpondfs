<?php
	require('database_config.php');
	require('simple_html_dom.php');

	function find_team($team){
		switch($team){
			case "Dbacks":
				return "ARI";
			case "Blue Jays":
				return "TOR";
			case "Padres":
				return "SD";
			case "Orioles":
				return "BAL";
			case "Rockies":
				return "COL";
			case "Yankees":
				return "NYY";
			case "Giants":
				return "SF";
			case "Pirates":
				return "PIT";
			case "White Sox":
				return "CWS";
			case "Red Sox":
				return "BOS";
			case "Rays":
				return "TB";
			case "Indians":
				return "CLE";
			case "Mariners":
				return "SEA";
			case "Tigers":
				return "DET";
			case "Royals":
				return "KC";
			case "Mets":
				return "NYM";
			case "Braves":
				return "ATL";
			case "Marlins":
				return "MIA";
			case "Cardinals":
				return "STL";
			case "Cubs":
				return "CHC";
			case "Reds":
				return "CIN";
			case "Rangers":
				return "TEX";
			case "Phillies":
				return "PHI";
			case "Twins":
				return "MIN";
			case "Angels":
				return "LAA";
			case "Astros":
				return "HOU";
			case "Brewers":
				return "MIL";
			case "Athletics":
				return "OAK";
			case "Nationals":
				return "WAS";
			case "Dodgers":
				return "LAD";
			default:
				return "ERROR";	
		}
	}
	$team_array = [];
	$status_array = [];
	$player_array = [];
	$data_array = [];
	//curl required to open url...

	//base url
	$base = 'https://rotogrinders.com/lineups/mlb?site=draftkings';

	$curl = curl_init();
	curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($curl, CURLOPT_HEADER, false);
	curl_setopt($curl, CURLOPT_FOLLOWLOCATION, true);
	curl_setopt($curl, CURLOPT_URL, $base);
	curl_setopt($curl, CURLOPT_REFERER, $base);
	curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
	$str = curl_exec($curl);
	curl_close($curl);

	// Create a DOM object
	$stats_page = new simple_html_dom();
	// Load HTML from a string
	$stats_page->load($str);
	foreach($stats_page->find('ul.lineup li[data-role]') as $index=>$matchup){
		//away team
		$team = find_team(trim($matchup->find('span.mascot', 0)->plaintext));
		$status = $matchup->find('div.away-team ul.players li span',0)->plaintext == 1 ? "Confirmed" : "Projected";
		//first player is always pitcher
		$player = $matchup->find('div.away-team div.pitcher a',0)->plaintext;
		array_push($data_array, ["status"=>$status,"player"=>$player,"team"=>$team]);
		foreach($matchup->find('div.away-team ul.players li') as $away_team){
			$player = $away_team->find('a',0)->plaintext;
			if($player ==""){
				continue;
			}
			if(trim($away_team->find('span.position',0)->plaintext) == "SP"){
				continue;
			}
			array_push($data_array, ["status"=>$status,"player"=>$player,"team"=>$team]);
		}
		//home team
		$team = find_team(trim($matchup->find('span.mascot', 1)->plaintext));
		$status = $matchup->find('div.home-team ul.players li span',0)->plaintext == 1 ? "Confirmed" : "Projected";
		//first player is always pitcher
		$player = $matchup->find('div.home-team div.pitcher a',0)->plaintext;
		array_push($data_array, ["status"=>$status,"player"=>$player,"team"=>$team]);
		foreach($matchup->find('div.home-team ul.players li') as $home_team){
			$player = $home_team->find('a',0)->plaintext;
			if($player == ""){
				continue;
			}
			if(trim($home_team->find('span.position',0)->plaintext) == "SP"){
				continue;
			}
			array_push($data_array, ["status"=>$status,"player"=>$player,"team"=>$team]);
		}
	}

	$conn->query("DROP TABLE IF EXISTS lineups");
	$conn->query("CREATE TABLE lineups(`id` int(10) unsigned NOT NULL AUTO_INCREMENT, status varchar(255) NOT NULL, player varchar(255) NOT NULL, team varchar(255) NOT NULL, PRIMARY KEY(`id`), INDEX(player))");
	foreach ($data_array as $item){
		$columns = implode(", ",array_keys($item));
		$escaped_values = array_map(array($conn, 'real_escape_string'), array_values($item));
		$values = implode("', '",$escaped_values);
		$conn->query("INSERT INTO lineups ($columns) VALUES ('$values')");
	}
	//making projections and submitting to database
    $pitcher_projections = [];
    $batter_projections = [];
    
    $result = $conn->query("SELECT * FROM (`pitchers_stats` ps RIGHT JOIN (`pitcher_dk_salaries` pdks JOIN `lineups` lu ON lu.player = pdks.player AND lu.team = pdks.playerteam) ON lu.player = ps.player) INNER JOIN `park_factor` pf ON pdks.park = pf.park INNER JOIN `team_batting_stats` tbs ON pdks.oppteam = tbs.team");
    if ($result->num_rows > 0){
        while($row = $result->fetch_assoc()){
            array_push($pitcher_projections, ["status"=>$row["status"], "player"=>$row["player"], "playerteam"=>$row["playerteam"], "oppteam"=>$row["oppteam"], "position"=>$row["position"], "salary"=>$row["salary"], "ip"=>$row["ip"], "so"=>$row["so"], "wins"=>$row["wins"], "whip"=>$row["whip"], "era"=>$row["era"], "walks"=>$row["walks"], "ops"=>$row["ops"], "gp"=>$row["gp"], "park_runs"=>$row["park_runs"], "park_hr"=>$row["park_hr"], "opp_team_avg"=>$row["team_avg"], "opp_team_so"=>$row["team_so"], "opp_team_gp"=>$row["team_gp"]]);
        }
    }
    //All pitchers status is confirmed, then remove duplicates
    foreach ($pitcher_projections as $key=>$row){
        $pitcher_projections[$key]["status"] = "Confirmed";
    }
    $pitcher_projections_final = array_unique($pitcher_projections, SORT_REGULAR);

    $result = $conn->query("SELECT * FROM `hot_batters_stats` hbs RIGHT JOIN (`batters_stats` bs RIGHT JOIN (`batter_dk_salaries` bdks INNER JOIN `lineups` lu ON bdks.player = lu.player AND bdks.playerteam = lu.team) ON lu.player = bs.player) ON lu.player = hbs.player INNER JOIN `park_factor` pf ON bdks.park = pf.park");
    //only want results that returned a player name match
    if ($result->num_rows > 0){
        while($row = $result->fetch_assoc()){
            array_push($batter_projections, ["status"=>$row["status"], "player"=>$row["player"], "position"=>$row["position"], "salary"=>$row["salary"], "playerteam"=>$row["playerteam"], "avg"=>$row["avg"], "obp"=>$row["obp"], "slg"=>$row["slg"], "ops"=>$row["ops"], "sb"=>$row["sb"], "rbi"=>$row["rbi"], "runs"=>$row["runs"], "hr"=>$row["hr"], "walks"=>$row["walks"], "gp"=>$row["gp"], "oppteam"=>$row["oppteam"], "park_runs"=>$row["park_runs"], "park_hr"=>$row["park_hr"], "hot_ops"=>$row["hot_ops"]]);
        }
    }
    //Need to go through each batter and find the pitcher they are going against and append additional stats needed for projections
    foreach ($batter_projections as $batter_key=>$batter_row){
        foreach($pitcher_projections_final as $pitcher_key=>$pitcher_row){
            if ($batter_projections[$batter_key]["playerteam"] == $pitcher_projections_final[$pitcher_key]["oppteam"]){
                $batter_projections[$batter_key]["opp_pitcher_whip"] = $pitcher_projections_final[$pitcher_key]["whip"];
                $batter_projections[$batter_key]["opp_pitcher_ops"] = $pitcher_projections_final[$pitcher_key]["ops"];
            }
        }
    }
    //Side note: Use this sql query and look a null values to find names that don't match dk salaries and espn names 
    //SELECT * FROM `lineups` lu1 LEFT JOIN (`batter_dk_salaries` bdks INNER JOIN `lineups` lu2 ON bdks.player = lu2.player) ON lu1.player = lu2.player;

    //Algorithm for projections, add projected_points object
    foreach ($pitcher_projections_final as $key=>$row){
        if ($pitcher_projections_final[$key]["era"] == NULL){
            $projected_points = 0;
        }
        else {
            $projected_ip = $pitcher_projections_final[$key]["ip"]/$pitcher_projections_final[$key]["gp"];
            $projected_so = ($pitcher_projections_final[$key]["so"]/$pitcher_projections_final[$key]["gp"] + ($pitcher_projections_final[$key]["opp_team_so"]/$pitcher_projections_final[$key]["opp_team_gp"] * $pitcher_projections_final[$key]["ip"]/$pitcher_projections_final[$key]["gp"]/9))/2;
            $projected_win = $pitcher_projections_final[$key]["wins"]/$pitcher_projections_final[$key]["gp"];
            $projected_er = $pitcher_projections_final[$key]["era"]*$pitcher_projections_final[$key]["ip"]/$pitcher_projections_final[$key]["gp"]/9*$pitcher_projections_final[$key]["park_runs"];
            $projected_hwhbp = ($pitcher_projections_final[$key]["whip"] + $pitcher_projections_final[$key]["opp_team_avg"]*4)*$pitcher_projections_final[$key]["ip"]/$pitcher_projections_final[$key]["gp"]/2;
            $projected_points = $projected_ip*2.25 + $projected_so*2 + $projected_win*4 - $projected_er*2 - $projected_hwhbp*0.6;
        }
        $pitcher_projections_final[$key]["points"] = round($projected_points,2);
    }
    foreach ($batter_projections as $key=>$row){
        if($batter_projections[$key]["avg"]==NULL){
            $projected_points = 0;
        }
        else {
            if ($batter_projections[$key]["hot_ops"] != NULL){
                $projected_sdtwhbp = (($batter_projections[$key]["ops"]+$batter_projections[$key]["hot_ops"])/2 + $batter_projections[$key]["opp_pitcher_ops"])*5/2;
            }
            else{
                $projected_sdtwhbp = ($batter_projections[$key]["ops"] + $batter_projections[$key]["opp_pitcher_ops"])*5/2;
            }
            $projected_hr = $batter_projections[$key]["hr"]/$batter_projections[$key]["gp"]*$batter_projections[$key]["park_hr"];
            $projected_rr = ($batter_projections[$key]["runs"] + $batter_projections[$key]["rbi"])/$batter_projections[$key]["gp"]*$batter_projections[$key]["park_runs"];
            $projected_sb = $batter_projections[$key]["sb"]/$batter_projections[$key]["gp"];
            $projected_points = $projected_sdtwhbp + $projected_hr*10 + $projected_rr*2 + $projected_sb*5;
        }
        $batter_projections[$key]["points"] = round($projected_points,2);
    }
    //echo json_encode(array("pitcher_projections"=>$pitcher_projections_final, "batter_projections"=>$batter_projections));
    //return the array in php, later on will turn into json and have javascript retrieve by ajax and form a table to display on website.

    //make projections table to store data
    $conn->query("DROP TABLE IF EXISTS batter_projections");
    $conn->query("CREATE TABLE batter_projections(`id` int(10) unsigned NOT NULL AUTO_INCREMENT, position varchar(255) NOT NULL, player varchar(255) NOT NULL, salary int(10) unsigned NOT NULL, status varchar(255) NOT NULL, points decimal(5,2) NOT NULL, playerteam varchar(255) NOT NULL, PRIMARY KEY(`id`))");
    foreach ($batter_projections as $key=>$item){
    	$player = mysqli_real_escape_string($conn, $batter_projections[$key]['player']);
        $conn->query("INSERT INTO batter_projections (position, player, salary, status, points, playerteam) VALUES ('". $batter_projections[$key]['position'] . "','" .$player. "','". $batter_projections[$key]['salary']. "','". $batter_projections[$key]['status']. "','" .$batter_projections[$key]['points']. "','". $batter_projections[$key]['playerteam'] . "')");
    }

    $conn->query("DROP TABLE IF EXISTS pitcher_projections");
    $conn->query("CREATE TABLE pitcher_projections(`id` int(10) unsigned NOT NULL AUTO_INCREMENT, position varchar(255) NOT NULL, player varchar(255) NOT NULL, salary int(10) unsigned NOT NULL, status varchar(255) NOT NULL, points decimal(5,2) NOT NULL, playerteam varchar(255) NOT NULL, PRIMARY KEY(`id`))");
    foreach ($pitcher_projections_final as $key=>$item){
    	$player = mysqli_real_escape_string($conn, $pitcher_projections_final[$key]['player']);
        $conn->query("INSERT INTO pitcher_projections (position, player, salary, status, points, playerteam) VALUES ('". $pitcher_projections_final[$key]['position'] . "','" .$player. "','". $pitcher_projections_final[$key]['salary']. "','". $pitcher_projections_final[$key]['status']. "','" .$pitcher_projections_final[$key]['points']. "','". $pitcher_projections_final[$key]['playerteam'] . "')");
    }
?>