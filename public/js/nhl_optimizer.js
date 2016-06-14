const MAX_SALARY = 50000;
const NUM_LUS = 5;
//starts functions when document is loaded
$(document).ready(function(){
//request to get salary data to apply to NHL line up optimizer
    $.ajax({
        type:"GET",
        url: "js/data/salaries_short_nhl.csv",
        dataType: "text",
        success: function(result) {
            //start variable for testing run time
            var start = performance.now();
            //from jquery.csv.min.js converts csv file toObjects
            //the first row as header is key. the values are subsequent rows in the column of corresponding header
            //FOR THIS ALGORITHM THE DATA MUST BE SORTED FORM HIGHEST PROJECTED POITNS
            var data = $.csv.toObjects(result);
            var top_lus=[];
            var test1 = search(data,"wings",top_lus);
            var test2 = search(data,"centers",test1);
            var test3 = search(data,"defenses",test2);
            console.log(test3);
            //end variable for testing run time
            var end = performance.now();
            //display total run time in ms
            console.log((end-start)*0.001);
        }
    });
});

//Takes all players and outputs arrays based on player's position
function nhl_data_to_positions(data) {
    var centers = [];
    var defenses = [];
    var wings = [];
    var goalies = [];

    for (player in data){
        data[player].points = Number(data[player].points);
        data[player].salary = Number(data[player].salary);
        if (data[player].position == "G") {
            goalies.push(data[player]);
        }
        else if (data[player].position == "D") {
            defenses.push(data[player]);
        }
        else if (data[player].position == "C") {
            centers.push(data[player]);
        }
        else {
            wings.push(data[player]);
        }
    }
    return {
        goalies:goalies,
        defenses:defenses,
        centers:centers,
        wings:wings
    };
};
//function to find next iteration
//centers,defenses,wings,goalies,utility are array of player objects
//position is position in the line up the iteration is in
//g, w1, w3, w3, c1, c2, d1, d2, and u are all indexes to keep track of iteration
function iterate(centers,defenses,wings,goalies,utility,utility_type,position,g,w1,w2,w3,c1,c2,d1,d2,u,len_centers,len_defenses,len_wings,len_goalies,len_utility,num_wings,num_centers,num_defenses) {
    //If you are looking at last position (utility) and it isn't the last spot OF that position, next iteration is u + 1 or the next spot.
    //If last position is in the last spot, then continue on and check position before it
    if (position < 2 && u < len_utility - 1){
        salary = MAX_SALARY - goalies[g].salary - wings[w1].salary - wings[w2].salary - wings[w3].salary - centers[c1].salary - centers[c2].salary - defenses[d1].salary - defenses[d2].salary;
        u++;
        return [1, g, w1, w2, w3, c1, c2, d1, d2, u, salary];
    }
    //If you are looking at the second to last spot (second defenseman or d2) OR if you were looking at last position (U) and it was the last spot of that position, next iteration is d2 + 1 (unless its the last spot for d2, then continue)
    if (position < 3 && d2 < len_defenses - num_defenses + 1){
        salary = MAX_SALARY - goalies[g].salary - wings[w1].salary - wings[w2].salary - wings[w3].salary - centers[c1].salary - centers[c2].salary - defenses[d1].salary;
        do{
            d2++;
            if(salary - defenses[d2].salary >= 2500){
                if (utility_type == "defenses"){
                    u = d2 + 1;
                }
                else if (utility_type == "centers"){
                    u = c2 + 1;
                }
                else if (utility_type == "wings"){
                    u = w3 + 1;
                }
                return [2, g, w1, w2, w3, c1, c2, d1, d2, u, salary];
            }
        }
        while(d2 < len_defenses - num_defenses + 1);
    }
    if (position < 4 && d1 < len_defenses - num_defenses){
        salary = MAX_SALARY - goalies[g].salary - wings[w1].salary - wings[w2].salary - wings[w3].salary - centers[c1].salary - centers[c2].salary;
        do{
            d1++;
            if (salary - defenses[d1].salary >= 5000){
                d2 = d1 + 1;
                if (utility_type == "defenses"){
                    u = d2 + 1;
                }
                else if (utility_type == "centers"){
                    u = c2 + 1;
                }
                else if (utility_type == "wings"){
                    u = w3 + 1;
                }
                return [3, g, w1, w2, w3, c1, c2, d1, d2, u, salary];
            }
        }
        while(d1 < len_defenses - num_defenses);
    }
    if (position < 5 && c2 < len_centers - num_centers + 1){
        salary = MAX_SALARY - goalies[g].salary - wings[w1].salary - wings[w2].salary - wings[w3].salary - centers[c1].salary;
        c2++;
        d1 = 0;
        d2 = 1;
        if (utility_type == "defenses"){
            u = d2 + 1;
        }
        else if (utility_type == "centers"){
            u = c2 + 1;
        }
        else if (utility_type == "wings"){
            u = w3 + 1;
        }
        return [4, g, w1, w2, w3, c1, c2, d1, d2, u, salary];
    }
    else if (position < 6 && c1 < len_centers - num_centers){
        salary = MAX_SALARY - goalies[g].salary - wings[w1].salary - wings[w2].salary - wings[w3].salary;
        c1++;
        c2 = c1 + 1;
        d1 = 0;
        d2 = 1;
        if (utility_type == "defenses"){
            u = d2 + 1;
        }
        else if (utility_type == "centers"){
            u = c2 + 1;
        }
        else if (utility_type == "wings"){
            u = w3 + 1;
        }
        return [5, g, w1, w2, w3, c1, c2, d1, d2, u, salary];
    }
    if (position < 7 && w3 < len_wings - num_wings + 2){
        salary = MAX_SALARY - goalies[g].salary - wings[w1].salary - wings[w2].salary;
        w3++;
        c1 = 0;
        c2 = 1;
        d1 = 0;
        d2 = 1;
        if (utility_type == "defenses"){
            u = d2 + 1;
        }
        else if (utility_type == "centers"){
            u = c2 + 1;
        }
        else if (utility_type == "wings"){
            u = w3 + 1;
        }
        return [6, g, w1, w2, w3, c1, c2, d1, d2, u, salary];
    }
    if (position < 8 && w2 < len_wings - num_wings + 1){
        salary = MAX_SALARY - goalies[g].salary - wings[w1].salary;
        w2++;
        w3 = w2 + 1;
        c1 = 0;
        c2 = 1;
        d1 = 0;
        d2 = 1;
        if (utility_type == "defenses"){
            u = d2 + 1;
        }
        else if (utility_type == "centers"){
            u = c2 + 1;
        }
        else if (utility_type == "wings"){
            u = w3 + 1;
        }
        return [7, g, w1, w2, w3, c1, c2, d1, d2, u, salary];
    }
    if (position < 9 && w1 < len_wings - num_wings){
        salary = MAX_SALARY - goalies[g].salary;
        w1++;
        w2 = w1 + 1;
        w3 = w2 + 1;
        c1 = 0;
        c2 = 1;
        d1 = 0;
        d2 = 1;
        if (utility_type == "defenses"){
            u = d2 + 1;
        }
        else if (utility_type == "centers"){
            u = c2 + 1;
        }
        else if (utility_type == "wings"){
            u = w3 + 1;
        }
        return [8, g, w1, w2, w3, c1, c2, d1, d2, u, salary];
    }
    if (position < 9 && g < len_goalies - 1){
        salary = MAX_SALARY - goalies[g].salary;
        g++;
        w1 = 0;
        w2 = 1;
        w3 = 2;
        c1 = 0;
        c2 = 1;
        d1 = 0;
        d2 = 1;
        if (utility_type == "defenses"){
            u = d2 + 1;
        }
        else if (utility_type == "centers"){
            u = c2 + 1;
        }
        else if (utility_type == "wings"){
            u = w3 + 1;
        }
        return [8, g, w1, w2, w3, c1, c2, d1, d2, u, salary];
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
function search(data,utility_type,top_lus){
    //Initial values
    //Max salary
    var salary = MAX_SALARY;
    //Goalie starts at index 0
    var g=0;
    //These variables determine the index or position index to determine the place of the iteration.
    var w1=0;
    var w2=1;
    var w3=2;
    var c1=0;
    var c2=1;
    var d1=0;
    var d2=1;
    var position = 9;
    var players = nhl_data_to_positions(data);
    var centers = players.centers;
    var defenses = players.defenses;
    var wings = players.wings;
    var goalies = players.goalies;

    //number of wing/center/defense positions to fill required for iteration steps
    var num_wings = 3;
    var num_centers = 2;
    var num_defenses = 2;
    if (utility_type == "centers"){
        var utility = centers;
        var u = 2;
        var num_centers = 3;
    }
    else if (utility_type == "defenses"){
        var utility = defenses;
        var u = 2;
        var num_defenses = 3;
    }
    if (utility_type == "wings"){
        var utility = wings;
        var u = 3;
        var num_wings = 4;
    }
    //length of each position array required for iteration steps
    var len_centers = centers.length;
    var len_defenses = defenses.length;
    var len_wings = wings.length;
    var len_goalies = goalies.length;
    var len_utility = utility.length;

    do{
        //Automatically fills in NUM_LUS number of lineups before comparing
        if (top_lus.length < NUM_LUS){
            top_lus_min_points = 0;
        }
        else{
            top_lus_min_points = top_lus[top_lus.length - 1].points;
        }
        var current_lu_points =  goalies[g].points + wings[w1].points + wings[w2].points + wings[w3].points + centers[c1].points + centers[c2].points + defenses[d1].points + defenses[d2].points + utility[u].points;
        switch (position)
        {
            case 9:
                salary -= goalies[g].salary;
            case 8:
                salary -= wings[w1].salary;
                if (salary >= 17500 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, g, w1, w2, w3, c1, c2, d1, d2, u, salary] = iterate(centers,defenses,wings,goalies,utility,utility_type,8,g,w1,w2,w3,c1,c2,d1,d2,u,len_centers,len_defenses,len_wings,len_goalies,len_utility,num_wings,num_centers,num_defenses);
                    break;
                }
            case 7:
                salary -= wings[w2].salary;
                if (salary >= 15000 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, g, w1, w2, w3, c1, c2, d1, d2, u, salary] = iterate(centers,defenses,wings,goalies,utility,utility_type,7,g,w1,w2,w3,c1,c2,d1,d2,u,len_centers,len_defenses,len_wings,len_goalies,len_utility,num_wings,num_centers,num_defenses);
                    break;
                }
            case 6:
                salary -= wings[w3].salary;
                if (salary >= 12500 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, g, w1, w2, w3, c1, c2, d1, d2, u, salary] = iterate(centers,defenses,wings,goalies,utility,utility_type,6,g,w1,w2,w3,c1,c2,d1,d2,u,len_centers,len_defenses,len_wings,len_goalies,len_utility,num_wings,num_centers,num_defenses);
                    break;
                }
            case 5:
                salary -= centers[c1].salary;
                if (salary >= 10000 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, g, w1, w2, w3, c1, c2, d1, d2, u, salary] = iterate(centers,defenses,wings,goalies,utility,utility_type,5,g,w1,w2,w3,c1,c2,d1,d2,u,len_centers,len_defenses,len_wings,len_goalies,len_utility,num_wings,num_centers,num_defenses);
                    break;
                }
            case 4:
                salary -= centers[c2].salary;
                if (salary >= 7500 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, g, w1, w2, w3, c1, c2, d1, d2, u, salary] = iterate(centers,defenses,wings,goalies,utility,utility_type,4,g,w1,w2,w3,c1,c2,d1,d2,u,len_centers,len_defenses,len_wings,len_goalies,len_utility,num_wings,num_centers,num_defenses);
                    break;
                }
            case 3:
                salary -= defenses[d1].salary;
                if (salary >= 5000 && current_lu_points> top_lus_min_points){
                }
                else{
                    [position, g, w1, w2, w3, c1, c2, d1, d2, u, salary] = iterate(centers,defenses,wings,goalies,utility,utility_type,3,g,w1,w2,w3,c1,c2,d1,d2,u,len_centers,len_defenses,len_wings,len_goalies,len_utility,num_wings,num_centers,num_defenses);
                    break;
                }
            case 2:
                salary -= defenses[d2].salary;
                if (salary >= 2500 && current_lu_points > top_lus_min_points){
                }
                else{
                    [position, g, w1, w2, w3, c1, c2, d1, d2, u, salary] = iterate(centers,defenses,wings,goalies,utility,utility_type,2,g,w1,w2,w3,c1,c2,d1,d2,u,len_centers,len_defenses,len_wings,len_goalies,len_utility,num_wings,num_centers,num_defenses);
                    break;
                }
            case 1:
                if (utility[u].salary <= salary && current_lu_points > top_lus_min_points){
                    var current_lu = [goalies[g],wings[w1],wings[w2],wings[w3], centers[c1], centers[c2], defenses[d1], defenses[d2], utility[u]];
                    top_lus = check_lu(top_lus,current_lu_points,current_lu);
                    [position, g, w1, w2, w3, c1, c2, d1, d2, u, salary] = iterate(centers,defenses,wings,goalies,utility,utility_type,1,g,w1,w2,w3,c1,c2,d1,d2,u,len_centers,len_defenses,len_wings,len_goalies,len_utility,num_wings,num_centers,num_defenses);
                }
                else{
                    [position, g, w1, w2, w3, c1, c2, d1, d2, u, salary] = iterate(centers,defenses,wings,goalies,utility,utility_type,1,g,w1,w2,w3,c1,c2,d1,d2,u,len_centers,len_defenses,len_wings,len_goalies,len_utility,num_wings,num_centers,num_defenses);
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
