$(document).ready(function(){
<<<<<<< HEAD
    var data = [],
        pitchers = [],
        batters = [];
=======
    var data = [];
>>>>>>> master
    $.ajax({
        url: "get_data.php",
        dataType:"json",
        success: function(result){
            //This is where you handle what to do with the response.
            //The actual data is found on this.responseText
            //var result = JSON.parse(this.responseText);
            pitchers = result.pitcher_projections;
            batters = result.batter_projections;
            for (var key in pitchers){
                data.push({position:pitchers[key]["position"], player:pitchers[key]["player"], salary:pitchers[key]["salary"], points:pitchers[key]["points"], playerteam:pitchers[key]["playerteam"]});
            }
            for (var key in batters){
                data.push({position:batters[key]["position"], player:batters[key]["player"], salary:batters[key]["salary"], points:batters[key]["points"], playerteam:batters[key]["playerteam"]});
            }
            paginate_data(pitchers, 'pitchers');
            paginate_data(batters, 'batters');
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

    $('.next').on('click', function(){
        var $parent = $(this).parent(),
            max_results_per_page = 25,
            index = $parent.data('index') + max_results_per_page,
            type = $parent.data('player'),
            array = type == 'pitchers' ? pitchers : batters;
        paginate_data(array, type, index);
    });
    $('.previous').on('click', function(){
        var $parent = $(this).parent(),
            max_results_per_page = 25,
            index = $parent.data('index') - max_results_per_page,
            type = $parent.data('player'),
            array = type == 'pitchers' ? pitchers : batters;
        paginate_data(array, type, index);
    });
});