<?php
    // configuration
    require("../includes/config.php");

    $pitcher_projections_final =[];
    $batter_projections =[];

    $result = $conn->query("SELECT * FROM `batter_projections`");
    //only want results that returned a player name match
    if ($result->num_rows > 0){
        while($row = $result->fetch_assoc()){
            array_push($batter_projections, ["status"=>$row["status"], "player"=>$row["player"], "position"=>$row["position"], "salary"=>$row["salary"], "points"=>$row["points"], "playerteam"=>$row["playerteam"]]);
        }
    }

    $result = $conn->query("SELECT * FROM `pitcher_projections`");
    //only want results that returned a player name match
    if ($result->num_rows > 0){
        while($row = $result->fetch_assoc()){
            array_push($pitcher_projections_final, ["status"=>$row["status"], "player"=>$row["player"], "position"=>$row["position"], "salary"=>$row["salary"], "points"=>$row["points"], "playerteam"=>$row["playerteam"]]);
        }
    }

    echo json_encode(array("pitcher_projections"=>$pitcher_projections_final, "batter_projections"=>$batter_projections));
?>