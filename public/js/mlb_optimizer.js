const MAX_SALARY = 50000;
const NUM_LUS = 5;
//starts functions when document is loaded
function mlb_optimizer(data,callback){
    var start = performance.now();
    //sort the data by points
    data.sort(function(a,b){
        return parseFloat(b.points) - parseFloat(a.points);
    });
    //if data exceeds certain length, run reducer on it
    var top_lus=[];
    var result = search(data,top_lus);
    //end variable for testing run time
    console.log(result);
    var end = performance.now();
    //display total run time in ms
    console.log((end-start)*0.001);
    callback(result);
};
//function to be used in mlb_data_to_positions, removes any duplicate players in given position
function remove_duplicate_positions(players){
    var length_of_players = players.length;
    var new_players = [];
    for (var i = 0; i < length_of_players -1; i++){
        var duplicate = false;
        for(var j = i + 1; j < length_of_players; j++){
            if (players[i].player == players[j].player){
                duplicate = true;
            }
        }
        if (duplicate == false){
            new_players.push(players[i]);
        }
    }
    //last position can not be duplicate (would have been removed earlier) so must add
    new_players.push(players[length_of_players-1]);
    return new_players;
};
//Rosters must have no more than 5 hitters from any one MLB team.
//Function to check if 6 or more players are on same team out of 8 players
function check_lu_max_teams(lineup) {
    var a = [], b = [], prev;
    lineup.sort();
    for ( var i = 0; i < lineup.length; i++ ) {
        if ( lineup[i] !== prev ) {
            a.push(lineup[i]);
            b.push(1);
        } 
        else{
            b[b.length-1]++;
        }
        prev = lineup[i];
    }
    //array b has number of times a duplicate team has occured
    //if a duplicate team has occured more than 5 times, then it isn't valid.
    for (var i = 0; i < b.length; i++){
        if (b[i] > 5){
            return false;
        }
    }
    return true;
}
//function to find best value/high point players in case there are too many players to optimize
function bestvalue(data, num_value, num_points){
    var l=[];
    //sort by highest value
    data.sort(function(a,b) {
        return parseFloat(b.value) - parseFloat(a.value);
    });
    for (var i = 0; i < num_value; i++){
        l.push(data[i]);
    }
    //now sort by highest projected points 
    data.sort(function(a,b){
        return parseFloat(b.points) - parseFloat(a.points);
    });
    var y = 0;
    var c = 0;
    outerloop:
    while (y < num_points){
        for(var i = 0; i < l.length; i++){
            if (l[i].player == data[c].player){
                c++;
                continue outerloop;
            }
        }
        l.push(data[c]);
        c++;
        y++;
    }
    //make sure everything is returned by highest projected points
    l.sort(function(a,b){
        return parseFloat(b.points) - parseFloat(a.points);
    });
    return l;
}
//Takes all players and outputs arrays based on player's position
function mlb_data_to_positions(data) {
    var pitcher = [];
    var catcher = [];
    var first = [];
    var second = [];
    var third = [];
    var short = [];
    var outfield = [];
    //need to add Value or points*1000/salary of each player to sort by that as well if reducing #of players needed.
    for (player in data){
        data[player].points = Number(data[player].points);
        data[player].salary = Number(data[player].salary);
        data[player].value = data[player].points*1000/data[player].salary;
        if (data[player].position.indexOf("P") > -1) {
            pitcher.push(data[player]);
        }
        if (data[player].position.indexOf("C") > -1) {
            catcher.push(data[player]);
        }
        if (data[player].position.indexOf("1B") > -1) {
            first.push(data[player]);
        }
        if (data[player].position.indexOf("2B") > -1) {
            second.push(data[player]);
        }
        if (data[player].position.indexOf("3B") > -1) {
            third.push(data[player]);
        }
        if (data[player].position.indexOf("SS") > -1) {
            short.push(data[player]);
        }
        if(data[player].position.indexOf("OF") > -1){
            outfield.push(data[player]);
        }
    }
    //remove potential duplicates in certain positions
    catcher = remove_duplicate_positions(catcher);
    first = remove_duplicate_positions(first);
    second = remove_duplicate_positions(second);
    third = remove_duplicate_positions(third);
    short = remove_duplicate_positions(short);
    outfield = remove_duplicate_positions(outfield);
    //check if data holds more than 130 players. If so, reduce to top 130 players so the optimizer works well.
    if (data.length > 86){
        if (pitcher.length > 6){
            pitcher = bestvalue(pitcher,3,3);
        }
        if (catcher.length > 10){
            catcher = bestvalue(catcher,5,5);
        }
        if (first.length > 10){
            first = bestvalue(first,5,5);
        }
        if (second.length > 10){
            second = bestvalue(second,5,5);
        }
        if (third.length > 10){
            third = bestvalue(third,5,5);
        }
        if (short.length > 10){
            short = bestvalue(short,5,5);
        }
        if (outfield.length > 30){
            outfield = bestvalue(outfield,15,15);
        }
    }
    return {
        pitcher:pitcher,
        catcher:catcher,
        first:first,
        second:second,
        third:third,
        short:short,
        outfield:outfield
    };
};
//function to find next iteration
//position is position in the line up the iteration is in
//indexes of each position are passed in
function iterate(pitcher,catcher,first,second,third,short,outfield,position,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield) {
    //If you are looking at last position and it isn't the last spot OF that position, next iteration is of3 + 1 or the next spot.
    //If last position is in the last spot, then continue on and check position before it
    if (position < 2 && of3 < len_outfield - 1){
        salary = MAX_SALARY - pitcher[p1].salary - pitcher[p2].salary - catcher[c].salary - first[f].salary - second[s].salary - third[t].salary - short[ss].salary - outfield[of1].salary - outfield[of2].salary;
        of3++;
        return [1, p1, p2, c, f, s, t, ss, of1, of2, of3, salary];
    }
    //If you are looking at the second to last spot (second defenseman or d2) OR if you were looking at last position (U) and it was the last spot of that position, next iteration is d2 + 1 (unless its the last spot for d2, then continue)
    if (position < 3 && of2 < len_outfield - 2){
        salary = MAX_SALARY - pitcher[p1].salary - pitcher[p2].salary - catcher[c].salary - first[f].salary - second[s].salary - third[t].salary - short[ss].salary - outfield[of1].salary;
        of2++;
        of3 = of2 + 1;
        return [2, p1, p2, c, f, s, t, ss, of1, of2, of3, salary];
    }
    if (position < 4 && of1 < len_outfield - 3){
        salary = MAX_SALARY - pitcher[p1].salary - pitcher[p2].salary - catcher[c].salary - first[f].salary - second[s].salary - third[t].salary - short[ss].salary;
        of1++;
        of2 = of1 + 1;
        of3 = of2 + 1;
        return [3, p1, p2, c, f, s, t, ss, of1, of2, of3, salary];
    }
    if (position < 5 && ss < len_short - 1){
        salary = MAX_SALARY - pitcher[p1].salary - pitcher[p2].salary - catcher[c].salary - first[f].salary - second[s].salary - third[t].salary;
        ss++;
        of1 = 0;
        of2 = 1;
        of3 = 2;
        return [4, p1, p2, c, f, s, t, ss, of1, of2, of3, salary];
    }
    if (position < 6 && t < len_third - 1){
        salary = MAX_SALARY - pitcher[p1].salary - pitcher[p2].salary - catcher[c].salary - first[f].salary - second[s].salary;
        t++;
        ss = 0;
        of1 = 0;
        of2 = 1;
        of3 = 2;
        return [5, p1, p2, c, f, s, t, ss, of1, of2, of3, salary];
    }
    if (position < 7 && s < len_second - 1){
        salary = MAX_SALARY - pitcher[p1].salary - pitcher[p2].salary - catcher[c].salary - first[f].salary;
        s++;
        t = 0;
        ss = 0;
        of1 = 0;
        of2 = 1;
        of3 = 2;
        return [6, p1, p2, c, f, s, t, ss, of1, of2, of3, salary];
    }
    if (position < 8 && f < len_first - 1){
        salary = MAX_SALARY - pitcher[p1].salary - pitcher[p2].salary - catcher[c].salary;
        f++;
        s = 0;
        t = 0;
        ss = 0;
        of1 = 0;
        of2 = 1;
        of3 = 2;
        return [7, p1, p2, c, f, s, t, ss, of1, of2, of3, salary];
    }
    if (position < 9 && c < len_catcher - 1){
        salary = MAX_SALARY - pitcher[p1].salary - pitcher[p2].salary;
        c++;
        f = 0;
        s = 0;
        t = 0;
        ss = 0;
        of1 = 0;
        of2 = 1;
        of3 = 2;
        return [8, p1, p2, c, f, s, t, ss, of1, of2, of3, salary];
    }
    if (position < 10 && p2 < len_pitcher - 1){
        salary = MAX_SALARY - pitcher[p1].salary;
        p2++;
        c = 0;
        f = 0;
        s = 0;
        t = 0;
        ss = 0;
        of1 = 0;
        of2 = 1;
        of3 = 2;
        return [9, p1, p2, c, f, s, t, ss, of1, of2, of3, salary];
    }
    if (position < 10 && p1 < len_pitcher - 2){
        salary = MAX_SALARY - pitcher[p1].salary;
        p1++;
        p2 = p1 + 1;
        c = 0;
        f = 0;
        s = 0;
        t = 0;
        ss = 0;
        of1 = 0;
        of2 = 1;
        of3 = 2;
        return [9, p1, p2, c, f, s, t, ss, of1, of2, of3, salary];
    }
    //Should only reach here if iteration is at the last spot for ALL positions, then program is done running and all outcomes have been iterated.
    else{
        return [0,0,0,0,0,0,0,0,0,0,0];
    }
};
//When a line up passes all constraints (salary and point constraint) this function is called
//Determines the point value of the line up and if it is higher than one of the top three, it goes in and the last one goes out
function check_lu(top_lus,current_lu_points,current_lu){
    top_lus.unshift({lineup:current_lu, points:current_lu_points});
    //make sure top lineups are sorted
    top_lus.sort(function(a,b){
        return parseFloat(b.points) - parseFloat(a.points);
    });
    //when more than NUM_LUS, pop off the last one
    if (top_lus.length > NUM_LUS){
        top_lus.pop();
    }
    return top_lus;
};
//The main call function, checks the line up to see if it passes constraint, if yes continue to next position, if no then determine where the next iteration is and skip remaining iterations for that particular player in that position
function search(data,top_lus){
    //Initial values
    //Max salary
    var salary = MAX_SALARY;
    //These variables determine the index or position index to determine the place of the iteration.
    p1 = 0;
    p2 = 1;
    c = 0;
    f = 0;
    s = 0;
    t = 0;
    ss = 0;
    of1 = 0;
    of2 = 1;
    of3 = 2;
    var position = 10;
    var players = mlb_data_to_positions(data);
    var pitcher = players.pitcher;
    var catcher = players.catcher;
    var first = players.first;
    var second = players.second;
    var third = players.third;
    var short = players.short;
    var outfield = players.outfield;
    //length of each position array required for iteration steps
    var len_pitcher = pitcher.length;
    var len_catcher = catcher.length;
    var len_first = first.length;
    var len_second = second.length;
    var len_third = third.length;
    var len_short = short.length;
    var len_outfield = outfield.length;
    do{
        //Automatically fills in NUM_LUS number of lineups before comparing
        if (top_lus.length < NUM_LUS){
            top_lus_min_points = 0;
        }
        else{
            top_lus_min_points = top_lus[top_lus.length - 1].points;
        }
        //need current points to see if it will be higher than current max
        //need hitters to make sure there aren't more than 4 players on the same team
        var current_lu_points =  pitcher[p1].points + pitcher[p2].points + catcher[c].points + first[f].points + second[s].points + third[t].points + short[ss].points + outfield[of1].points + outfield[of2].points + outfield[of3].points,
            hitters = [catcher[c].playerteam, first[f].playerteam, second[s].playerteam, third[t].playerteam, short[ss].playerteam, outfield[of1].playerteam, outfield[of2].playerteam, outfield[of3].playerteam];
        switch (position)
        {
            case 10:
                salary -= pitcher[p1].salary;
            case 9:
                salary -= pitcher[p2].salary;
                if (salary >= 16000 && current_lu_points > top_lus_min_points && check_lu_max_teams(hitters)){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,9,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 8:
                salary -= catcher[c].salary;
                if (salary >= 14000 && current_lu_points > top_lus_min_points && check_lu_max_teams(hitters)){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,8,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 7:
            salary -= first[f].salary;
                if (salary >= 12000 && current_lu_points > top_lus_min_points && check_lu_max_teams(hitters)){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,7,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 6:
                salary -= second[s].salary;
                if (salary >= 10000 && current_lu_points > top_lus_min_points && check_lu_max_teams(hitters)){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,6,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 5:
                salary -= third[t].salary;
                if (salary >= 8000 && current_lu_points > top_lus_min_points && check_lu_max_teams(hitters)){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,5,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 4:
                salary -= short[ss].salary;
                if (salary >= 6000 && current_lu_points > top_lus_min_points && check_lu_max_teams(hitters)){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,4,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 3:
                salary -= outfield[of1].salary;
                if (salary >= 4000 && current_lu_points> top_lus_min_points && check_lu_max_teams(hitters)){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,3,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 2:
                salary -= outfield[of2].salary;
                if (salary >= 2000 && current_lu_points > top_lus_min_points && check_lu_max_teams(hitters)){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,2,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 1:
                salary -= outfield[of3].salary;
                if (salary >= 0 && current_lu_points > top_lus_min_points && check_lu_max_teams(hitters)){
                    var current_lu = [pitcher[p1],pitcher[p2],catcher[c],first[f],second[s],third[t],short[ss],outfield[of1],outfield[of2],outfield[of3]];
                    top_lus = check_lu(top_lus,current_lu_points,current_lu);
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,1,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,1,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                }
                break;
            case 0:
                break;
            default:
                console.log("ERROR: Position not found!");
                return position;
        }
    }
    while(position != 0);
    return top_lus;
};
