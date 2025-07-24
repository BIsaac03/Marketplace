//const socket = io("https://marketplace-pfci.onrender.com/");
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

            const leaveLobbyButton = document.createElement("button");
            leaveLobbyButton.id = "leaveLobbyButton";
            leaveLobbyButton.textContent = "X";
            leaveLobbyButton.addEventListener("click", () => {
                socket.emit("leftLobby", playerID);
            })
            player.appendChild(leaveLobbyButton)

        playerList.append(player);

    }
    else{
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
        if (confirm("Are you sure you want to start the game? New players will not be able to join an in-progress game.")){
            socket.emit("startGame");
        }
    })
    bodyElement.appendChild(startGameButton);
    joinGameButton.value = "Update"
})

socket.on("returningPlayer", (returningPlayer, players, numRounds, currentRound, currentSale, finalCrops) => {
    console.log(returningPlayer.name + " has returned!")
    if (!returningPlayer.isInGame){
        const startGameButton = document.createElement("button");
        startGameButton.id = "startGame";
        startGameButton.textContent = "Start Game"
        startGameButton.addEventListener("click", () => {
            if (confirm("Are you sure you want to start the game? New players will not be able to join an in-progress game.")){
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
        addMetaTools(numRounds, currentRound, players.length*2, currentSale);
        createTableaus(players);
        updateStats(players);
        displayTableaus(players);
        if(returningPlayer.draftingHand.length >0){
            selectGood(returningPlayer.draftingHand, "draft");
        }
        displayReserve(returningPlayer.reserve);
        const vendor = players.find(player => player.isVendor == true);
        if (finalCrops.length != 0){
            displayFinalSale(finalCrops[0], finalCrops[1], players[myPlayerNum].numCoins);

        }
        else if (returningPlayer.name == vendor.name){
            if (returningPlayer.isReady == false){
                selectGood(returningPlayer.reserve, "sell");
            }
        } 
        else{
            if(returningPlayer.choice[0] == "pineappleTarget"){
                let potentialCopies = [...new Set([...players[players[returningPlayer.playerNum].neighborNums[0]].tableau, ...players[players[returningPlayer.playerNum].neighborNums[1]].tableau])];
                potentialCopies = players[players[returningPlayer.playerNum].neighborNums[0]].tableau.concat(players[players[returningPlayer.playerNum].neighborNums[1]].tableau)
                console.log(potentialCopies)
                let unique = [...new Set(potentialCopies)]
                console.log(unique);
                selectGood(unique, "copy");
            }

            else if (vendor.isReady == true && returningPlayer.choice.length == 0){
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
socket.on("playerJoined", (playerID, newPlayerName, newPlayerColor) => {
    modifyPlayerList(playerList, playerID, newPlayerName, newPlayerColor);
})
socket.on("playerKicked", (playerID) => {
    const playerDOM = document.getElementById(playerID);
    playerList.removeChild(playerDOM);

    if (readCookieValue("userID") == playerID){
        const joinGameButton = document.getElementsByClassName("joinGame")[0];
        joinGameButton.value = "Join Game";
        startGameButton = document.getElementById("startGame");
        startGameButton.remove();
    }
})


socket.on("gameStartSetup", (players, numRounds, currentRound) => {
    const userID = readCookieValue("userID");
    const thisPlayer = players.find(player => player.userID == userID);
    myPlayerNum = thisPlayer.playerNum;

    bodyElement.innerHTML = "";
    addMetaTools(numRounds, currentRound, players.length*2, 0)
    createTableaus(players);
    updateStats(players);
})


/////// GAME LOGIC
socket.on("nextDraftRound", (players) => {
    //currentSaleCount = document.getElementById("currentSaleCount");
    //currentSaleCount.textContent = Number(currentSaleCount.textContent)+1;
    if(players[0].draftingHand.length == 3){
        currentRound = document.getElementById("currentRound");
        currentRound.textContent = Number(currentRound.textContent)+1;
        currentSaleCount = document.getElementById("currentSaleCount");
        currentSaleCount.textContent = 0;
    }
    selectGood(players[myPlayerNum].draftingHand, "draft");  
})

socket.on("displayReserve", (players) => {
    displayReserve(players[myPlayerNum].reserve);
})

socket.on("setSaleTerms", (reserve, vendorNum) => {
    newVendor(vendorNum);
    if (myPlayerNum == vendorNum){
        selectGood(reserve, "sell")
    }
})

socket.on("resolveSale", (goodToBuy, price, vendorNum) => {
    if (myPlayerNum != vendorNum){
        displayGoodSale(goodToBuy, price, vendorNum);
    }
})

socket.on("turnUpdate", (players) => {
    displayReserve(players[myPlayerNum].reserve);
    updateStats(players);
})

socket.on("updateStats", (players) => {
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

socket.on("removeGoodDOM", (nameOfGoodToRemove, playerNum) => {
    const goodElement = document.querySelector(`#player${playerNum} .tableau .${nameOfGoodToRemove}`);
    goodElement.remove();
})

socket.on("pineappleTarget", (playerNum, players) => {
    if (myPlayerNum == playerNum){
        //console.log(players[playerNum].neighborNums[0]);
        //console.log(players[players[playerNum].neighborNums[0]])
        //console.log(players[1].tableau);
        
        //console.log(players[players[playerNum].neighborNums[0]].tableau)
        const potentialCopies = [...new Set([...players[players[playerNum].neighborNums[0]].tableau, ...players[players[playerNum].neighborNums[1]].tableau])];
        selectGood(potentialCopies, "copy");
    }
})

socket.on("changeTomatoType", (newType, playerNum) => {
    const tomatoes = document.querySelector(`#player${playerNum} .Tomatoes`);
    const fruitDiv = document.querySelector(`#player${playerNum} .Fruits`);
    const cropDiv = document.querySelector(`#player${playerNum} .Crops`);
    if (newType == "crop"){
        cropDiv.appendChild(tomatoes);
        tomatoes.src = "static/Images/Tomatoes.png";
    }
    else if (newType == "fruit"){
        fruitDiv.appendChild(tomatoes);
        tomatoes.src = "static/Images/Tomatoes-fruit.png"
    }
})

socket.on("finalCropSale", (firstCrop, secondCrop, players) => {
    displayFinalSale(firstCrop, secondCrop, players[myPlayerNum].numCoins);
})

socket.on("endOfGame", (players) => {
    // final scores
})

function selectGood(goodsToSelectFrom, typeOfSelection){
    const goodSelectionDiv = document.createElement("div");
    goodSelectionDiv.id = "goodSelectionDiv";
    const message = document.createElement("p");
    message.textContent = "Select a good to "+typeOfSelection;
    message.id = "message";
    goodSelectionDiv.append(message);

    const visibilityToggle = document.createElement("img");
    const selectionPopUp = document.createElement("div");
    selectionPopUp.id = "selectionPopUp";
    goodSelectionDiv.appendChild(selectionPopUp);
    visibilityToggle.src = "static/Icons/visibility-off.svg";
    visibilityToggle.classList.add("icon");
    visibilityToggle.id = "visibilityToggle";
    visibilityToggle.addEventListener("click", () => {
        if (visibilityToggle.src.endsWith("visibility-off.svg")){
            selectionPopUp.style.display = "none";
            visibilityToggle.src = "static/Icons/visibility-on.svg";
        } 
        else if (visibilityToggle.src.endsWith("visibility-on.svg")){
            selectionPopUp.style.display = "grid";
            visibilityToggle.src = "static/Icons/visibility-off.svg";
        }
    })
    goodSelectionDiv.appendChild(visibilityToggle);

    const fruitsDiv = document.createElement("div");
    fruitsDiv.classList.add("Fruits");
    fruitsDiv.classList.add("typeContainer");
    const cropsDiv = document.createElement("div");
    cropsDiv.classList.add("Crops");
    cropsDiv.classList.add("typeContainer");
    const trinketsDiv = document.createElement("div");
    trinketsDiv.classList.add("Trinkets");
    trinketsDiv.classList.add("typeContainer");

    if(typeOfSelection == "lose" || typeOfSelection == "copy"){
        selectionPopUp.appendChild(fruitsDiv);
        selectionPopUp.appendChild(cropsDiv);
        selectionPopUp.appendChild(trinketsDiv);
    }

    for (let i = 0; i < goodsToSelectFrom.length; i++){
        const selectedDiv = document.createElement("div");
        const selectedGood = document.createElement("img");
        selectedGood.src = goodsToSelectFrom[i].image;
        selectedGood.classList.add(goodsToSelectFrom[i].name);
        selectedGood.classList.add(i);
        selectedGood.addEventListener("click", () => {
            if (typeOfSelection == "sell" && goodsToSelectFrom[i].name == "Pins"){
                if (selectedGood.id == "selectedPins"){
                    selectedGood.removeAttribute("id");
                    selectedDiv.removeAttribute("id");
                }
                else{
                    selectedGood.id = "selectedPins";
                    selectedDiv.id = "selectedPinsDiv";
                }
            }

            else{
                const previouslySelectedGood = document.getElementById("selectedGood");
                if (previouslySelectedGood != undefined){
                    previouslySelectedGood.removeAttribute("id");
                    const previousDiv = document.getElementById("selectedDiv")
                    previousDiv.removeAttribute("id");
                }
    
                selectedGood.id = "selectedGood";
                selectedDiv.id = "selectedDiv";
            }
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
        else{selectionPopUp.appendChild(selectedDiv);
        }
    }

    if (typeOfSelection == "sell"){
        const setPrice = document.createElement("input")
        setPrice.type = "number";
        setPrice.min = 1;
        setPrice.id = "setPrice"
        selectionPopUp.appendChild(setPrice);

    }
    const confirmSelection = document.createElement("button");
    confirmSelection.textContent = "Confirm";
    confirmSelection.addEventListener("click", () => {
        const selectedGoodDOM = document.getElementById("selectedGood");
        const setPrice = document.getElementById("setPrice");
        if (selectedGoodDOM != undefined && (typeOfSelection != "sell" || Number(setPrice.value) > 0)){
            if(typeOfSelection == "draft"){
                if (goodsToSelectFrom.length == 1){
                    socket.emit("finalDraft", myPlayerNum);
                }
                else{socket.emit("draftedCard", myPlayerNum, selectedGoodDOM.classList[1])};
            }
            else if (typeOfSelection == "sell"){
                const indexofGoodForSale = selectedGoodDOM.classList[1]
                let goodsForSale = [goodsToSelectFrom[indexofGoodForSale]];
                const pins = document.getElementById("selectedPins");
                if (pins != undefined){
                    pinsIndex = pins.classList[1];
                    goodsForSale.push(goodsToSelectFrom[pinsIndex]);
                } 
                socket.emit("sellGood", goodsForSale, Number(setPrice.value), myPlayerNum);
            }
            else if (typeOfSelection == "lose"){
                socket.emit("removeGood", selectedGoodDOM.classList[0], myPlayerNum);
                socket.emit("readytoEndTurn", myPlayerNum);
            }
            else if (typeOfSelection == "copy"){
                console.log(selectedGoodDOM.classList[0]);
                const goodToCopy = goodsToSelectFrom.find(good => good.name == selectedGoodDOM.classList[0]);
                socket.emit("copyGood", goodToCopy, myPlayerNum);
            }
            goodSelectionDiv.remove();
        }
    })
    selectionPopUp.appendChild(confirmSelection);
    bodyElement.appendChild(goodSelectionDiv);
}

function createTableaus(players){
    let opponentDisplay = document.createElement("div");
    opponentDisplay.id = "opponentDisplay";
    let laterOpponents = document.createElement("div");
    laterOpponents.classList.add("later");
    let priorOpponents = document.createElement("div");
    priorOpponents.classList.add("prior")

    for (let i = 0; i < players.length; i++){
        let player = document.createElement("div");
        player.id = "player"+players[i].playerNum;
        let stats = document.createElement("div");
        stats.classList.add("stats");
        let playerName = document.createElement("p");
        playerName.textContent = players[i].name;
        playerName.classList.add("playerName");
        stats.appendChild(playerName);
        let coinIcon = document.createElement("img");
        coinIcon.src = "static/Icons/coins.png";
        coinIcon.classList.add("coinIcon")
        stats.appendChild(coinIcon);
        let coins = document.createElement("p");
        coins.classList.add("coins");
        stats.appendChild(coins);
        let workerIcon = document.createElement("img");
        workerIcon.src = "static/Icons/workers.png";
        workerIcon.classList.add("workerIcon");
        stats.appendChild(workerIcon);
        let workers = document.createElement("p");
        workers.classList.add("workers");
        stats.appendChild(workers);
        let VPIcon = document.createElement("img");
        VPIcon.src = "static/Icons/VPIcon.png";
        VPIcon.classList.add("VPIcon");
        stats.appendChild(VPIcon);
        let VP = document.createElement("p");
        VP.classList.add("VP");
        stats.appendChild(VP);
        stats.style.backgroundColor = players[i].color;        

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
            if (i - myPlayerNum > 0){
                laterOpponents.appendChild(player);
            }
            else{priorOpponents.appendChild(player);            }
        }
    }
    opponentDisplay.appendChild(laterOpponents);
    opponentDisplay.appendChild(priorOpponents);
    bodyElement.appendChild(opponentDisplay);
}


/////// DISPLAY UPDATES

function displayReserve(reserve){
    let shouldEnlarge = true;
    let reserveDOM = document.getElementById("reserve");
    if (reserveDOM == undefined){
        reserveDOM = document.createElement("div");
        reserveDOM.id = "reserve";
        let myself = document.getElementsByClassName("myself")[0];
        myself.appendChild(reserveDOM);
    }
    reserveDOM.innerHTML = ""
    for (let i = 0; i < reserve.length; i++){
        const reservedCard = document.createElement("img");
        reservedCard.src = reserve[i].image;
        reservedCard.classList.add("icon", "reserved"+i)
        reservedCard.addEventListener("click", () => {
            viewDetailedReservedCards(reserve, shouldEnlarge);
            shouldEnlarge = !shouldEnlarge;
        })
        reserveDOM.appendChild(reservedCard);
    }
}

function viewDetailedReservedCards(reserve, shouldEnlarge){
    if (shouldEnlarge){
        const detailedReserveView = document.createElement("div");
        detailedReserveView.id = "detailedReserve";
        for (let i = 0; i < reserve.length; i++){
            const reservedCardDiv = document.createElement("div");
            const reservedCard = document.createElement("img");
            reservedCard.src = reserve[i].image;
            reservedCard.classList.add(i, "reserved")
            reservedCardDiv.appendChild(reservedCard)
            detailedReserveView.appendChild(reservedCardDiv);
        }
        bodyElement.appendChild(detailedReserveView);
    }
    else{
        const detailedReserveView = document.getElementById("detailedReserve");
        detailedReserveView.remove();
    }
}

function displayGoodSale(goodForSale, price, vendorNum){

    const offerContainer = document.createElement("div");
    offerContainer.id = "offerContainer";

    const currentOffer = document.createElement("div");
    currentOffer.id = "currentOffer";

    const goodsForSale = document.createElement("div");
    goodsForSale.id = "goodsForSale"

    if (goodForSale.length == 2) {
        const good = document.createElement("img");
        good.src = goodForSale[1].image;
        good.classList.add("goodForSale");
        goodsForSale.appendChild(good);
    }

    const good = document.createElement("img");
    good.src = goodForSale[0].image;
    good.classList.add("goodForSale");
    goodsForSale.appendChild(good);
    currentOffer.appendChild(goodsForSale);

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
        offerContainer.remove();
    })
    currentOffer.appendChild(chooseBuy);

    const chooseInvest = document.createElement("button");
    chooseInvest.textContent = "Invest"
    chooseInvest.id = "chooseInvest";
    chooseInvest.addEventListener("click", () => {
        socket.emit("saleResult", "invest", myPlayerNum, goodForSale, price, vendorNum);
        offerContainer.remove();
    })
    currentOffer.appendChild(chooseInvest);


    const visibilityToggle = document.createElement("img");
    visibilityToggle.src = "static/Icons/visibility-off.svg";
    visibilityToggle.id = "visibilityToggle";
    visibilityToggle.classList.add("icon");
    visibilityToggle.addEventListener("click", () => {
        if (visibilityToggle.src.endsWith("visibility-off.svg")){
            currentOffer.style.display = "none";
            visibilityToggle.src = "static/Icons/visibility-on.svg";
        } 
        else if (visibilityToggle.src.endsWith("visibility-on.svg")){
            currentOffer.style.display = "grid";
            visibilityToggle.src = "static/Icons/visibility-off.svg";
        }
    })
    offerContainer.appendChild(visibilityToggle);
    offerContainer.appendChild(currentOffer);

    bodyElement.appendChild(offerContainer);
}

function addToTableau(purchasedGood, playerNum){
    const newGood = document.createElement("img");
    newGood.src = purchasedGood.image;
    newGood.classList.add("good", purchasedGood.name);

    if (purchasedGood.name == "Pineapples"){
        newGood.addEventListener("mouseover", () => {
            newGood.src = purchasedGood.ongoing;
        })
        newGood.addEventListener("mouseout", () => {
            newGood.src = purchasedGood.image;
        })
    }
    
    //opponent's good
    if (playerNum != myPlayerNum){
        newGood.addEventListener("mouseover", () => {
            const blownUpGood = document.createElement("img");
            blownUpGood.src = newGood.src;
            blownUpGood.id = "blownUpGood";
            bodyElement.appendChild(blownUpGood);
        })
    
        newGood.addEventListener("mouseout", () => {
            const blownUpGood = document.getElementById("blownUpGood");
            blownUpGood.remove();
        })
    }

    //player's good
    else{
        if (purchasedGood.active != "none"){
            newGood.addEventListener("click", () => {
                const abilityConfirmationDiv = document.createElement("div");
                abilityConfirmationDiv.id = "abilityConfirmation";
                const confirmationText = document.createElement("p");
                confirmationText.textContent = "Are you sure you want to activate "+purchasedGood.name+"?";
                abilityConfirmationDiv.appendChild(confirmationText);
                const activateButton = document.createElement("button");
                activateButton.textContent = "Activate";
                activateButton.id = "activateAbility";
                activateButton.addEventListener("click", () => {
                    eval(purchasedGood.active);
                    abilityConfirmationDiv.remove();
                })
                abilityConfirmationDiv.appendChild(activateButton);
                const cancelButton = document.createElement("button");
                cancelButton.textContent = "Cancel";
                cancelButton.id = "cancelAbility";
                cancelButton.addEventListener("click", () => {
                    abilityConfirmationDiv.remove();
                })
                abilityConfirmationDiv.appendChild(cancelButton);
                bodyElement.appendChild(abilityConfirmationDiv);
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
        displayedScore.textContent = Math.ceil(players[i].numVP);
    }
}

function displayTableaus(players){
    for (let i = 0; i < players.length; i++){
        for (let j = 0; j < players[i].tableau.length; j++){
            addToTableau(players[i].tableau[j], i);
        }
    }
}

function newVendor(vendorNum){
    currentSaleCount = document.getElementById("currentSaleCount");
    currentSaleCount.textContent = Number(currentSaleCount.textContent)+1;
    const oldVendor = document.getElementById("vendor");
    if (oldVendor != undefined){
        oldVendor.classList.length = 0;
    }    
    const newVendor = document.querySelector(`#player${vendorNum}`);
    newVendor.classList.add("vendor");
}

function displayFinalSale(firstCrop, secondCrop, numCoins){
    const finalSaleDiv = document.createElement("div");
    const good1 = document.createElement("img");
    good1.src = firstCrop.image;
    const good2 = document.createElement("img");
    good2.src = secondCrop.image;
    const bid1 = document.createElement("input")
    bid1.type = "number";
    bid1.min = 0;
    const bid2 = document.createElement("input")
    bid2.type = "number";
    bid2.min = 0;
    const confirmButton = document.createElement("buton");
    confirmButton.addEventListener("click", () => {
        if (bid1.value + bid2.value <= numCoins){
            socket.emit("resolveFinalSale", bid1.value, bid1.value, myPlayerNum);
            finalSaleDiv.remove()
        }
    })
    finalSaleDiv.appendChild(good1);
    finalSaleDiv.appendChild(good2);
    finalSaleDiv.appendChild(bid1);
    finalSaleDiv.appendChild(bid2);
    finalSaleDiv.appendChild(confirmButton);
    bodyElement.appendChild(finalSaleDiv);
}

function addMetaTools(numRounds, currentRound, numSales, currentSale){
    const roundOverview = document.createElement("div");
    roundOverview.id = "roundOverview";
    
    const description = document.createElement("span");
    description.textContent = "Round: "
    const roundCount = document.createElement("span");
    roundCount.textContent = currentRound;
    roundCount.id = "currentRound";
    const totalRounds = document.createElement("span");
    totalRounds.textContent = " / "+numRounds;
    totalRounds.id = "totalRounds";
    roundOverview.appendChild(description);
    roundOverview.appendChild(roundCount);
    roundOverview.appendChild(totalRounds);

    const saleCountOverview = document.createElement("div");
    saleCountOverview.id = "saleCountOverview";

    const saleDescription = document.createElement("span");
    saleDescription.textContent = "Sale: ";
    const saleCount = document.createElement("span");
    saleCount.textContent = currentSale
    saleCount.id = "currentSaleCount";
    const totalSales = document.createElement("span");
    totalSales.textContent = " / "+numSales;
    totalSales.id = "totalSales";
    saleCountOverview.appendChild(saleDescription);
    saleCountOverview.appendChild(saleCount);
    saleCountOverview.appendChild(totalSales);

    const gameOverview = document.createElement("div");
    gameOverview.id = "gameOverview";
    gameOverview.appendChild(roundOverview);
    gameOverview.appendChild(saleCountOverview);
    bodyElement.appendChild(gameOverview);

    const ruleDocument = document.createElement("img");
    ruleDocument.style.display = "none";
    //ruleDocument.src = "/static/rulesOverview.png";
    ruleDocument.src = "/static/Icons/edit.svg";

    ruleDocument.id = "rulesDoc";
    bodyElement.appendChild(ruleDocument)
    const infoIcon = document.createElement("img");
    infoIcon.src = "/static/Icons/rules.svg";
    infoIcon.id = "infoIcon";
    infoIcon.addEventListener("click", () => {
        if (ruleDocument.style.display == "grid"){
            ruleDocument.style.display = "none";
        }
        else {ruleDocument.style.display = "grid"}
    })
    bodyElement.appendChild(infoIcon)
}
function fullUpdate(players, thisPlayer){
    updateDraft(cardsToDraft);
    updateReserve(thisPlayer);
    updateCurrentOffer();
    updateTableaus(players);
    updateStats(players);
}