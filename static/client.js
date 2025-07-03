const socket = io("https://marketplace-pfci.onrender.com/");

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
        // !!!!!!!!!!! should ensure duplicate tableaus are not created
        createTableaus(players);
        displayTableaus(players);
        displayDraft(returningPlayer.draftingHand);
        displayReserve(returningPlayer.reserve);
        const vendor = players.find(player => player.isVendor == true);
        if (returningPlayer.name == vendor.name){
            if (returningPlayer.isReady == false){
                viewDetailedReservedCards(returningPlayer.reserve, true, true)
            }
        } 
        else{
            if (vendor.isReady == true && returningPlayer.choice.length == 0){
                displayGoodSale(vendor.choice[0], vendor.choice[1], vendor.playerNum)
            }   
        }
             

        
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
    createTableaus(players);
})


/////// GAME LOGIC
socket.on("nextDraftRound", (players) => {
    console.log(players)
    selectGood(players[myPlayerNum].draftingHand, "draft");
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

socket.on("resolveSale", (goodToBuy, price, vendorNum) => {
    if (myPlayerNum != vendorNum){
        displayGoodSale(goodToBuy, price, vendorNum);
    }
})

socket.on("roundUpdate", (players) => {
    displayReserve(players[myPlayerNum].reserve);
    updateStats(players);
})

socket.on("goodPurchased", (purchasedGood, playerNum) => {
    addToTableau(purchasedGood, playerNum)
})

socket.on("chooseLostGood", (player) => {
    if (myPlayerNum == player.playerNum){
        if (player.tableau.length > 0){
            selectGood(player.tableau, "lose");
        }
    }
})

socket.on("removeGoodDOM", (nameOfGoodToRemove, players) => {
    for (let i = 0; i < players.length; i++){
        const goodElement = document.querySelector("#player"+i+" .tableau ."+nameOfGoodToRemove);
        goodElement.remove();
    }
})

socket.on("pineappleTarget", (playerNum, players) => {
    if (myPlayerNum == playerNum){
        const potentialCopies = [...new Set([...players[players[playerNum].neighborNums[0]] ,...players[players[playerNum].neighborNums[1]]])];
        selectGood(potentialCopies, "copy");
    }
})

socket.on("pineappleToken", (image, playerNum) => {
    const pineapples = document.querySelector(`#player${playerNum} .Pineapples`)
    pineapples.addEventListener("mouseover", () => {
        pineapples.src = image;
    })
    pineapples.addEventListener("mouseout", () => {
        pineapples.src = "static/Images/Pineapples.png";
    })
})

function selectGood(goodsToSelectFrom, typeOfSelection){
    console.log(goodsToSelectFrom)
    const goodSelectionDiv = document.createElement("div");
    goodSelectionDiv.id = "goodSelectionDiv";
    const message = document.createElement("p");
    message.textContent = "Selet a good to "+typeOfSelection;
    message.id = "message";
    goodSelectionDiv.append(message);

    const fruitsDiv = document.createElement("div");
    fruitsDiv.classList.add("Fruits");
    const cropsDiv = document.createElement("div");
    cropsDiv.classList.add("Crops");
    const trinketsDiv = document.createElement("div");
    trinketsDiv.classList.add("Trinkets");

    if(typeOfSelection == "lose" || typeOfSelection == "copy"){
        goodSelectionDiv.appendChild(fruitsDiv);
        goodSelectionDiv.appendChild(cropsDiv);
        goodSelectionDiv.appendChild(trinketsDiv);
    }

    for (let i = 0; i < goodsToSelectFrom.length; i++){
        const selectedDiv = document.createElement("div");
        const selectedGood = document.createElement("img");
        selectedGood.src = goodsToSelectFrom[i].image;
        selectedGood.classList.add(goodsToSelectFrom[i].name);
        selectedGood.classList.add(i);
        selectedGood.addEventListener("click", () => {
            const previouslySelectedGood = document.getElementById("selectedGood");
            if (previouslySelectedGood != undefined){
                previouslySelectedGood.removeAttribute("id");
                const previousDiv = document.getElementById("selectedDiv")
                previousDiv.removeAttribute("id");
            }

            selectedGood.id = "selectedGood";
            selectedDiv.id = "selectedDiv";
        })
        selectedDiv.appendChild(selectedGood);

        if (typeOfSelection == "lose" || typeOfSelection == "copy"){
            if (goodsToSelectFrom[i].type == "Fruit"){
                fruitsDiv.appendChild(selectedDiv);
            }
            if (goodsToSelectFrom[i].type == "Crop"){
                cropsDiv.appendChild(selectedDiv);
            }
            else if (goodsToSelectFrom[i].type == "Trinket"){
                trinketsDiv.appendChild(selectedDiv);
            }
        }
        else{goodSelectionDiv.appendChild(selectedDiv);
        }
    }

    const confirmSelection = document.createElement("button");
    confirmSelection.textContent = "Confirm";
    confirmSelection.addEventListener("click", () => {
        const selectedGoodDOM = document.getElementById("selectedGood");
        if (selectedGoodDOM != undefined){
            goodSelectionDiv.remove();
            if(typeOfSelection == "draft"){
                socket.emit("draftedCard", myPlayerNum, selectedGoodDOM.classList[1]);
            }
            else if (typeOfSelection == "sell"){
                return 1;
            }
            else if (typeOfSelection == "lose"){
                socket.emit("removeGood", selectedGoodDOM.classList[0], myPlayerNum);
            }
            else if (typeOfSelection == "copy"){
                const goodToCopy = goodsToSelectFrom.find(good => good.name == selectedGoodDOM.classList[0]);
                socket.emit("copyGood", goodToCopy, myPlayerNum);
            }
        }
    })
    goodSelectionDiv.appendChild(confirmSelection);
    bodyElement.appendChild(goodSelectionDiv);
}

function createTableaus(players){
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
        let coinIcon = document.createElement("img");
        coinIcon.src = "static/Icons/coins.png";
        coinIcon.classList.add("coinIcon")
        stats.appendChild(coinIcon);
        let workers = document.createElement("p");
        workers.classList.add("workers");
        stats.appendChild(workers);
        let workerIcon = document.createElement("img");
        workerIcon.src = "static/Icons/workers.png";
        workerIcon.classList.add("workerIcon");
        stats.appendChild(workerIcon);
        let VP = document.createElement("p");
        VP.classList.add("VP");
        stats.appendChild(VP);
        let VPIcon = document.createElement("img");
        VPIcon.src = "static/Icons/VPIcon.png";
        VPIcon.classList.add("VPIcon");
        stats.appendChild(VPIcon);

        let tableau = document.createElement("div");
        tableau.classList.add("tableau")
        let fruits = document.createElement("div");
        fruits.classList.add("Fruits");
        tableau.appendChild(fruits);
        let crops = document.createElement("div");
        crops.classList.add("Crops");
        tableau.appendChild(crops);
        let trinkets = document.createElement("div");
        trinkets.classList.add("Trinkets");
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
        bodyElement.appendChild(reserveDOM);
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
}

function viewDetailedReservedCards(reserve, shouldEnlarge, canInteract){
    if (shouldEnlarge){
        const detailedReserveView = document.createElement("div");
        detailedReserveView.id = "detailedReserve";
        for (let i = 0; i < reserve.length; i++){
            const reservedCardDiv = document.createElement("div");
            const reservedCard = document.createElement("img");
            reservedCard.src = reserve[i].image;
            reservedCard.classList.add(i, "reserved")
            if (canInteract){
                reservedCardDiv.addEventListener("click", () => {
                    // Pins cannot be sold by itself
                    if (reserve[i].name == "Pins"){
                        if (reservedCard.id == "selectedPins"){
                            reservedCard.removeAttribute("id");
                            reservedCardDiv.removeAttribute("id");
                        }
                        else{
                            reservedCard.id = "selectedPins";
                            reservedCardDiv.id = "selectedPinsDiv";
                        }
                    }
    
                    else{
                        const previouslyReservedCard = document.getElementById("selectedToSell");
                        if (previouslyReservedCard != undefined){
                            previouslyReservedCard.removeAttribute("id");
                            const previousDiv = document.getElementById("selectedDiv")
                            previousDiv.removeAttribute("id");
                        }

                        reservedCard.id = "selectedToSell";
                        reservedCardDiv.id = "selectedDiv";
                    }
                })
            }
            reservedCardDiv.appendChild(reservedCard)
            detailedReserveView.appendChild(reservedCardDiv);
        }

        if (canInteract){
            const setPrice = document.createElement("input")
            setPrice.type = "text";
            setPrice.id = "setPrice"
            detailedReserveView.appendChild(setPrice);
    
            const confirmSale = document.createElement("button");
            confirmSale.textContent = "Sell";
            confirmSale.id = "confirmSale";
            confirmSale.addEventListener("click", () => {
                const goodForSaleDOM = document.getElementById("selectedToSell");
                const indexofGoodForSale = goodForSaleDOM.classList[0]
                if (goodForSaleDOM != undefined && setPrice.value != ""){
                    let goodForSale = [reserve[indexofGoodForSale]];
                    const pins = document.getElementById("selectedPins");
                    if (pins != undefined){
                        pinsIndex = pins.classList[0];
                        goodForSale.push(reserve[pinsIndex]);
                    } 
                    socket.emit("sellGood", goodForSale, setPrice.value, myPlayerNum);
                    detailedReserveView.remove();
                }
            })
            detailedReserveView.appendChild(confirmSale);
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

    if (goodForSale.length == 2) {
        const good = document.createElement("img");
        good.src = goodForSale[1].image;
        good.classList.add("goodForSale");
        currentOffer.appendChild(good);
    }

    const good = document.createElement("img");
    good.src = goodForSale[0].image;
    good.classList.add("goodForSale");
    currentOffer.appendChild(good);

    const salePrice = document.createElement("p");
    salePrice.textContent = price;
    salePrice.classList.add("goodPrice");
    currentOffer.appendChild(salePrice);
   
    const chooseBuy = document.createElement("button");
    chooseBuy.textContent = "Buy"
    chooseBuy.id = "chooseBuy";
    chooseBuy.classList.add(goodForSale[0].type)
    chooseBuy.addEventListener("click", () => {
        socket.emit("saleResult", "buy", myPlayerNum, goodForSale, price, vendorNum);
        currentOffer.remove();
    })
    currentOffer.appendChild(chooseBuy);

    const chooseInvest = document.createElement("button");
    chooseInvest.textContent = "Invest"
    chooseInvest.id = "chooseInvest";
    chooseInvest.addEventListener("click", () => {
        socket.emit("saleResult", "invest", myPlayerNum, goodForSale, price, vendorNum);
        currentOffer.remove();
    })
    currentOffer.appendChild(chooseInvest);

    bodyElement.appendChild(currentOffer);
}

function addToTableau(purchasedGood, playerNum){
    const newGood = document.createElement("img");
    newGood.src = purchasedGood.image;
    newGood.classList.add("good", purchasedGood.name);
    
    //opponent's good
    if (playerNum != myPlayerNum){
        newGood.addEventListener("mouseover", () => {
            newGood.classList.add("blownUpGood");
        })
    
        newGood.addEventListener("mouseout", () => {
            newGood.classList.remove("blownUpGood");
        })
    }

    //player's good
    else{
        if (purchasedGood.active != "none"){
            newGood.addEventListener("click", () => {
                purchasedGood.active;
            })
        }
    }
    const tableauSection = document.querySelector(`#player${playerNum} .${purchasedGood.type}s`)
    tableauSection.appendChild(newGood);
}

function updateStats(players){
    for (let i = 0; i < players.length; i++){
        const displayedCoins = document.querySelector(`#player${i} .coins`);
        displayedCoins.textContent = players[i].numCoins;
        const displayedWorkers = document.querySelector(`#player${i} .workers`);
        displayedWorkers.textContent = players[i].numWorkers;
        const displayedScore = document.querySelector(`#player${i} .VP`);
        displayedScore.textContent = players[i].numVP;
    }
}

function displayTableaus(players){
    for (let i = 0; i < players.length; i++){
        for (let j = 0; j < players[i].tableau.length; j++){
            const goodAlreadyDisplayed = document.getElementsByClassName(players[i].tableau[j].name)[0];
            if (goodAlreadyDisplayed == undefined){
                addToTableau(purchasedGood, i);
            }
        }
    }
}
function fullUpdate(players, thisPlayer){
    updateDraft(cardsToDraft);
    updateReserve(thisPlayer);
    updateCurrentOffer();
    updateTableaus(players);
    updateStats(players);
}