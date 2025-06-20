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

////// DOM MANIPULATION
const bodyElement = document.body;
const joinGameButton = document.getElementsByClassName("joinGame")[0];
// should check to ensure no duplicate names
// ???????????????????????
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
    alert("The name "+duplicateName+" is already being used by another player!");
})

socket.on("joinedLobby", () => {
    const startGameButton = document.createElement("button");
    startGameButton.id = "startGame";
    startGameButton.textContent = "Start Game"
    startGameButton.addEventListener("click", () => {
        socket.emit("startGame");
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
        const player = document.createElement("li");
        player.id = "name:"+players[i].userID;
        player.textContent = players[i].name;
        playerList.appendChild(player);

        const playerColor = document.createElement("div")
        playerColor.id = "color:"+players[i].userID;
        playerColor.style.backgroundColor = players[i].color;
        playerList.appendChild(playerColor);
    }
})
socket.on("playerJoined", (newPlayerID, newPlayerName, newPlayerColor) => {
    const newPlayer = document.createElement("li");
    newPlayer.id = "name:"+newPlayerID;
    newPlayer.textContent = newPlayerName;
    playerList.appendChild(newPlayer);

    const playerColor = document.createElement("div")
    playerColor.id = "color:"+newPlayerID;
    console.log("color: "+newPlayerColor)
    playerColor.style.backgroundColor = newPlayerColor;
    playerList.appendChild(playerColor);
})
socket.on("playerModified", (playerID, newPlayerName, newPlayerColor) => {
    const modifiedPlayer = [document.getElementById("name:"+playerID), document.getElementById("color:"+playerID)];
    modifiedPlayer[0].textContent = newPlayerName;
    modifiedPlayer[1].style.backgroundColor = newPlayerColor;

})
socket.on("playerLeft", (playerID) => {
    const leavingPlayer = [document.getElementById("name:"+playerID), document.getElementById("color:"+playerID)];
    playerList.removeChild(leavingPlayer[0]);
    playerList.removeChild(leavingPlayer[1]);
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