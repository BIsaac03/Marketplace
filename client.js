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
const joinGameButton = document.getElementsByClassName('joinGame')[0];
// should check to ensure no duplicate names
// ???????????????????????
joinGameButton.addEventListener("click", () => {
    let playerName = document.getElementById("playerName").value;
    if (playerName != ""){
        document.cookie = "chosenName="+playerName;
        socket.emit("joinGame", playerName, readCookieValue("userID"));
    }
    const startGameButton = document.createElement("button");
    startGameButton.id = "startGame";
    startGameButton.textContent = "Start Game"
    startGameButton.addEventListener("click", () => {
        socket.emit("startGame");
    })
    bodyElement.appendChild(startGameButton);
    console.log("should hide"+joinGameButton)
    joinGameButton.style.visibility = "hidden"
})

////// SOCKET EVENTS
socket.on("connect", () => {
    userIDCookie = readCookieValue("userID");
    if (userIDCookie === undefined){
        document.cookie = "userID="+Math.random().toString(36).substring(1, 30);
        userIDCookie = readCookieValue("userID");
    }
    console.log("ID:" + userIDCookie);
    socket.emit("currentID", userIDCookie);

    const nameEntryField = document.getElementById("playerName");
    let chosenName = readCookieValue("chosenName");
    if (nameEntryField != undefined && chosenName != undefined){
        nameEntryField.value = chosenName;
    }
});

socket.on("returningPlayer", (returningPlayer) => {
    console.log(returningPlayer.name + " has returned!")
    const joinGameButton = document.getElementsByClassName('joinGame')[0];
    joinGameButton.style.visibility = "hidden"
})

const playerList = document.getElementById("playerList");
socket.on("displayExistingPlayers", (players) => {
    for (let i = 0; i < players.length; i++){
        const player = document.createElement("li");
        console.log(players[i].userID)
        player.id = "player:"+players[i].userID;
        player.textContent = players[i].name;
        playerList.appendChild(player);
    }
})
socket.on("playerJoined", (newPlayerID, newPlayerName) => {
    const newPlayer = document.createElement("li");
    newPlayer.id = "player:"+newPlayerID;
    newPlayer.textContent = newPlayerName;
    playerList.appendChild(newPlayer);
})
socket.on("playerLeft", (playerID) => {
    const leavingPlayer = document.getElementById("player:"+playerID);
    playerList.removeChild(leavingPlayer);
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