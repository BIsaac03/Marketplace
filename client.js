const socket = io("http://localhost:3000");

const bodyElement = document.body;
const joinGameButton = document.createElement("button");
joinGameButton.id = "joinGame";
joinGameButton.textContent = "Join Game"
joinGameButton.addEventListener("click", () => {
    let playerName = prompt("what is your name?");
    socket.emit("joinGame", playerName);

    const startGameButton = document.createElement("button");
    startGameButton.id = "startGame";
    startGameButton.textContent = "Start Game"
    startGameButton.addEventListener("click", () => {
        socket.emit("startGame");
    })
    bodyElement.appendChild(startGameButton);
    bodyElement.removeChild(joinGameButton);

})
bodyElement.appendChild(joinGameButton);


// Displays players currently in the game
const playerList = document.createElement("p");
playerList.id = "playerList"
playerList.textContent = "Joined players: ";
bodyElement.appendChild(playerList)
socket.on("newPlayer", (newPlayerName) => {
    playerList.textContent += "\n" + newPlayerName;
})