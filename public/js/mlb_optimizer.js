const MAX_SALARY = 50000;
const NUM_LUS = 5;
//starts functions when document is loaded
$(document).ready(function(){
//request to get salary data to apply to NHL line up optimizer
    $.ajax({
        type:"GET",
        url: "js/data/salaries_short_mlb.csv",
        dataType: "text",
        success: function(result) {
            //start variable for testing run time
            var start = performance.now();
            //from jquery.csv.min.js converts csv file toObjects
            //the first row as header is key. the values are subsequent rows in the column of corresponding header
            //FOR THIS ALGORITHM THE DATA MUST BE SORTED FORM HIGHEST PROJECTED POITNS
            var data = $.csv.toObjects(result);
            var top_lus=[];
            var test = search(data,top_lus);
            console.log(test);
            //end variable for testing run time
            var end = performance.now();
            //display total run time in ms
            console.log((end-start)*0.001);
        }
    });
});
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
//Takes all players and outputs arrays based on player's position
function mlb_data_to_positions(data) {
    var pitcher = [];
    var catcher = [];
    var first = [];
    var second = [];
    var third = [];
    var short = [];
    var outfield = [];

    for (player in data){
        data[player].points = Number(data[player].points);
        data[player].salary = Number(data[player].salary);
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
        var current_lu_points =  pitcher[p1].points + pitcher[p2].points + catcher[c].points + first[f].points + second[s].points + third[t].points + short[ss].points + outfield[of1].points + outfield[of2].points + outfield[of3].points;

        switch (position)
        {
            case 10:
                salary -= pitcher[p1].salary;
            case 9:
                salary -= pitcher[p2].salary;
                if (salary >= 16000 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,9,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 8:
                salary -= catcher[c].salary;
                if (salary >= 14000 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,8,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 7:
            salary -= first[f].salary;
                if (salary >= 12000 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,7,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 6:
                salary -= second[s].salary;
                if (salary >= 10000 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,6,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 5:
                salary -= third[t].salary;
                if (salary >= 8000 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,5,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 4:
                salary -= short[ss].salary;
                if (salary >= 6000 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,4,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 3:
                salary -= outfield[of1].salary;
                if (salary >= 4000 && current_lu_points> top_lus_min_points){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,3,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 2:
                salary -= outfield[of2].salary;
                if (salary >= 2000 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, p1, p2, c, f, s, t, ss, of1, of2, of3, salary] = iterate(pitcher,catcher,first,second,third,short,outfield,2,p1,p2,c,f,s,t,ss,of1,of2,of3,len_pitcher,len_catcher,len_first,len_second,len_third,len_short,len_outfield);
                    break;
                }
            case 1:
                salary -= outfield[of3].salary;
                if (salary >= 0 && current_lu_points > top_lus_min_points){
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
