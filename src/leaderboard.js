
console.log("hello from gui!");

const PLAYER_TABLE_COLUMNS = ["Player", "OS"];

console.log("initializing gui");

async function updatePlayerTable(filter) {
    console.log("updating player table...");
    var ptable = document.getElementById("player-table");
    ptable.replaceChildren(); // remove all children
    var header = document.createElement("tr");
    for (var i = 0; i < PLAYER_TABLE_COLUMNS.length; i++) {
        console.log("adding column header: " + PLAYER_TABLE_COLUMNS[i]);
        var column = document.createElement("th");
        column.textContent = PLAYER_TABLE_COLUMNS[i];
        header.appendChild(column);
    }
    ptable.appendChild(header);
    var players = await browser.storage.local.get("players");
    players = players.players;
    console.log(players);
    var rows = [];
    for (var i = 0; i < players.length; i++) {
        if (filter && !filter(players[i])) {
            continue;
        }
        console.log("getting player stats: " + players[i]);
        var rating = await browser.storage.local.get("stugioplayer_" + players[i]);
        rating = rating["stugioplayer_" + players[i]];
        rows.push({name: players[i], mu: rating.mu, sigma: rating.sigma});
    }
    console.log(rows);
    rows.sort((a, b) => b.mu - a.mu);
    console.log(rows);
    for (var i = 0; i < rows.length; i++) {
        var row = document.createElement("tr");
        var name = document.createElement("th");
        name.textContent = rows[i].name;
        var os = document.createElement("th");
        os.textContent = Math.floor(rows[i].mu);
        row.appendChild(name);
        row.appendChild(os);
        ptable.appendChild(row);
    }
    console.log("finished updating table!");
}

console.log("adding click listener");
document.getElementById("fetch-players").onclick = function() {
    console.log("fetching...");
    var name = document.getElementById("name-filter").value;
    console.log("writing table...");
    updatePlayerTable(p => { return p.includes(name); });
};
console.log("finished with init!");


