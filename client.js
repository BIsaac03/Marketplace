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

socket.on("joinedLobby", (player) => {
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

socket.on("returningPlayer", (returningPlayer, players) => {
    console.log(returningPlayer.name + " has returned!")
    if (!returningPlayer.isInGame){
        const startGameButton = document.createElement("button");
        startGameButton.id = "startGame";
        startGameButton.textContent = "Start Game"
        startGameButton.addEventListener("click", () => {
            if (confirm("Are you sure you want to start the game? New player will not be able to join an in-progress game.")){
                socket.emit("startGame");
            }
        })
        bodyElement.appendChild(startGameButton);
        
        const joinGameButton = document.getElementsByClassName("joinGame")[0];
        joinGameButton.value = "Update"
    }
    
    else{
        myPlayerNum = returningPlayer.playerNum;
        bodyElement.innerHTML = "";
        displayDraft(returningPlayer.draftingHand);
        displayReserve(returningPlayer.reserve);
        if (returningPlayer.choice == ""){
            const vendor = players.find(player => player.isVendor == true); 
            displayGoodSale(vendor.reserve[vendor.choice[0]], vendor.choice[1], vendor.playerNum)
        }        
        displayTableaus(players);
    }
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
    const userID = readCookieValue("userID");
    const thisPlayer = players.find(player => player.userID == userID);
    myPlayerNum = thisPlayer.playerNum;

    bodyElement.innerHTML = "";
    displayTableaus(players);
})


/////// GAME LOGIC
socket.on("nextDraftRound", (players) => {
    displayDraft(players[myPlayerNum].draftingHand);
})

socket.on("displayReserve", (players) => {
    clearDraftingPopUp();
    displayReserve(players[myPlayerNum].reserve);
})

socket.on("setSaleTerms", (reserve, vendorNum) => {
    if (myPlayerNum == vendorNum){
        viewDetailedReservedCards(reserve, true, true);
    }
})

socket.on("resolveSale", (goodForSale, price, vendorNum) => {
    if (myPlayerNum != vendorNum){
        displayGoodSale(goodForSale, price, vendorNum);
    }
})

function displayTableaus(players){
    let opponentDisplay = document.createElement("div");
    opponentDisplay.id = "opponentDisplay";
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
        tableau.classList.add("tableau")
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
}


/////// DISPLAY UPDATES
function displayDraft(draftingHand){
    clearDraftingPopUp();
    const draftingPopUp = document.createElement("div");
    draftingPopUp.id = "draftingPopUp";
    for (let i = 0; i < draftingHand.length; i++){
        const draftingOption = document.createElement("img");
        draftingOption.classList.add("draftingOption", "good");
        draftingOption.src = draftingHand[i].image;
        draftingOption.addEventListener("click", () => {
            socket.emit("draftedCard", myPlayerNum, i);
        })
        draftingPopUp.appendChild(draftingOption);
    }
    bodyElement.appendChild(draftingPopUp)
}

function clearDraftingPopUp() {
    const draftingPopUp = document.getElementById("draftingPopUp");
    if (draftingPopUp != undefined){
        draftingPopUp.remove();
    }
}

function displayReserve(reserve){
    let shouldEnlarge = true;
    let reserveDOM = document.getElementById("reserve");
    if (reserveDOM == undefined){
        reserveDOM = document.createElement("div");
        reserveDOM.id = "reserve";
    }
    reserveDOM.innerHTML = ""
    for (let i = 0; i < reserve.length; i++){
        const reservedCard = document.createElement("img");
        reservedCard.src = reserve[i].image;
        reservedCard.classList.add("icon", "reserved"+i)
        reservedCard.addEventListener("click", () => {
            viewDetailedReservedCards(reserve, shouldEnlarge, false);
            shouldEnlarge = !shouldEnlarge;
        })
        reserveDOM.appendChild(reservedCard);
    }
    
    bodyElement.appendChild(reserveDOM);
}

function viewDetailedReservedCards(reserve, shouldEnlarge, canInteract){
    if (shouldEnlarge){
        const detailedReserveView = document.createElement("div");
        detailedReserveView.id = "detailedReserve";
        for (let i = 0; i < reserve.length; i++){
            const reservedCard = document.createElement("img");
            reservedCard.src = reserve[i].image;
            reservedCard.classList.add(reserve[i].name, "reserved"+i)
            if (canInteract){
                reservedCard.addEventListener("click", () => { 
                    let salePrice = prompt("How many coins do you want to sell your good for?");
                    socket.emit("sellGood", i, salePrice, myPlayerNum);
                    viewDetailedReservedCards(reserve, false, false);
                })
            }
            detailedReserveView.appendChild(reservedCard);
        }
        bodyElement.appendChild(detailedReserveView);
    }
    else{
        const detailedReserveView = document.getElementById("detailedReserve");
        detailedReserveView.remove();
    }
}

function displayGoodSale(goodForSale, price, vendorNum){
    const currentOffer = document.createElement("div");
    currentOffer.id = "currentOffer";

    const good = document.createElement("img");
    good.src = goodForSale.image;
    good.classList.add("goodForSale");
    currentOffer.appendChild(good);

    const salePrice = document.createElement("p");
    salePrice.textContent = price;
    salePrice.classList.add("goodPrice");
    currentOffer.appendChild(salePrice);
   
    const chooseBuy = document.createElement("button");
    chooseBuy.textContent = "Buy"
    chooseBuy.id = "chooseBuy";
    chooseBuy.classList.add(goodForSale.type)
    chooseBuy.addEventListener("click", () => {
        socket.emit("saleResult", "buy", goodForSale, price, vendorNum);
        currentOffer.remove();
    })
    currentOffer.appendChild(chooseBuy);

    const chooseInvest = document.createElement("button");
    chooseInvest.textContent = "Invest"
    chooseInvest.id = "chooseInvest";
    chooseInvest.addEventListener("click", () => {
        socket.emit("saleResult", "invest", goodForSale, price, vendorNum);
        currentOffer.remove();
    })
    currentOffer.appendChild(chooseInvest);

    bodyElement.appendChild(currentOffer);
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