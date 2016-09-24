$(document).ready(function(){
    var data = [],
        pitchers = [],
        batters = [];
    $.ajax({
        url: "get_data.php",
        dataType:"json",
        success: function(result){
            //This is where you handle what to do with the response.
            //The actual data is found on this.responseText
            //console.log(JSON.parse(this.responseText));
            pitchers = result.pitcher_projections;
            batters = result.batter_projections;
            for (var key in pitchers){
                data.push({position:pitchers[key]["position"], player:pitchers[key]["player"], salary:pitchers[key]["salary"], points:pitchers[key]["points"], playerteam:pitchers[key]["playerteam"]});
            }
            for (var key in batters){
                data.push({position:batters[key]["position"], player:batters[key]["player"], salary:batters[key]["salary"], points:batters[key]["points"], playerteam:batters[key]["playerteam"]});
            }
            // Commented Code below can be used to sort by points later... can do that.
            // pitchers.sort(function(a,b){
            //     return parseFloat(b["points"] - a["points"]);
            // })  
            // batters.sort(function(a,b){
            //     return parseFloat(b["points"] - a["points"]);
            // });
            paginate_data(pitchers, 'pitchers');
            paginate_data(batters, 'batters');
        }
    });

    $('.loadOptimizer').on('click', function(){
        $('.loader').removeClass('hidden');
        $('.lineups').empty();
        $('.loadOptimizer').addClass('hidden');
        $('.playerTables').addClass('hidden');
        $('.positions').addClass('hidden');
        $('.lineups').removeClass('hidden');
        //Use seTimeout to make optimizer run asynchronously so it doesn't block above commands
        //A callback is set in optimizer so when it's done display lineups can use the returned value to populate tables.
        setTimeout(function(){
            mlb_optimizer(data, function(result){
                    display_lineups(result);
                });
        },10);
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

    $('.sports-btn').on('click',function(){
        $('.sports-btn').removeClass('selected');
        $(this).addClass('selected');
        $('.playerTables').addClass('hidden');
        $('.positions').addClass('hidden');
        $('.loadOptimizer').removeClass('hidden');
        $('.lineups').addClass('hidden');
    });

    $('.mlb-btn').on('click', function(){
        $('.mlbTables').removeClass('hidden');
        $('.mlbPositions').removeClass('hidden');
    });

    $('.nhl-btn').on('click', function(){
        $('.nhlTables').removeClass('hidden');
        $('.nhlPositions').removeClass('hidden');
    });

    $('.pitchers-btn').on('click', function(){
        paginate_data(pitchers, 'pitchers');
        $('.battersSection').addClass('hidden');
        $('.pitchersSection').removeClass('hidden');
        $('.position-btn').removeClass('selected');
        $(this).addClass('selected');
        $('.search-input').val('');
    });
    $('.batters-btn').on('click', function(){
        paginate_data(batters, 'batters');
        $('.pitchersSection').addClass('hidden');
        $('.battersSection').removeClass('hidden');
        $('.position-btn').removeClass('selected');
        $(this).addClass('selected');
        $('.search-input').val('')
    });

    $('.search-input-mlb').on('keyup', function(){
        //assume that when can access mlb search that batters or hitters must be hidden
        var searchInput = $(this).val(),
            regex = new RegExp(searchInput, "i");
        if(!$('.pitchersSection').hasClass('hidden')){
            if(searchInput == ""){
                paginate_data(pitchers, 'pitchers');
            }
            else{
                search_players(pitchers,regex, 'pitchers');
            }
        }
        else{
            if(searchInput == ""){
                paginate_data(batters, 'batters');
            }
            else{
                search_players(batters,regex, 'batters');
            }
        }
    });
    //Remove player from data and respective player list
    $('table').on('click', '.removePlayer', function(){
        var $this = $(this),
            playerType = $this.parent().prev().find('input').data('player-type');
            playerName = $this.parent().prevAll().eq(5).text().replace(/[0-9]+\.\s/,""),
            $thisTr = $this.parent().parent();
        if(playerType == 'pitchers'){
            for(var key in pitchers){
                if(pitchers[key]['player'] == playerName){
                    pitchers.splice(key,1);
                }
            }
        }
        else if(playerType == 'batters'){
            for(var key in batters){
                if(batters[key]['player'] == playerName){
                    batters.splice(key,1);
                }
            }
        }
        //currently only mlb is in data so this is okay... when it is hockey too then it might be problematic 
        for(var key in data){
            if(data[key].player == playerName){
                data.splice(key,1);
            }
        }
        $thisTr.remove();
    });

    //Change projected points
    $('table').on('keyup', '.points-input', function(){
        var $this = $(this),
            playerName = $this.parent().prevAll().eq(4).text().replace(/[0-9]+\.\s/,"");
            newPoints = $this.val() == "" ? 0 : $this.val(),
            playerType = $this.data('player-type');
        if(playerType == 'pitchers'){
            for(var key in pitchers){
                if(pitchers[key]['player'] == playerName){
                    pitchers[key]['points'] = newPoints;
                }
            }
        }
        else if(playerType == 'batters'){
            for(var key in batters){
                if(batters[key]['player'] == playerName){
                    batters[key]['points'] = newPoints;
                }
            }
        }
        //currently only mlb is in data so this is okay... when it is hockey too then it might be problematic 
        for(var key in data){
            if(data[key].player == playerName){
                data[key].points = newPoints;
            }
        }
    });
});

function display_lineups(result)
{   
    $('.loader').addClass('hidden');
    for (var lu in result){
        $('.lineups').append("<table class = 'table table-bordered'><thead><tr><th>Position</th><th>Player Team</th><th>Player</th><th>Salary</th><th>Projected Points</th></tr></thead><tbody>");
        var total_points = result[lu].points;
        for(var players in result[lu].lineup){
            $('.lineups tbody:last').append("<tr><th>" + result[lu].lineup[players].position + "</th><th>" + result[lu].lineup[players].playerteam + "</th><th>" + result[lu].lineup[players].player + "</th><th>" + result[lu].lineup[players].salary + "</th><th>" + result[lu].lineup[players].points +"</th></tr>");
        }
        $('.lineups tbody:last').append("<tr><th></th><th></th><th><th></th></th><th>" + total_points.toFixed(2) + "</th></tr></tbody></table>");
    }
}
