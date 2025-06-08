const socket = io("http://localhost:3000");

socket.on("connect", () => {
    allCookies = document.cookie;
    socket.emit("currentCookie", allCookies);
});
socket.on("addCookie", (cookie) => {
    document.cookie = cookie;
})
socket.on("storedName", (chosenName) => {
    const nameEntryField = getElementById("playerName");
    nameEntryField.textContent = chosenName;
})

const bodyElement = document.body;
const joinGameButton = document.getElementById("joinGame");
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

const playerList = document.getElementById("playerList");
socket.on("playerJoined", (newPlayerName) => {
    const newPlayer = document.createElement("li");
    newPlayer.classList.add(newPlayerName);
    newPlayer.textContent = newPlayerName;
    playerList.appendChild(newPlayer);
})
socket.on("playerLeft", (playerName) => {
    const leavingPlayer = document.getElementById(playerName);
    playerList.removeChild(leavingPlayer);
})

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