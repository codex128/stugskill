
const { rating, rate } = require('openskill')

const OUTGOING = 'STUG_OUTGOING_TRAFFIC';
const INCOMING = 'STUG_INCOMING_TRAFFIC';

const START_MU = 25.0;

function computeInGameRank(xp) {
    return 0.025 * Math.sqrt(xp);
}

function createNewRating(xp) {
    var mu = computeInGameRank(xp) * (80 / 350);
    return {mu: mu, sigma: mu / 3};
}

function injectScript(name, func) {
    const content = `(${func.toString()})();`;
    console.log("injecting script: " + content);
    const script = document.createElement("script");
    script.setAttribute("type", "text/javascript");
    script.setAttribute("name", name);
    script.textContent = content;
    document.documentElement.appendChild(script);
}

function eventCapture() {
    // Save a copy of the browser's true, untouched WebSocket constructor
  const OriginalWebSocket = window.WebSocket;

  // Re-define WebSocket with our custom wrapper wrapper
  window.WebSocket = function(url, protocols) {
    // Instantiate the real WebSocket connection
    const socket = new OriginalWebSocket(url, protocols);

    // 1. Hook Outgoing Data (Client -> Server)
    const originalSend = socket.send;
    socket.send = function(data) {
      // Broadcast outgoing game inputs/actions to the extension
      window.postMessage({
        type: "STUG_OUTGOING_TRAFFIC",
        payload: data instanceof ArrayBuffer ? new Uint8Array(data) : data
      }, '*');

      return originalSend.apply(this, arguments);
    };

    // 2. Hook Incoming Data (Server -> Client)
    socket.addEventListener('message', (event) => {
      // Broadcast incoming game states/events to the extension
      window.postMessage({
        type: "STUG_INCOMING_TRAFFIC",
        payload: event.data instanceof ArrayBuffer ? new Uint8Array(event.data) : event.data
      }, '*');
    });

    return socket;
  };

  // Ensure the native properties remain intact for game compatibility
  window.WebSocket.prototype = OriginalWebSocket.prototype;
  console.log("WebSocket engine hooked successfully!");
}

// inject event listener to receive events
injectScript("eventCapture", eventCapture);

var teamScores = [0, 0];

async function updatePlayerRatings(data) {
    if (data[1].teams[0].players === 0 || data[1].teams[1].players === 0) {
        return;
    }
    const deltaScores = [
        data[1].teams[0].score - teamScores[0],
        data[1].teams[1].score - teamScores[1]
    ];
    teamScores[0] = data[1].teams[0].score;
    teamScores[1] = data[1].teams[1].score;
    console.log("stugioplayer, update ratings 2");
    if (deltaScores[0] === 0 && deltaScores[1] === 0) {
        return;
    }
    // this update counts as a resolved gamelet
    // update OS for each player in this gamelet
    var teams = [[], []];
    var now = Date.now();
    var trackedPlayerList = null;
    for (var i = 0; i < data[1].players.length; i++) {
        var pdata = data[1].players[i];
        console.log("stugioplayer: getting " + pdata.name);
        if (pdata.team !== null && !pdata.isBot) {
            const key = "stugioplayer_" + pdata.name;
            var storedRating = await browser.storage.local.get(key);
            if (storedRating.mu === undefined) {
                storedRating = createNewRating(pdata.xp);
                if (trackedPlayerList === null) {
                    trackedPlayerList = await browser.storage.local.get();
                    if (trackedPlayerList.length === undefined) {
                        trackedPlayerList = [];
                    }
                }
                trackedPlayerList.push(pdata.name);
            }
            pdata.mu = storedRating.mu;
            pdata.sigma = storedRating.sigma;
            teams[pdata.team].push(pdata);
        }
    }
    var updatedRatings = rate(teams, {score: deltaScores});
    var ratingsToSave = {};
    for (var i = 0; i < teams.length; i++) {
        for (var j = 0; j < teams[i].length; j++) {
            ratingsToSave["stugioplayer_" + teams[i][j].name] = {
                mu: updatedRatings[i][j].mu,
                sigma: updatedRatings[i][j].sigma
            };
        }
    }
    console.log("ratings updated successfully.");
    browser.storage.local.set(ratingsToSave);
    if (trackedPlayerList !== null) {
        browser.storage.local.set({players: trackedPlayerList});
    }
}

const actions = {
    "in_scoreboardData": function(data) {
        updatePlayerRatings(data);
    },
    // add functions to perform actions on game websocket events
};

window.addEventListener('message', (event) => {
    if (event.data.type !== OUTGOING && event.data.type !== INCOMING) {
        return;
    }
    var payload = event.data.payload.toString();
    try {
        payload = JSON.parse(payload.substring(payload.indexOf("[")));
    } catch (e) {
        return;
    }
    var id;
    if (event.data.type === OUTGOING) {
        id = "out_" + payload[0];
    } else {
        id = "in_" + payload[0];
    }
    var a = actions[id];
    if (a) a(payload);
});


