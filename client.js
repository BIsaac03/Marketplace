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

function modifyPlayerList(playerList, playerID, playerName, playerColor, isMe){
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

        if (isMe){
            const leaveLobbyButton = document.createElement("button");
            leaveLobbyButton.id = "leaveLobbyButton";
            leaveLobbyButton.addEventListener("click", () => {
                playerList.removeChild(player);
            })
            player.appendChild(leaveLobbyButton);
        }

        playerList.append(player);

    }
    else{
        console.log(existingPlayer)
        existingPlayer.children[0].style.backgroundColor = playerColor;
        existingPlayer.children[1].textContent = playerName;
    }
}

let myPlayerNum = undefined;
let inLobby = false;
let inGame = false;

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
    inLobby = true;
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
    const startGameButton = document.createElement("button");
    startGameButton.id = "startGame";
    startGameButton.textContent = "Start Game"
    startGameButton.addEventListener("click", () => {
        if (confirm("Are you sure you want to start the game? New player will not be able to join an in-progress game.")){
            socket.emit("startGame");
        }
    })
    bodyElement.appendChild(startGameButton);
    
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


socket.on("gameStartSetup", (players) => {
    inLobby = false;
    inGame = true;
    const userID = readCookieValue("userID");
    const thisPlayer = players.find(player => player.userID == userID);
    myPlayerNum = thisPlayer.playerNum;

    bodyElement.innerHTML = "";
    let opponentDisplay = document.createElement("div");
    for (let i = 0; i < players.length; i++){
        let player = document.createElement("div");
        player.id = "player"+players[i].playerNum;
        let stats = document.createElement("div");
        stats.classList.add("stats");
        let coins = document.createElement("p");
        coins.classList.add("coins");
        stats.appendChild(coins);
        let workers = document.createElement("p");
        workers.classList.add("workers");
        stats.appendChild(workers);
        let VP = document.createElement("p");
        VP.classList.add("VP");
        stats.appendChild(VP);

        let tableau = document.createElement("div");
        let fruits = document.createElement("div");
        fruits.classList.add("fruits");
        tableau.appendChild(fruits);
        let crops = document.createElement("div");
        crops.classList.add("crops");
        tableau.appendChild(crops);
        let trinkets = document.createElement("div");
        trinkets.classList.add("trinkets");
        tableau.appendChild(trinkets);

        player.appendChild(stats);
        player.appendChild(tableau);

        if (players[i] == players[myPlayerNum]){
            player.classList.add("myself");
            bodyElement.appendChild(player);
        }
        else{
            player.classList.add("opponent");
            opponentDisplay.appendChild(player);
        }
    }
    bodyElement.appendChild(opponentDisplay);
})


/////// GAME LOGIC
socket.on("nextDraftRound", (players) => {
    const cardsToChooseFrom = players[myPlayerNum].draftingHand;
    const draftingPopUp = document.createElement("div");
    draftingPopUp.id = "draftingPopUp";
    for (let i = 0; i < cardsToChooseFrom.length; i++){
        const draftingOption = document.createElement("img");
        draftingOption.classList.add("draftingOption", "good");
        draftingOption.src = cardsToChooseFrom[i].image;
        draftingOption.addEventListener("click", () => {
            socket.emit("draftedCard", myPlayerNum, i);
        })
        draftingPopUp.appendChild(draftingOption);
    }
    bodyElement.appendChild(draftingPopUp)
})

socket.on("clearDraftingPopUp", () => {
    const draftingPopUp = document.getElementById("draftingPopUp");
    draftingPopUp.remove();
})

socket.on("setSaleTerms", (cardsInReserve, vendorNum) => {
    if (myPlayerNum == vendorNum){
        let goodToSell = prompt("What good do you want to sell?");
        while(!cardsInReserve.some(good => good.name == goodToSell)){
            goodToSell = prompt("You have not reserved this good. Enter a good you can sell.");
        }
        let salePrice = prompt("How many coins do you want to sell your "+goodToSell+" for?")
        socket.emit("sellGood", goodToSell, salePrice);
    }
})

socket.on("resolveSale", (goodToBuy, price, vendorNum) => {
    if (myPlayerNum != vendorNum){
        // !!!!!!!!!! good should be displayed during sale

        choice = prompt("Do you want to pay " + price + " coins for " + goodToBuy + "? Otherwise, you will gain " + price + " coins.")
        if (choice == "y"){
            socket.emit("saleResult", "card");
        }
        else{
            socket.emit("saleResult", "coins");
        }
    }
})


/////// DISPLAY UPDATES
function updateDraft(cardsToDraft){

}

function updateReserve(thisPlayer){

}

function updateCurrentOffer(){

}

function updateTableaus(){

}

function updateCoins(players){
    for (let i = 0; i < players.length; i++){
        const displayedCoins = document.querySelector(`#player${i} .coins`);
        displayedCoins.textContent = players[i].numCoins;
    }
}

function updateActivePlayer(){

}

function updateScores(players){
    for (let i = 0; i < players.length; i++){
        const displayedScore = document.querySelector(`#player${i} .VP`);
        displayedScore.textContent = players[i].VP;
    }
}

function fullUpdate(players, thisPlayer){
    updateDraft(cardsToDraft);
    updateReserve(thisPlayer);
    updateCurrentOffer();
    updateTableaus(players);
    updateCoins(players);
    updateActivePlayer();
    updateScores(players);
}