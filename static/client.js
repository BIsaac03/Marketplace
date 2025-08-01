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
        playerColorDOM.style.backgroundColor = playerColor[0];
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
        existingPlayer.children[0].style.backgroundColor = playerColor[0];
        existingPlayer.children[1].textContent = playerName;
    }
}

function checkNumWorkers(){
    let numWorkers = 0;
    const workers = document.getElementById("workerCheck");
    if (workers != null && workers.checked){
        numWorkers += 1;
        const doubled = document.getElementById("doubleWorkerCheck");
        if (doubled != null && doubled.checked){
            numWorkers += 1;
        }
    }
    return numWorkers;
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
        createTableaus(players);
        updateStats(players);
        displayTableaus(players);
        displayReserve(returningPlayer.reserve);
        addMetaTools(numRounds, currentRound, players.length*2, currentSale);


        const vendor = players.find(player => player.isVendor == true);
        newVendor(vendor.playerNum, currentSale);

        const background = document.createElement("img");
        background.src = "static/Images/Background.jpg";
        background.id = "backgroundImage";
        bodyElement.appendChild(background);

        if (returningPlayer.isReady == false){
            if (returningPlayer.waitingOn == "draft"){
                selectGood(returningPlayer.draftingHand, "draft");
            }
            else if (returningPlayer.waitingOn == "sellGood"){
                selectGood(returningPlayer.reserve, "sell");
            }
            else if (returningPlayer.waitingOn == "buyGood"){
                const numWorkers = returningPlayer.numWorkers;
                let hasFigurines = false;
                const figurines = returningPlayer.tableau.find(trinket => trinket.name == "Figurines");
                if (figurines != undefined){
                    hasFigurines = true;
                }
                displayGoodSale(vendor.saleOffer[0], vendor.saleOffer[1], vendor.playerNum, numWorkers, hasFigurines)
            }
            else if (returningPlayer.waitingOn == "vendorChoice"){
                displayGoodSale(vendor.saleOffer[0], vendor.saleOffer[1], vendor.playerNum, 0, false)
            }
            else if (returningPlayer.waitingOn == "finalSale"){
                displayFinalSale(finalCrops[0], finalCrops[1], players[myPlayerNum].numCoins);
            }
            else if (returningPlayer.waitingOn == "seenFinalAvgs"){
                socket.emit("seenFinalSale", myPlayerNum);
            }
            else if (returningPlayer.waitingOn == "finalScores"){
                console.log("return at end")
                createFinalScoreboard(players.length);
                players.sort((a, b) => a.numVP - b.numVP);
                for (let i = 0; i < players.length; i++){
                    displayFinalScore(players[i], i, players.length);
                }
            }
            else if (returningPlayer.waitingOn == "loseGood"){
                if (returningPlayer.tableau.length > 0){
                    selectGood(returningPlayer.tableau, "lose", true);
                }
                else{
                    socket.emit("readyPlayer", returningPlayer.playerNum);
                }
            }
            else if (returningPlayer.waitingOn == "pineappleTarget"){
                const firstNeighborExclusive = (players[players[returningPlayer.playerNum].neighborNums[0]].tableau).filter(good1 => !(players[players[returningPlayer.playerNum].neighborNums[1]].tableau.some(good2 => good2.name == good1.name)));
                const potentialCopies = firstNeighborExclusive.concat(players[players[returningPlayer.playerNum].neighborNums[1]].tableau)
                selectGood(potentialCopies, "copy");
            }
            else if (returningPlayer.waitingOn != undefined && returningPlayer.waitingOn.includes("Resolve")){
                eval(returningPlayer.waitingOn);
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

    const background = document.createElement("img");
    background.src = "static/Images/Background.jpg";
    background.id = "backgroundImage";
    bodyElement.appendChild(background);

    createTableaus(players);
    updateStats(players);
    addMetaTools(numRounds, currentRound, players.length*2, 0)

})


/////// GAME LOGIC
socket.on("nextDraftRound", (players) => {
    if(players[0].draftingHand.length == 3){
        currentRound = document.getElementById("currentRound");
        currentRound.textContent = Number(currentRound.textContent)+1;
        currentSaleCount = document.getElementById("currentSaleCount");
        currentSaleCount.textContent = 0;
        displayNextRound(currentRound, players.length);
    }
    selectGood(players[myPlayerNum].draftingHand, "draft");  
})

socket.on("displayReserve", (players) => {
    displayReserve(players[myPlayerNum].reserve);
})

socket.on("setSaleTerms", (reserve, vendorNum, saleCount) => {
    newVendor(vendorNum, saleCount);
    if (myPlayerNum == vendorNum){
        selectGood(reserve, "sell")
    }
})

socket.on("resolveSale", (goodToBuy, price, vendorNum, players, isVendorTurn) => {
    if (myPlayerNum != vendorNum && isVendorTurn == false){
        const numWorkers = players[myPlayerNum].numWorkers;
        let hasFigurines = false;
        const figurines = players[myPlayerNum].tableau.find(trinket => trinket.name == "Figurines");
        if (figurines != undefined){
            hasFigurines = true;
        }
        displayGoodSale(goodToBuy, price, vendorNum, numWorkers, hasFigurines);
    }
    else if (myPlayerNum == vendorNum && isVendorTurn == true){
        console.log("vendor");
        displayGoodSale(goodToBuy, price, vendorNum, 0, false);
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
    console.log(purchasedGood);
    addToTableau(purchasedGood, playerNum)
})

socket.on("chooseLostGood", (player, isWaiting) => {
    if (myPlayerNum == player.playerNum){
        selectGood(player.tableau, "lose", isWaiting);
    }
})

socket.on("removeGoodDOM", (nameOfGoodToRemove, playerNum) => {
    const goodElement = document.querySelector(`#player${playerNum} .tableau .${nameOfGoodToRemove}`);
    goodElement.remove();
})

socket.on("pineappleTarget", (playerNum, players) => {
    if (myPlayerNum == playerNum){
        const firstNeighborExclusive = (players[players[playerNum].neighborNums[0]].tableau).filter(good1 => !(players[players[playerNum].neighborNums[1]].tableau.some(good2 => good2.name == good1.name)));
        const potentialCopies = firstNeighborExclusive.concat(players[players[playerNum].neighborNums[1]].tableau)
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

socket.on("resolveMasks", (modifier, playerNum, numCoins, numTrinkets, isLastRound) => {
    if (playerNum == myPlayerNum){
        maskResolve(modifier, numCoins, numTrinkets, isLastRound);
    }
})

socket.on("setGuavaValue", (modifier, playerNum, numCoins, isLastRound) => {
    if (playerNum == myPlayerNum){
        guavaResolve(modifier, numCoins, isLastRound)
    }
})

socket.on("finalCropSale", (firstCrop, secondCrop, players) => {
    displayFinalSale(firstCrop, secondCrop, players[myPlayerNum].numCoins);
})

socket.on("displayFinalSaleAvg", (avg1, avg2) => {
    addFinalAvg(avg1, avg2);
})

socket.on("endOfGame", (numPlayers) => {
    createFinalScoreboard(numPlayers);
})

socket.on("displayFinalScore", (player, i, numPlayers) => {
    displayFinalScore(player, i, numPlayers);
})

function selectGood(goodsToSelectFrom, typeOfSelection, isWaiting){
    if (goodsToSelectFrom.length > 0){
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
                    socket.emit("removeGood", selectedGoodDOM.classList[0], myPlayerNum, isWaiting);
                }
                else if (typeOfSelection == "copy"){
                    const goodToCopy = goodsToSelectFrom.find(good => good.name == selectedGoodDOM.classList[0]);
                    socket.emit("copyGood", goodToCopy, myPlayerNum);
                }
                goodSelectionDiv.remove();
            }
        })
        selectionPopUp.appendChild(confirmSelection);
        bodyElement.appendChild(goodSelectionDiv);
    } 

    // no goods to select from
    else{
        socket.emit("readyPlayer", myPlayerNum);
    }
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
        stats.style.backgroundColor = players[i].color[0];
        if (players[i].color[1] == true){
            stats.style.color = "white";
        }       

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

function displayGoodSale(goodForSale, price, vendorNum, numWorkers, hasFigurines){

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
        const numWorkers = checkNumWorkers();
        socket.emit("saleResult", "buy", myPlayerNum, goodForSale, price, vendorNum, numWorkers);
        offerContainer.remove();
    })
    currentOffer.appendChild(chooseBuy);

    const chooseInvest = document.createElement("button");
    chooseInvest.textContent = "Invest"
    chooseInvest.id = "chooseInvest";
    chooseInvest.addEventListener("click", () => {
        const numWorkers = checkNumWorkers();
        socket.emit("saleResult", "invest", myPlayerNum, goodForSale, price, vendorNum, numWorkers);
        offerContainer.remove();
    })
    currentOffer.appendChild(chooseInvest);

    if(numWorkers > 0){
        const workerDiv = document.createElement("div");
        workerDiv.id = "workerDiv";

        const workerIcon = document.createElement("img");
        workerIcon.src = "static/Icons/workers.png";
        workerDiv.appendChild(workerIcon);
        const workerCheck = document.createElement("input");
        workerCheck.type = "checkbox";
        workerCheck.id = "workerCheck";
        workerDiv.appendChild(workerCheck);

        if (hasFigurines && numWorkers > 1){
            const figurineDiv = document.createElement("div");
            const doubleWorkerText = document.createElement("p");
            doubleWorkerText.textContent = "x2";
            const doubleWorkerCheck = document.createElement("input");
            doubleWorkerCheck.type = "checkbox";
            doubleWorkerCheck.id = "doubleWorkerCheck";
            doubleWorkerCheck.addEventListener("click", () => {
                if (workerCheck.checked == false){
                    workerCheck.checked = true;
                }
            })
            figurineDiv.appendChild(doubleWorkerText);
            figurineDiv.appendChild(doubleWorkerCheck);
            workerDiv.appendChild(figurineDiv);
        }
        currentOffer.appendChild(workerDiv);
    }

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
        displayedScore.textContent = players[i].numVP.toFixed(1);
    }
}

function displayTableaus(players){
    for (let i = 0; i < players.length; i++){
        for (let j = 0; j < players[i].tableau.length; j++){
            addToTableau(players[i].tableau[j], i);
        }
    }
}

function newVendor(vendorNum, saleCount){
    currentSaleCount = document.getElementById("currentSaleCount");
    currentSaleCount.textContent = saleCount;
    const oldVendor = document.getElementsByClassName("vendor")[0];
    if (oldVendor != undefined){
            oldVendor.classList.remove("vendor");
    }    
    const newVendor = document.querySelector(`#player${vendorNum}`);
    newVendor.classList.add("vendor");
}

function maskResolve(modifier, numCoins, numTrinkets, isLastRound){
    const maskDiv = document.createElement("div");
    maskDiv.id = "maskDiv";
    const toFruitDescription = document.createElement("p");
    toFruitDescription.textContent = "Spend coins to treat Trinkets as Fruits:";
    const coinToFruit = document.createElement("input");
    coinToFruit.type = "number";
    coinToFruit.min = 0;
    const toCropDescription = document.createElement("p");
    toCropDescription.textContent = "Spend coins to treat Trinkets as Crops:";
    const coinToCrop = document.createElement("input");
    coinToCrop.type = "number";
    coinToCrop.min = 0;
    const confirm = document.createElement("button");
    confirm.addEventListener("click", () =>{
        if (coinToFruit.value + coinToCrop.value <= Math.min(numCoins, numTrinkets)){
            socket.emit("masksResolved", myPlayerNum, coinToFruit.value, coinToCrop.value, modifier, isLastRound);
            maskDiv.remove();
        }
    })
    maskDiv.appendChild(toFruitDescription);
    maskDiv.appendChild(coinToFruit);
    maskDiv.appendChild(toCropDescription);
    maskDiv.appendChild(coinToCrop);
    maskDiv.appendChild(confirm);
    bodyElement.appendChild(maskDiv);
}

function guavaResolve(modifier, numCoins, isLastRound){
    const guavaDiv = document.createElement("div");
        guavaDiv.id = "guavaDiv";
        const guavaDescription = document.createElement("p");
        guavaDescription.textContent = "Spend coins to increase the value of Guavas:"
        const coinEntry = document.createElement("input");
        coinEntry.type = "number";
        coinEntry.min = 0;
        const confirm = document.createElement("button");
        confirm.addEventListener("click", () =>{
            if (Number(coinEntry.value) <= numCoins){
                socket.emit("guavasSet", myPlayerNum, coinEntry.value, modifier, isLastRound);
                guavaDiv.remove();               
            }
        })
        guavaDiv.appendChild(guavaDescription);
        guavaDiv.appendChild(coinEntry);
        guavaDiv.appendChild(confirm);
        bodyElement.appendChild(guavaDiv);
}

function displayFinalSale(firstCrop, secondCrop, numCoins){
    const cropSaleContainer = document.createElement("div");
    cropSaleContainer.id = "cropSaleContainer";
    const finalSaleDiv = document.createElement("div");
    finalSaleDiv.id = "cropSale";
    const avg1 = document.createElement("p");
    avg1.id = "avg1";
    const avg2 = document.createElement("p");
    avg2.id = "avg2";
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
    const confirmButton = document.createElement("button");
    confirmButton.textContent = "Confirm";
    confirmButton.addEventListener("click", () => {
        if (Number(bid1.value) + Number(bid2.value) <= numCoins && bid1.value >=0 && bid2.value >= 0){
            confirmButton.remove();
            socket.emit("resolveFinalSale", Number(bid1.value), Number(bid2.value), myPlayerNum);
        }
    })
    finalSaleDiv.appendChild(avg1);
    finalSaleDiv.appendChild(avg2);
    finalSaleDiv.appendChild(good1);
    finalSaleDiv.appendChild(good2);
    finalSaleDiv.appendChild(bid1);
    finalSaleDiv.appendChild(bid2);
    finalSaleDiv.appendChild(confirmButton);

    const visibilityToggle = document.createElement("img");
    visibilityToggle.src = "static/Icons/visibility-off.svg";
    visibilityToggle.id = "visibilityToggle";
    visibilityToggle.classList.add("icon");
    visibilityToggle.addEventListener("click", () => {
        if (visibilityToggle.src.endsWith("visibility-off.svg")){
            finalSaleDiv.style.display = "none";
            visibilityToggle.src = "static/Icons/visibility-on.svg";
        } 
        else if (visibilityToggle.src.endsWith("visibility-on.svg")){
            finalSaleDiv.style.display = "grid";
            visibilityToggle.src = "static/Icons/visibility-off.svg";
        }
    })

    cropSaleContainer.appendChild(visibilityToggle);
    cropSaleContainer.appendChild(finalSaleDiv);
    bodyElement.appendChild(cropSaleContainer);
}

function addFinalAvg(avg1, avg2){
    const firstAvg = document.getElementById("avg1");
    firstAvg.textContent = avg1;
    const secondAvg = document.getElementById("avg2");
    secondAvg.textContent = avg2;
    const button = document.createElement("button");
    button.id = "confirm;"
    button.textContent = "Continue";
    button.addEventListener("click", () => {
        socket.emit("seenFinalSale", myPlayerNum);
        const container = document.getElementById("cropSaleContainer");
        container.remove();
    })
    document.getElementById("cropSale").appendChild(button);
}

function createFinalScoreboard(numPlayers){
    const finalScoreContainer = document.createElement("div");
    finalScoreContainer.id = "finalScoreContainer";

    const finalScores = document.createElement("div");
    finalScores.id = "finalScores";
    finalScores.style.height = 100*numPlayers+"px";

    const visibilityToggle = document.createElement("img");
    visibilityToggle.src = "static/Icons/visibility-off.svg";
    visibilityToggle.id = "visibilityToggle";
    visibilityToggle.classList.add("icon");
    visibilityToggle.addEventListener("click", () => {
        if (visibilityToggle.src.endsWith("visibility-off.svg")){
            finalScores.style.display = "none";
            visibilityToggle.src = "static/Icons/visibility-on.svg";
        } 
        else if (visibilityToggle.src.endsWith("visibility-on.svg")){
            finalScores.style.display = "flex";
            visibilityToggle.src = "static/Icons/visibility-off.svg";
        }
    })

    finalScoreContainer.appendChild(visibilityToggle);
    finalScoreContainer.appendChild(finalScores);
    bodyElement.appendChild(finalScoreContainer);
}

function displayFinalScore(player, i, numPlayers){
    const finalScores = document.getElementById("finalScores");
    const playerDiv = document.createElement("div");
    
    const position = document.createElement("span");
    position.textContent = (numPlayers - i)+".";
    position.classList.add(numPlayers - i);
    const playerName = document.createElement("span");
    playerName.textContent = player.name;
    const playerScore = document.createElement("span");
    playerScore.textContent = player.numVP;
    playerDiv.appendChild(position);
    playerDiv.appendChild(playerName);
    playerDiv.appendChild(playerScore);
    finalScores.appendChild(playerDiv);
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

function displayNextRound(roundNum, numPlayers){
    let totalRounds = 2;
    if (numPlayers < 5){
        totalRounds = 3;
    }
    const newRoundDiv = document.createElement("div");
    newRoundDiv.id = "newRound";
    const intro = document.createElement("p");
    intro.id = "intro";
    const description1 = document.createElement("p");
    const description2 = document.createElement("p");
    if (roundNum == totalRounds){
        intro.textContent = "FINAL ROUND";
        description1.textContent = "crop sale and 1.0x scoring at round end"
    }
    else{
        intro.textContent = "ROUND "+roundNum;
        description1.textContent = (1+totalRounds-roundNum)+" rounds remaining"
        description2.textContent = "0.5x scoring at round end"
    }

    newRoundDiv.appendChild(intro);
    newRoundDiv.appendChild(description1);
    newRoundDiv.appendChild(description2);
    bodyElement.appendChild(newRoundDiv);

    setTimeout(() => {newRoundDiv.remove()}, 4000);
}