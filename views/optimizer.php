<div class="container">
    <button class = 'loadOptimizer btn btn-primary'>Find Optimal Lineups!</button>

    <div style="display: none;" class = "lineups">
        <h2>Top 5 Lineups</h2>
    </div>

    <div class = "playerTables">
        <h2>Pitchers</h2>
        <table class = "table table-bordered pitchers">
            <thead>
                <tr>
                    <th class="player">Player</th>
                    <th class="status">Status</th>
                    <th class="team">Team</th>
                    <th class="position">Position</th>
                    <th class="salary">Salary</th>
                    <th class="points">Points</th>
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
        <h2>Batters</h2>
        <table class = "table table-bordered batters">
            <thead>
                <tr>
                    <th class="player">Player</th>
                    <th class="status">Status</th>
                    <th class="team">Team</th>
                    <th class="position">Position</th>
                    <th class="salary">Salary</th>
                    <th class="points">Points</th>
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
