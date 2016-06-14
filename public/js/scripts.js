$(document).ready(function(){
    var data = [];
    $.ajax({
        url: "get_data.php",
        dataType:"json",
        success: function(result){
            //This is where you handle what to do with the response.
            //The actual data is found on this.responseText
            //var result = JSON.parse(this.responseText);
            var pitchers = result.pitcher_projections;
            var batters = result.batter_projections;
            var i = 1;
            for (var key in pitchers){
                $('.pitchersTable').append("<tr><th>" + i + ". " + pitchers[key]["player"] +"</th><th>"+ pitchers[key]["status"]+"</th><th>"+ pitchers[key]["playerteam"]+"</th><th>"+pitchers[key]["position"]+"</th><th>"+pitchers[key]["salary"]+"</th><th>"+pitchers[key]["points"]+"</th></tr>");
                i++;
                data.push({position:pitchers[key]["position"], player:pitchers[key]["player"], salary:pitchers[key]["salary"], points:pitchers[key]["points"], playerteam:pitchers[key]["playerteam"]});
            }
            var i = 1;
            for (var key in batters){
                $('.battersTable').append("<tr><th>" + i + ". " + batters[key]["player"] +"</th><th>"+ batters[key]["status"]+"</th><th>"+ batters[key]["playerteam"]+"</th><th>"+batters[key]["position"]+"</th><th>"+batters[key]["salary"]+"</th><th>"+batters[key]["points"]+"</th></tr>");
                i++;
                data.push({position:batters[key]["position"], player:batters[key]["player"], salary:batters[key]["salary"], points:batters[key]["points"], playerteam:batters[key]["playerteam"]});
            }
            $('.loadPlayers').hide();
            $('.loadOptimizer').show();
        }
    });

    $('.loadOptimizer').click(function(){
        var result = mlb_optimizer(data);
        $('.loadOptimizer').hide();
        $('.playerTables').hide();
        $('.lineups').show();
        for (var lu in result){
            $('.lineups').append("<table class = 'table table-bordered'><thead><tr><th>Position</th><th>Player Team</th><th>Player</th><th>Salary</th><th>Projected Points</th></tr></thead><tbody>");
            var total_points = result[lu].points;
            for(var players in result[lu].lineup){
                $('.lineups tbody:last').append("<tr><th>" + result[lu].lineup[players].position + "</th><th>" + result[lu].lineup[players].playerteam + "</th><th>" + result[lu].lineup[players].player + "</th><th>" + result[lu].lineup[players].salary + "</th><th>" + result[lu].lineup[players].points +"</th></tr>");
            }
            $('.lineups tbody:last').append("<tr><th></th><th></th><th><th></th></th><th>" + total_points.toFixed(2) + "</th></tr></tbody></table>");
        }
    });
});