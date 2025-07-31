import {allFruits} from "./static/Cards/Fruits.js";
import {allCrops} from "./static/Cards/Crops.js";
import {allTrinkets} from "./static/Cards/Trinkets.js";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/////// SOCKETIO SETUP
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000 ;
const io = new Server(httpServer, {
    cors: {
        //origin: "http://marketplace-pfci.onrender.com",
        origin: "http://127.0.0.1:5500",
}
});

app.use("/static", express.static('./static/'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
    res.sendFile(__dirname + '/static/styles.css');
    res.sendFile(__dirname + '/static/client.js');
  });

/////////// SERVER EVENTS
io.on("connection", (socket) => {
    socket.on("currentID", (currentID) => {
        const existingID = players.find(player => player.userID == currentID);
        if (existingID != undefined) {
            socket.emit("returningPlayer", existingID, players, totalRounds, gameRound, saleCount, finalCrops);
        }
        socket.emit("displayExistingPlayers", players);
    })

    socket.on("joinGame", (userID, playerName, playerColor) => {
        const existingName = players.find(player => player.name == playerName);
        const existingID = players.find(player => player.userID == userID);
        if (existingName != undefined && existingName.userID != userID){
            socket.emit("nameTaken", playerName);
        }
        else if (existingID == undefined){
            let thisPlayer = makePlayer(userID, playerName, playerColor);
            players.push(thisPlayer);
            socket.emit("joinedLobby", thisPlayer);
            io.emit("playerJoined", userID, playerName, playerColor);
        }
        else{
            existingID.name = playerName;
            existingID.color = playerColor
            io.emit("playerJoined", userID, playerName, playerColor);
        }
    })

    socket.on("leftLobby", (playerID) => {
        const leavingPlayer = players.find(player => player.userID == playerID);
        const index = players.indexOf(leavingPlayer);
        players.splice(index, 1);
        io.emit("playerKicked", playerID);
    })

    socket.on("startGame", () => {
        const alreadyStarted = players.find(player => player.isInGame == true)
        if (alreadyStarted == undefined){
            for (let i = 0; i < players.length; i++){
                players[i].playerNum = i;
                players[i].isInGame = true;
                if (players.length == 3 || players.length == 5){
                    players[i].numWorkers = 2;
                }
            }
            players[Math.floor(Math.random()*players.length)].isVendor = true;
            for (let i = 0; i < players.length; i++){
                players[i].neighborNums.push((i+1)%players.length);
                if (i != 0){
                    players[i].neighborNums.push(i-1);
                }
                else {players[i].neighborNums.push(players.length-1)};
            }
            if (players.length < 5){
                totalRounds = 1;
            }
            else if (players.length >= 5){
                totalRounds = 2;
            }
            io.emit("gameStartSetup", players, totalRounds, gameRound);
            newRound();
        }
    })

    socket.on("draftedCard", (myPlayerNum, goodIndex) => {
        const activePlayer = players.find(player => player.playerNum == myPlayerNum)
        activePlayer.reserve.push(activePlayer.draftingHand[goodIndex]);
        activePlayer.draftingHand.splice(goodIndex, 1);
        activePlayer.isReady = true;

        let keepWaiting = players.find(player => player.isReady == false)
        if (keepWaiting == undefined){
            io.emit("turnUpdate", players);
            io.emit("displayReserve", players);
            // passes remaining cards
            let previousHand = players[players.length-1].draftingHand;
            let thisHand = [];
            for (let i = 0; i < players.length; i++){
                thisHand = players[i].draftingHand;
                players[i].draftingHand = previousHand;
                previousHand = thisHand; 
            }
            io.emit("nextDraftRound", players);    
            resetPlayerStates();
        }
    })

    socket.on("sellGood", (goodToBuy, salePrice, vendorNum) => {
        for(let i = 0; i < players.length; i++){
            players[i].choice.length = 0;
        }
        players[vendorNum].saleOffer = [goodToBuy, salePrice];

        const lanterns = players[vendorNum].tableau.find(trinket => trinket.name == "Lanterns")
        if (lanterns != undefined){
            const goodsOfSimilarType = players[vendorNum].tableau.filter(good => good.type == goodToBuy[0].type);
            players[vendorNum].numVP += goodsOfSimilarType.length;
        }

        players[vendorNum].isReady = true;
        socket.broadcast.emit("resolveSale", goodToBuy, salePrice, vendorNum, players, false)
    })

    socket.on("saleResult", (choice, myPlayerNum, goodForSale, price, vendorNum, numWorkers) => {
        let discount = "none";
        players[myPlayerNum].isReady = true;
        players[myPlayerNum].numWorkers -= numWorkers;
        let wait = players.find(player => player.isReady == false);

        if (myPlayerNum != vendorNum){
            // preserve users' choices
            if (choice == "buy"){
                players[myPlayerNum].choice.push("buy");
                numBuys += 1;
                numInvests += numWorkers;
            }
            else if (choice == "invest"){
                players[myPlayerNum].choice.push("invest");
                numInvests += 1;
                numBuys += numWorkers;
            }

            if (wait == undefined){
                // determine discount
                if (numBuys > numInvests){
                    players[vendorNum].choice.push("invest");
                    discount = "breakout";
                }
                else if (numInvests > numBuys){
                    players[vendorNum].choice.push("buy");
                    discount = "clearance";
                }
                else{
                    players[vendorNum].isReady = false;
                    io.emit("resolveSale", goodForSale, price, vendorNum, players, true);
                }
            }
        }
 
        // if necessary, determine vendor's choice
        else{
            if (choice == "buy"){
                players[myPlayerNum].choice.push("buy");
                players[myPlayerNum].isReady = true;
            }
            else if (choice == "invest"){
                players[myPlayerNum].choice.push("invest");
                players[myPlayerNum].isReady = true;
            }
        }

        wait = players.find(player => player.isReady == false);
        if (wait == undefined){
            // apply users' choices
            for (let i = 0; i < players.length; i++){
                let modifiedCost = eval(price) - checkDiscount(players[i].tableau, goodForSale[0].type)
            
                if (players[i].choice[0] == "buy"){
                    if (players[i].numCoins >= modifiedCost){ 
                        if (goodForSale.length == 2){
                                resolvePurchase(players[i], goodForSale[1]);
                            }
                            resolvePurchase(players[i], goodForSale[0]);
                            if (discount == "clearance" || (discount == "none" && players[i].tableau.some(good => good.name == "Charms"))){
                                modifiedCost = Math.ceil(modifiedCost / 2);
                            }
                            players[i].numCoins -= modifiedCost;

                        } 
                    else{
                        players[i].choice[0] = "invest";
                        if (players[i].tableau.some(trinket => trinket.name == "Shells")){
                            players[i].numCoins += Math.floor(3/2*eval(price));
                            players[i].numVP += 2;
                        }
                        else{
                            players[i].numCoins += Math.ceil(eval(price) / 2);
                        }
                    }
                }

                else if (players[i].choice[0] == "invest"){
                    players[i].numCoins += eval(price);
                    if (discount == "breakout" || (discount == "none" && players[i].tableau.some(good => good.name == "Charms"))){
                        players[i].numCoins += Math.floor(eval(price)/2);
                    }
                    const bracelets = players[i].tableau.find(trinket => trinket.name == "Bracelets")
                    if (bracelets != undefined){
                        players[i].numCoins += 2;
                    }
                }

                if (goodForSale[0].onPlay == "loseGood" && players[i].choice[0] == "invest"){
                    players[i].isReady = false;
                    io.emit("chooseLostGood", players[i], true);
                }
            }
            endOfTurn();
        }      
    })
    
    socket.on("removeGood", (nameOfGoodToRemove, playerNum, isWaiting) => {
        const player = players.find(player => player.playerNum == playerNum);
        const indexOfRemovedGood = player.tableau.findIndex(good => good.name == nameOfGoodToRemove);
        player.tableau.splice(indexOfRemovedGood, 1);
        io.emit("removeGoodDOM", nameOfGoodToRemove, playerNum);

        if (isWaiting){
            players[playerNum].isReady = true;
            endOfTurn();
        }
    })

    socket.on("activeAbility", (abilityType, playerNum) => {
        if (abilityType == "perfumeAction"){
            socket.emit("chooseLostGood", players[playerNum], false);
            players[playerNum].numVP += 5;
        }
        else if (abilityType == "tomatoAction"){
            const tomatoes = players[playerNum].tableau.find(good => good.name == "Tomatoes")
            if (tomatoes.type == "Fruit"){
                tomatoes.type = "Crop";
                io.emit("changeTomatoType", "crop", playerNum)

            } 
            else {
                tomatoes.type = "Fruit";
                io.emit("changeTomatoType", "fruit", playerNum)
            }
        }
        else if (abilityType == "pouchesAction"){
            if (players[playerNum].numCoins >= 3){
                players[playerNum].numCoins -= 3;
                players[playerNum].numWorkers += 2;
            }
        }
        io.emit("updateStats", players);
     })

    socket.on("copyGood", (copiedGood, playerNum) => {
        let personalPineapples = {
            "name": "Pineapples",
            "type": "Fruit",
            "image": "static/Images/Pineapples.png",
            "onPlay": `player.isReady = false; player.choice[0] = \"pineappleTarget\"; io.emit('pineappleTarget', player.playerNum, players);`,
            "active": "none",
            "ongoing": "none",
            "VP": "overwritten"
        }
        personalPineapples.VP = copiedGood.VP;
        personalPineapples.ongoing = copiedGood.image;
        players[playerNum].tableau.push(personalPineapples);
        players[playerNum].choice.length = 0;
        io.emit("goodPurchased", personalPineapples, playerNum);

        players[playerNum].isReady = true;
        endOfTurn();
    })

    socket.on("readyPlayer", (playerNum) => {
        players[playerNum].isReady = true;
        endOfTurn();
    })
    socket.on("finalDraft", (playerNum) =>{
        const passionFruit = players[playerNum].tableau.find(fruit => fruit.name == "Passion_Fruit")
        if (passionFruit == undefined){
            players[playerNum].reserve.push(players[playerNum].draftingHand[0])
        }
        else{
            resolvePurchase(players[playerNum], players[playerNum].draftingHand[0])
            if (players[playerNum].draftingHand[0].name == "Peppers"){
                for (let i = 0; i < players.length; i++){
                    if (i !=playerNum){
                        io.emit("chooseLostGood", players[i], true);
                    }
                }
            }

            if (players[playerNum].reserve.some(good => good.name == "Pins")){
                players[playerNum].reserve.push({
                                                    "name": "Cornucopia",
                                                    "type": "Crop",
                                                    "image": "static/Images/Cornucopia.png",
                                                    "onPlay": "none",
                                                    "active": "none",
                                                    "ongoing": "none",
                                                    "VP": "Math.ceil(Math.random()*12"
                                                })
            }
        }
        players[playerNum].draftingHand.length = 0;
        players[playerNum].isReady = true;
        let keepWaiting = players.find(player => player.isReady == false)
        if (keepWaiting == undefined){
            //players[Math.floor(Math.random()*players.length)].isVendor = true;
            const vendor = players.find(player => player.isVendor == true);
            saleCount += 1;
            io.emit("setSaleTerms", vendor.reserve, vendor.playerNum, saleCount);
            io.emit("turnUpdate", players);
            io.emit("displayReserve", players);
            resetPlayerStates();
        }
    })

    socket.on("masksResolved", (playerNum, newFruits, newCrops, modifier, isLastRound) => {
        players[playerNum].numCoins -= (newFruits + newCrops);
        for (let i = 0; i < newFruits; i++){
            players[playerNum].tableau.push(
                {
                    "name": "Masked",
                    "type": "Fruit",
                    "image": "",
                    "onPlay": "none",
                    "active": "none",
                    "ongoing": "none",
                    "VP": "0"
                }
            )
        }
        scoreTableau(players[playerNum], modifier, true, false, isLastRound);
    })

    socket.on("guavasSet", (playerNum, guavaValue, modifier, isLastRound) => {
        players[playerNum].numCoins -= guavaValue;
        const guavas = players[playerNum].tableau.find(fruit => fruit.name == "Guavas");
        guavas.VP = guavaValue;
        scoreTableau(players[playerNum], modifier, true, true, isLastRound);
    })

    socket.on("resolveFinalSale", (bid1, bid2, playerNum) => {
        players[playerNum].choice.push(bid1);
        players[playerNum].choice.push(bid2);
        players[playerNum].isReady = true;
        let keepWaiting = players.find(player => player.isReady == false)
        if (keepWaiting == undefined){
            let runningBid1 = 0;
            let runningBid2 = 0;
            for (let i = 0; i < players.length; i++){
                runningBid1 += players[i].choice[0];
                runningBid2 += players[i].choice[1]
            }
            let avg1 = Math.floor(runningBid1 / players.length);
            let avg2 = Math.floor(runningBid2 / players.length);
            for (let i = 0; i < players.length; i++){
                players[i].numCoins -= (players[i].choice[0] + players[i].choice[1]);
                if(players[i].choice[0] > (avg1)){
                    if (finalCrops[0].onPlay != "none" && finalCrops[0].onPlay != "loseGood"){
                        eval(finalCrops[0].onPlay);
                    }
                    io.emit("goodPurchsed", finalCrops[0], i)
                }
                if(players[i].choice[1] > (avg2)){
                    if (finalCrops[1].onPlay != "none" && finalCrops[1].onPlay != "loseGood"){
                        eval(finalCrops[1].onPlay);
                    }
                    io.emit("goodPurchsed", finalCrops[1], i)
                }
            }
            // pepper checks
            if (finalCrops[0].onPlay == "loseGood"){
                for (let i = 0; i < players.length; i++){
                    if(players[i].choice[0] <= (avg1)){
                        players[i].isReady = false;
                        io.emit("chooseLostGood", players[i], true);
                    }
                }
            }
            else if (finalCrops[1].onPlay == "loseGood"){
                for (let i = 0; i < players.length; i++){
                    if(players[i].choice[0] <= (avg1)){
                        players[i].isReady = false;
                        io.emit("chooseLostGood", players[i], true);
                    }
                }
            }
            keepWaiting = players.find(player => player.isReady == false)
            if (keepWaiting == undefined){
                resetPlayerStates();
                io.emit("displayFinalSaleAvg", avg1, avg2);
            }   
        }  
    })
  
    socket.on("seenFinalSale", (playerNum) => {
        players[playerNum].isReady = true;
        let keepWaiting = players.find(player => player.isReady == false)
        if (keepWaiting == undefined){
            io.emit("turnUpdate", players);
            console.log("avgs seen");
            //resetPlayerStates();
            
            for (let i = 0; i < players.length; i++){
                scoreTableau(players[i], 1, false, false, true);
            }
    
            io.emit("endOfGame", players.length);
            players.sort((a, b) => a.numVP - b.numVP);
            for (let i = 0; i < players.length; i++){
                setTimeout(() => {io.emit("displayFinalScore", players[i], i, players.length)}, 2000*(i+1));
            }
        }
    })


    socket.on("disconnect", (reason) => {
        //console.log(reason);
    });
});

httpServer.listen(port, function () {
    var host = httpServer.address().address
  var port = httpServer.address().port
  console.log('App listening at https://%s:%s', host, port)
});

let players = [];
let numBuys = 0;
let numInvests = 0;
let finalCrops = [];
let gameRound = 0;
let totalRounds = 0;
let saleCount = 0;
let fruitsRemaining = allFruits;
let cropsRemaining = allCrops;
let trinketsRemaining = allTrinkets;


function resetPlayerStates() {
    for (let i = 0; i < players.length; i++){
        players[i].isReady = false;
        players[i].choice.length = 0;
    }
    numBuys = 0;
    numInvests = 0;
}

function endOfTurn(){
    let keepWaiting = players.find(player => player.isReady == false)
    if (keepWaiting == undefined){
        if (finalCrops.length == 0){
            const oldVendor = players.find(player => player.isVendor == true);
            const goodForSale = oldVendor.saleOffer[0];
    
            // remove good from vendor reserve
            for (let i = 0; i < goodForSale.length; i++){
                const indexOfSoldGood = oldVendor.reserve.findIndex(good => good.name == goodForSale[i].name);
                oldVendor.reserve.splice(indexOfSoldGood, 1);
            }
    
            oldVendor.saleOffer.length = 0;
    
            // proceed to next vendor
            oldVendor.isVendor = false;
            if (oldVendor.playerNum == players.length-1){
                players[0].isVendor = true;
            }
            else{
                players[oldVendor.playerNum+1].isVendor = true;
            }
    
            io.emit("turnUpdate", players);
            resetPlayerStates();
    
            const newVendor = players.find(player => player.isVendor == true);
            if (saleCount < 2*players.length){
                saleCount += 1;
                io.emit("setSaleTerms", newVendor.reserve, newVendor.playerNum, saleCount);
            }
            else{
                saleCount = 0
                endOfRound();
            }
        }

        else{
            let runningBid1 = 0;
            let runningBid2 = 0;
            for (let i = 0; i < players.length; i++){
                runningBid1 += players[i].choice[0];
                runningBid2 += players[i].choice[1]
            }
            let avg1 = Math.floor(runningBid1 / players.length);
            let avg2 = Math.floor(runningBid2 / players.length);

            resetPlayerStates();
            io.emit("displayFinalSaleAvg", avg1, avg2);
        }
    }
}

function newRound()
{
    gameRound += 1;
    for (let i = 0; i < players.length; i++){
        players[i].reserve.length = 0;
        //players[i].isVendor = false;
    }
    let draftingDeck = createDraftingDeck(players.length);
    createDraftingHands(draftingDeck);
    io.emit("nextDraftRound", players);
}

function createDraftingDeck(numPlayers){
    let deck = [];
    for (let i = 0; i < numPlayers; i++){
        let randomFruit = fruitsRemaining.splice(Math.floor(Math.random()*(fruitsRemaining.length)), 1)[0];
        let randomCrop = cropsRemaining.splice(Math.floor(Math.random()*(cropsRemaining.length)), 1)[0];
        let randomTrinket = trinketsRemaining.splice(Math.floor(Math.random()*(trinketsRemaining.length)), 1)[0];
        deck.push(randomFruit, randomCrop, randomTrinket);
    }
    return deck;
}

function createDraftingHands(draftingDeck){
    for (let i = 0; i < players.length; i++){
        for(let _ = 0; _ < 3; _++){
            let addedCard = draftingDeck.splice(Math.floor(Math.random()*(draftingDeck.length)), 1)[0];
            players[i].draftingHand.push(addedCard);
        }
    }
}

function checkDiscount(tableau, goodType){
    let discount = 0;
    let discountEffects = tableau.filter(good => good.ongoing.startsWith("DISCOUNT: "));
    discountEffects = discountEffects.map(item => item.ongoing.replace("DISCOUNT: ", ""));
    for (let i = 0; i < discountEffects.length; i++){
        eval(discountEffects[i]);
    }
    return discount;
}

function resolvePurchase(player, goodForSale){
    if (goodForSale.name != "Pineapples"){
        player.tableau.push(goodForSale);
        io.emit("goodPurchased", goodForSale, player.playerNum);
    }
    if (goodForSale.onPlay != "none" && goodForSale.onPlay != "loseGood"){
        eval(goodForSale.onPlay);
    }
}

function scoreTableau(player, modifier, evaluatedMasks, evaluatedGuavas, isLastRound){
    if (player.tableau.some(trinket => trinket.name == "Masks" && evaluatedMasks == false)){
        player.choice.push("maskResolve("+modifier+","+player.numCoins+","+player.getNumTrinkets()+","+isLastRound+")");
        io.emit("resolveMasks", modifier, player.playerNum, player.numCoins, player.getNumTrinkets(), isLastRound)
        return 0;
    }
    else if (player.tableau.some(trinket => trinket.name == "Masks")){
        player.choice.length = 0;
    }

    if (player.tableau.some(fruit => fruit.name == "Guavas" && evaluatedGuavas == false)){
        player.choice.push("guavaResolve("+modifier+","+player.numCoins+","+isLastRound+")");
        io.emit("setGuavaValue", modifier, player.playerNum, player.numCoin, isLastRound)
        return 0;
    }
    else if (player.tableau.some(fruit => fruit.name == "Guavas")){
        player.choice.length = 0;
    }

    // set VP of variable goods
    const mint = player.tableau.find(crop => crop.name == "Mint");
    if (mint != undefined){
        let highestFruit = 0;
        for (let i = 0; i < player.tableau.length; i++){
            if (player.tableau[i].type == "Fruit"){
                const fruitVP = eval(player.tableau[i].VP);
                if (fruitVP > highestFruit){
                    highestFruit = fruitVP;
                }
            }
        }
        mint.VP = highestFruit;
    }
    if (player.tableau.some(fruit => fruit.name == "Mangoes")){
        let lowestCrop = 999;
        let cropIndex = undefined;
        for (let i = 0; i < player.tableau.length; i++){
            if (player.tableau[i].type == "Crop"){
                const cropVP = eval(player.tableau[i].VP);
                if (cropVP < lowestCrop){
                    lowestCrop = cropVP;
                    cropIndex = i;
                }
            }
        }
        if (lowestCrop < 999){
            player.tableau[cropIndex].VP = lowestCrop*3;
        }
    }

    let addedScore = 0;
    for (let i = 0; i < player.tableau.length; i++){
        addedScore += eval(player.tableau[i].VP);
    }
    let adjustedScore = addedScore * modifier;
    player.numVP += adjustedScore;

    player.isReady = true;
    const keepWaiting = players.find(player => player.isReady == false);
    if (keepWaiting == undefined && !isLastRound){
        resetPlayerStates();
        newRound();
        io.emit("turnUpdate", players);
    }
}

function endOfRound(){
    if (gameRound == totalRounds){
        resetPlayerStates();
        let firstCrop = cropsRemaining.splice(Math.floor(Math.random()*(cropsRemaining.length)), 1)[0];
        finalCrops.push(firstCrop);
        let secondCrop = cropsRemaining.splice(Math.floor(Math.random()*(cropsRemaining.length)), 1)[0];
        finalCrops.push(secondCrop);
        io.emit("finalCropSale", firstCrop, secondCrop, players);
    }

    else{
        console.log("newRound")
        resetPlayerStates();
        for (let i = 0; i < players.length; i++){
            scoreTableau(players[i], 0.5, false, false, false);
        }
    }
}

function makePlayer(userID, name, color){
    let playerNum = undefined;
    let neighborNums = [];
    let tableau = [];
    let draftingHand = [];
    let reserve = [];
    let saleOffer = [];
    let choice = [];
    let numCoins = 20;
    let numWorkers = 1;
    let numVP = 0;
    let isReady = false;
    let isInGame = false;
    let isVendor= false;     

    const getNumGoods = () => {
        let numGoods = 0;
        for (let i = 0; i < tableau.length; i++){
            numGoods +=1;
        }
        return numGoods;
    }

    const getNumFruits = () => {
        let numFruits = 0;
        for (let i = 0; i < tableau.length; i++){
            if (tableau[i].type == "Fruit"){
                numFruits += 1;
            }
        }
        return numFruits;
    }

    const getNumCrops = () => {
        let numCrops = 0;
        for (let i = 0; i < tableau.length; i++){
            if (tableau[i].type == "Crop"){
                numCrops += 1;
            }
        }
        return numCrops;
    }

    const getNumTrinkets = () => {
        let numTrinkets = 0;
        for (let i = 0; i < tableau.length; i++){
            if (tableau[i].type == "Trinket"){
                numTrinkets += 1;
            }
        }
        return numTrinkets;
    }

    return {userID, name, color, playerNum, neighborNums, tableau, draftingHand, reserve, saleOffer, choice, numCoins, numWorkers, numVP, isReady, isInGame, isVendor, getNumGoods, getNumFruits, getNumCrops, getNumTrinkets}
}