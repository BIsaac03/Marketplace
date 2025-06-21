const socket = io("http://localhost:3000");

function readCookieValue(name){
    const allCookies = document.cookie.split(';');
    const cookie = allCookies.find((cookie) => cookie.trim().startsWith(name));
    if (cookie === undefined){
        return undefined;
    }
    const value = cookie.trim().replace(name+"=", "");
    return value;
}

function modifyPlayerList(playerList, playerID, playerName, playerColor){
    const existingPlayer = document.getElementById(playerID);
    if (existingPlayer === null){
        const player = document.createElement("div");
        player.id = playerID;
        player.classList.add("player");

        const playerColorDOM = document.createElement("div");
        playerColorDOM.classList.add("playerColor");
        playerColorDOM.style.backgroundColor = playerColor;
        player.appendChild(playerColorDOM);

        const playerNameDOM = document.createElement("li");
        playerNameDOM.classList.add("playerName");
        playerNameDOM.textContent = playerName;
        player.appendChild(playerNameDOM);

        playerList.append(player);

    }
    else{
        console.log(existingPlayer)
        existingPlayer.children[0].style.backgroundColor = playerColor;
        existingPlayer.children[1].textContent = playerName;
    }
}

////// DOM MANIPULATION
const bodyElement = document.body;
const joinGameButton = document.getElementsByClassName("joinGame")[0];
joinGameButton.addEventListener("click", () => {
    let playerName = document.getElementById("playerName").value;
    let playerColor = document.getElementById("playerColor").value;
    if (playerName != ""){
        document.cookie = "chosenName="+playerName;
        document.cookie = "preferredColor="+playerColor;
        socket.emit("joinGame", readCookieValue("userID"), playerName, playerColor);
    }
})

////// SOCKET EVENTS
socket.on("connect", () => {
    userIDCookie = readCookieValue("userID");
    if (userIDCookie === undefined){
        document.cookie = "userID="+Math.random().toString(36).substring(1, 30);
        userIDCookie = readCookieValue("userID");
    }
    socket.emit("currentID", userIDCookie);

    const nameEntryField = document.getElementById("playerName");
    let chosenName = readCookieValue("chosenName");
    if (nameEntryField != undefined && chosenName != undefined){
        nameEntryField.value = chosenName;
    }
    const colorSelector = document.getElementById("playerColor");
    let preferredColor = readCookieValue("preferredColor");
    if (colorSelector != undefined && preferredColor != undefined){
        colorSelector.value = preferredColor;
    }
});

socket.on("nameTaken", (duplicateName) => {
    alert("The name \""+duplicateName+"\" is already being used by another player!");
})

socket.on("joinedLobby", () => {
    const startGameButton = document.createElement("button");
    startGameButton.id = "startGame";
    startGameButton.textContent = "Start Game"
    startGameButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to start the game? New player will not be able to join an in-progress game.")){
            socket.emit("startGame");
        }
    })
    bodyElement.appendChild(startGameButton);
    joinGameButton.value = "Update"
})

socket.on("returningPlayer", (returningPlayer) => {
    console.log(returningPlayer.name + " has returned!")
    const joinGameButton = document.getElementsByClassName("joinGame")[0];
    joinGameButton.value = "Update"
})

// modifies list of players in lobby
const playerList = document.getElementById("playerList");
socket.on("displayExistingPlayers", (players) => {
    for (let i = 0; i < players.length; i++){
        modifyPlayerList(playerList, players[i].userID, players[i].name, players[i].color);
    }
})
socket.on("playerJoined", (PlayerID, newPlayerName, newPlayerColor) => {
    modifyPlayerList(playerList, PlayerID, newPlayerName, newPlayerColor);
})
socket.on("playerLeft", (playerID) => {
    const leavingPlayer =document.getElementById(playerID);
    playerList.removeChild(leavingPlayer);
})


socket.on("gameStart", (players) => {
    const userID = readCookieValue("userID");
    const thisPlayer = players.find(player => player.userID == userID)
})


/////// GAME LOGIC
let price = 3;
let good = {name: "blueberries"};
socket.emit("sellGood", price, good)

socket.on("cardOrCoins", (price) => {
    choice = prompt("Do you want to pay " + price + " coins for " + good.name + "? Otherwise, you will gain " + price + " coins.")
    if (choice == "y"){
        socket.emit("cardOrCoins", "card");
    }
    else{
        socket.emit("cardOrCoins", "coins");
    }
})


/////// UPDATES
function updateHand(thisPlayer){

}

function updateReserve(thisPlayer){

}

function updateCurrentOffer(){

}

function updateTableaus(){

}

function updateCoins(players){
    for (let i = 0; i < players.length; i++){
        const numCoins = players[i].VP;
        const displayedCoins = document.getElementById("player"+i+"coins");
        displayedCoins.textContent = coins;
    }
}

function updateActivePlayer(){

}

function updateScores(players){
    for (let i = 0; i < players.length; i++){
        const score = players[i].VP;
        const displayedScore = document.getElementById("player"+i+"score");
        displayedScore.textContent = score;
    }
}

function fullUpdate(players, thisPlayer){
    updateHand(thisPlayer);
    updateReserve(thisPlayer);
    updateCurrentOffer();
    updateTableaus(players);
    updateCoins(players);
    updateActivePlayer();
    updateScores(players);
}