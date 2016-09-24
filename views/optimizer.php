<div class="container">
    <div class = "sports">
        <span class = "sports-btn mlb-btn selected">MLB</span>
        <span class = "sports-btn nhl-btn">NHL</span>
    </div>
    <div class = "loader hidden">
        Loading...
    </div>
    <button class = 'loadOptimizer btn btn-primary'>Find Optimal Lineups!</button>
    <div class = 'positions mlbPositions'>
        Positions:
        <span class = "position-btn pitchers-btn selected">Pitchers</span>
        <span class = "position-btn batters-btn">Batters</span>
    </div>

    <div class = "lineups hidden">
    </div>

    <div class = "playerTables mlbTables">
        <div class = "search search-mlb">
            <label>Search: </label>
            <input class = "form-control search-input search-input-mlb">
        </div>
        <div class = "pitchersSection">
            <table class = "table table-bordered pitchers">
                <thead>
                    <tr>
                        <th class="player">Player</th>
                        <th class="status">Status</th>
                        <th class="team">Team</th>
                        <th class="position">Position</th>
                        <th class="salary">Salary</th>
                        <th class="points">Points</th>
                        <th class="remove">Remove</th>
                    </tr>
                </thead>
                <tbody class = "pitchersTable">
                </tbody>
            </table>
            <div class = "pitchersPagination" data-index = "0" data-player="pitchers">
                <span class = "previous hidden">Prev</span>
                <span class = "pages"></span>
                <span class = "next hidden">Next</span>
            </div>
        </div>
        <div class = "battersSection hidden">
            <table class = "table table-bordered batters">
                <thead>
                    <tr>
                        <th class="player">Player</th>
                        <th class="status">Status</th>
                        <th class="team">Team</th>
                        <th class="position">Position</th>
                        <th class="salary">Salary</th>
                        <th class="points">Points</th>
                        <th class="remove">Remove</th>
                    </tr>
                </thead>
                <tbody class = "battersTable">
                </tbody>
            </table>
            <div class = "battersPagination" data-index= "0" data-player= "batters">
                <span class = "previous hidden">Prev</span>
                <span class = "pages"></span>
                <span class = "next hidden">Next</span>
            </div>
        </div>
    </div>
    <div class = "playerTables nhlTables hidden">
        <h1>Waiting for NHL season!</h1>
    </div>
</div>
