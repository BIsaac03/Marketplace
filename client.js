const socket = io("http://localhost:3000");

function readCookieValue(name){
    const allCookies = document.cookie.split(';');
    const cookie = allCookies.find((cookie) => cookie.startsWith(name));
    if (cookie === undefined){
        return undefined;
    }
    const value = cookie.replace(name+"=", "");
    return value;
}

////// DOM MANIPULATION
const bodyElement = document.body;
const joinGameButton = document.getElementById("joinGame");
// should check to ensure no duplicate names
// ???????????????????????
joinGameButton.addEventListener("click", () => {
    let playerName = document.getElementById("playerName").value;
    if (playerName != ""){
        socket.emit("joinGame", playerName, document.cookie);
    }

    const startGameButton = document.createElement("button");
    startGameButton.id = "startGame";
    startGameButton.textContent = "Start Game"
    startGameButton.addEventListener("click", () => {
        socket.emit("startGame");
    })
    bodyElement.appendChild(startGameButton);
    bodyElement.removeChild(joinGameButton);

    socket.on("disconnecting", (playerName) => {
        socket.emit('test', playerName);
    })
})
bodyElement.appendChild(joinGameButton);

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
    const chosenName = readCookieValue("chosenName");
    if (chosenName != undefined){
        nameEntryField.textContent = chosenName;
    }
});
socket.on("recordChosenName", (chosenName) => {
    document.cookie = "chosenName="+chosenName;
})

const playerList = document.getElementById("playerList");
socket.on("existingPlayers", (players) => {
    for (let i = 0; i < players.length; i++){
        let playerName = players[i].name;
        const player = document.createElement("li");
        player.id = "player:"+playerName;
        player.textContent = playerName;
        playerList.appendChild(player);
    }
})
socket.on("playerJoined", (newPlayerName) => {
    const newPlayer = document.createElement("li");
    newPlayer.id = "player:"+newPlayerName;
    newPlayer.textContent = newPlayerName;
    playerList.appendChild(newPlayer);
})
socket.on("playerLeft", (playerName) => {
    const leavingPlayer = document.getElementById("player:"+playerName);
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