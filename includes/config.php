<?php

    /**
     * config.php
     * Configures app.
     */

    // display errors, warnings, and notices
    ini_set("display_errors", true);
    error_reporting(E_ALL);

    // requirements
    require("helpers.php");

    //Connection to Database
    //$url = parse_url(getenv("mysql://be685b24100c32:bead4f43@us-cdbr-iron-east-04.cleardb.net/heroku_c452823f8de27cf?reconnect=true"));
    //CLEARDB_DATABASE_URL => mysql://[username]:[password]@[host]/[database name]?reconnect=true    
    $server = "q3vtafztappqbpzn.cbetxkdyhwsb.us-east-1.rds.amazonaws.com";
    $username = "bynkvwpzuws3i6ho";
    $password = "ai1kerhkdzowl867";
    $db = "ekqb9mc3x6t2ssta";
    $conn = new mysqli($server, $username, $password, $db);

	
	if ($conn->connect_errno) {
	    apologize("Failed to connect to MySQL: (" . $conn->connect_errno . ") " . $conn->connect_error);
	}
?>
