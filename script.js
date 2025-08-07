import {allFruits} from "./static/Cards/Fruits.js";
import {allCrops} from "./static/Cards/Crops.js";
import {allTrinkets} from "./static/Cards/Trinkets.js";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import tinycolor from "tinycolor2";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/////// SOCKETIO SETUP
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 3000 ;

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/client.js');
});
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/static/styles.css');
});

app.use("/static", express.static('./static/'));

const io = new Server(httpServer, {
    cors: {
        origin: "http://marketplace-pfci.onrender.com",
        //origin: "http://127.0.0.1:5500",
}
});

io.use((socket, next) => {
    currentID = socket.handshake.auth.token;
    next();
});

let currentID = undefined;

/////////// SERVER EVENTS
io.on("connection", (socket) => {
    const existingPlayer = players.find(player => player.userID == currentID);
    if (existingPlayer != undefined) {
        socket.emit("returningPlayer", existingPlayer, players, totalRounds, gameRound, saleCount, finalCrops);
    }
    else{socket.emit("newPlayer", gameRound);}
    socket.emit("displayExistingPlayers", players);

    socket.on("joinGame", (userID, playerName, playerColor) => {
        let colorSpecs = undefined;
        if (tinycolor(playerColor).isDark()){
            colorSpecs = [playerColor, true];
        }
        else{colorSpecs =  [playerColor, false];}
        const existingName = players.find(player => player.name == playerName);
        const existingID = players.find(player => player.userID == userID);
        if (existingName != undefined && existingName.userID != userID){
            socket.emit("nameTaken", playerName);
        }
        else if (existingID == undefined){
            let thisPlayer = makePlayer(userID, playerName, colorSpecs);
            players.push(thisPlayer);
            io.emit("playerJoined", userID, playerName, colorSpecs);
        }
        else{
            existingID.name = playerName;
            existingID.color = colorSpecs;
            io.emit("playerJoined", userID, playerName, colorSpecs);
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
                totalRounds = 3;
            }
            else if (players.length >= 5){
                totalRounds = 2;
            }
            io.emit("gameStartSetup", players, totalRounds, gameRound);
            setTimeout(() => {newRound()}, 3000);
        }
    })
    socket.on("draftedCard", (myPlayerNum, goodIndex) => {
        const activePlayer = players.find(player => player.playerNum == myPlayerNum)
        activePlayer.reserve.push(activePlayer.draftingHand[goodIndex]);
        activePlayer.draftingHand.splice(goodIndex, 1);
        activePlayer.isReady = true;
        io.emit("updatePlayerStatus", true, myPlayerNum);

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
            players[i].waitingOn = "buyGood";
            players[i].isReady = false;
            io.emit("updatePlayerStatus", false, i);

        }

        const lanterns = players[vendorNum].tableau.find(trinket => trinket.name == "Lanterns")
        if (lanterns != undefined){
            const goodsOfSimilarType = players[vendorNum].tableau.filter(good => good.type == goodToBuy[0].type);
            players[vendorNum].numVP += goodsOfSimilarType.length;
        }

        players[vendorNum].saleOffer = [goodToBuy, salePrice];
        players[vendorNum].isReady = true;
        io.emit("updatePlayerStatus", true, vendorNum);
        socket.broadcast.emit("resolveSale", goodToBuy, salePrice, vendorNum, players, false)
    })

    socket.on("saleResult", (choice, myPlayerNum, goodForSale, price, vendorNum, numWorkers) => {
        let discount = "none";
        players[myPlayerNum].isReady = true;
        io.emit("updatePlayerStatus", true, myPlayerNum);

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
                    io.emit("breakout", players);
                }
                else if (numInvests > numBuys){
                    players[vendorNum].choice.push("buy");
                    discount = "clearance";
                    io.emit("clearance", players, goodForSale[0].type);
                }
                else{
                    players[vendorNum].waitingOn = "vendorChoice";
                    players[vendorNum].isReady = false;
                    io.emit("updatePlayerStatus", false, vendorNum);
                    io.emit("resolveSale", goodForSale, price, vendorNum, players, true);
                }
            }
        }
 
        // if necessary, determine vendor's choice
        else{
            if (choice == "buy"){
                players[myPlayerNum].choice.push("buy");
                players[myPlayerNum].isReady = true;
                io.emit("updatePlayerStatus", true, myPlayerNum);

            }
            else if (choice == "invest"){
                players[myPlayerNum].choice.push("invest");
                players[myPlayerNum].isReady = true;
                io.emit("updatePlayerStatus", true, myPlayerNum);

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
                    players[i].waitingOn = "loseGood";
                    players[i].isReady = false;
                    io.emit("updatePlayerStatus", false, i);
                    io.emit("chooseLostGood", players[i], true);
                }
            }

            // ensure Kiwi does not result in negative coins
            for (let i = 0; i < players.length; i++){
                if (players[i].numCoins < 0){
                    players[i].numCoins += 1;   
                    players[vendorNum].numCoins -= 1;       
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
            io.emit("updatePlayerStatus", true, playerNum);
            endOfTurn();
        }
    })

    socket.on("activeAbility", (abilityType, playerNum) => {
        if (abilityType == "perfumeAction"){
            socket.emit("chooseLostGood", players[playerNum], false);
            players[playerNum].numVP += 6;
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
        const pineapples = players[playerNum].tableau.find(good => good.name == "Pineapples");
        pineapples.VP = copiedGood.VP;
        pineapples.ongoing = copiedGood.image;
        players[playerNum].choice.length = 0;
        io.emit("goodPurchased", pineapples, playerNum);

        players[playerNum].isReady = true;
        io.emit("updatePlayerStatus", true, playerNum);
        endOfTurn();
    })

    socket.on("readyPlayer", (playerNum) => {
        players[playerNum].isReady = true;
        io.emit("updatePlayerStatus", true, playerNum);
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
                gotPeppers = playerNum
            }

            if (players[playerNum].reserve.some(good => good.name == "Pins")){
                players[playerNum].reserve.push({
                                                    "name": "Cornucopia",
                                                    "type": "Crop",
                                                    "image": "static/Images/Cornucopia.png",
                                                    "onPlay": "none",
                                                    "active": "none",
                                                    "ongoing": "none",
                                                    "VP": "Math.ceil(Math.random()*12)",
                                                    "deckRestriction": "false"
                                                })
            }
        }
        players[playerNum].draftingHand.length = 0;
        players[playerNum].isReady = true;
        io.emit("updatePlayerStatus", true, playerNum);
        let keepWaiting = players.find(player => player.isReady == false)
        if (keepWaiting == undefined){

            // endOfTurn() moves vendor clockwise; vendor should not move here, so move counter-clockwise to counteract
            const oldVendor = players.find(player => player.isVendor == true);
            oldVendor.isVendor = false;
            if (oldVendor.playerNum == 0){
                players[players.length - 1].isVendor = true;
            }
            else{
                players[oldVendor.playerNum-1].isVendor = true;
            }
            /////////////////////////////////////////////////////////////////////////////////////////////////////////////

            if (gotPeppers != undefined){
                for (let i = 0; i < players.length; i++){
                    if (i != gotPeppers){
                        players[i].waitingOn = "loseGood";
                        players[i].isReady = false;
                        io.emit("updatePlayerStatus", false, i);
                        io.emit("chooseLostGood", players[i], true);
                    }
                }
            }

            else{endOfTurn();}
        }
    })

    socket.on("masksResolved", (playerNum, newFruits, newCrops, modifier, isLastRound, isMidGameScoring) => {
        players[playerNum].numCoins -= (newFruits + newCrops);
        players[playerNum].masked.length = 0;
        players[playerNum].masked.push(Math.floor(newFruits/3))
        players[playerNum].masked.push(Math.floor(newCrops/3));
        for (let i = 0; i < Math.floor(newFruits/3); i++){
            io.emit("addMask", "Fruit", i, playerNum);
        }
        for (let i = 0; i < Math.floor(newCrops/3); i++){
            io.emit("addMask", "Crop", i+newFruits, playerNum);
        }
        scoreTableau(players[playerNum], modifier, true, false, isLastRound, isMidGameScoring);
    })

    socket.on("guavasSet", (playerNum, coinsSpent, modifier, isLastRound, isMidGameScoring) => {
        players[playerNum].numCoins -= coinsSpent;
        const guavas = players[playerNum].tableau.find(fruit => fruit.name == "Guavas");
        guavas.VP = 2*Math.floor(coinsSpent/5);
        scoreTableau(players[playerNum], modifier, true, true, isLastRound, isMidGameScoring);
    })

    socket.on("resolveFinalSale", (bid1, bid2, playerNum) => {
        players[playerNum].choice.push(bid1);
        players[playerNum].choice.push(bid2);
        players[playerNum].isReady = true;
        io.emit("updatePlayerStatus", true, playerNum);
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
                const player = players.find(player => player.playerNum == playerNum);
                players[i].numCoins -= (players[i].choice[0] + players[i].choice[1]);
                players[i].finalSaleCoins += (players[i].choice[0] + players[i].choice[1]);
                if(players[i].choice[0] > avg1){
                    players[i].tableau.push(JSON.parse(JSON.stringify(finalCrops[0])));
                    if (finalCrops[0].onPlay != "none" && finalCrops[0].onPlay != "loseGood"){
                        eval(finalCrops[0].onPlay);
                    }
                    io.emit("goodPurchased", finalCrops[0], i)
                }
                if(players[i].choice[1] > avg2){
                    players[i].tableau.push(JSON.parse(JSON.stringify(finalCrops[1])));
                    if (finalCrops[1].onPlay != "none" && finalCrops[1].onPlay != "loseGood"){
                        eval(finalCrops[1].onPlay);
                    }
                    io.emit("goodPurchased", finalCrops[1], i)
                }
            }
            // pepper checks
            if (finalCrops[0].onPlay == "loseGood"){
                for (let i = 0; i < players.length; i++){
                    if (players[i].choice[0] <= (avg1)){
                        players[i].waitingOn = "loseGood";
                        players[i].isReady = false;
                        io.emit("updatePlayerStatus", false, i);
                        io.emit("chooseLostGood", players[i], true);
                    }
                }
            }
            else if (finalCrops[1].onPlay == "loseGood"){
                for (let i = 0; i < players.length; i++){
                    if (players[i].choice[1] <= (avg2)){
                        players[i].waitingOn = "loseGood";
                        players[i].isReady = false;
                        io.emit("updatePlayerStatus", false, i);
                        io.emit("chooseLostGood", players[i], true);
                    }
                }
            }
            keepWaiting = players.find(player => player.isReady == false)
            if (keepWaiting == undefined){
                for (let i = 0; i < players.length; i++){
                    players[i].waitingOn = "seenFinalAvgs";
                    players[i].isReady = false;
                    io.emit("updatePlayerStatus", false, i);
                }
                io.emit("displayFinalSaleAvg", avg1, avg2);
            }   
        }  
    })
  
    socket.on("seenFinalSale", (playerNum) => {
        players[playerNum].isReady = true;
        io.emit("updatePlayerStatus", true, playerNum);
        let keepWaiting = players.find(player => player.isReady == false)
        if (keepWaiting == undefined){
            io.emit("turnUpdate", players);
            resetPlayerStates();
            for (let i = 0; i < players.length; i++){
                players[i].waitingOn = "scoring";
                scoreTableau(players[i], 1, false, false, true, false);
            }
        }
    })

    socket.on("checkScore", (good, playerNum) => {
        const player = players[playerNum];
        const score = player.tableau.find(myGood => myGood.name == good.name);
        console.log(eval(score.VP));
    })

    socket.on("secretMessage", (playerNum, message) => {
        io.emit("readSecretMessage", playerNum, message);
    })
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
let gotPeppers = undefined;
const savedFruits = JSON.parse(JSON.stringify(allFruits));
const savedCrops = JSON.parse(JSON.stringify(allCrops));
const savedTrinkets = JSON.parse(JSON.stringify(allTrinkets));
let fruitsRemaining = allFruits;
let cropsRemaining = allCrops;
let trinketsRemaining = allTrinkets;


function resetPlayerStates() {
    for (let i = 0; i < players.length; i++){
        players[i].isReady = false;
        io.emit("updatePlayerStatus", false, i);
        players[i].choice.length = 0;
    }
    numBuys = 0;
    numInvests = 0;
}

function endOfTurn(){
    let keepWaiting = players.find(player => player.isReady == false)
    if (keepWaiting == undefined){
        if (finalCrops.length == 0){
            numBuys = 0;
            numInvests = 0;
            const oldVendor = players.find(player => player.isVendor == true);

            if (oldVendor.saleOffer.length > 0){
                const goodForSale = oldVendor.saleOffer[0];
                // remove good from vendor reserve
                for (let i = 0; i < goodForSale.length; i++){
                    const indexOfSoldGood = oldVendor.reserve.findIndex(good => good.name == goodForSale[i].name);
                    oldVendor.reserve.splice(indexOfSoldGood, 1);
                }
                oldVendor.saleOffer.length = 0;
            }

            // proceed to next vendor
            oldVendor.isVendor = false;
            if (oldVendor.playerNum == players.length-1){
                players[0].isVendor = true;
            }
            else{
                players[oldVendor.playerNum+1].isVendor = true;
            }
    
            io.emit("turnUpdate", players);
            io.emit("displayReserve", players);

            if (saleCount < 2*players.length){
                saleCount += 1;
                const newVendor = players.find(player => player.isVendor == true);
                newVendor.waitingOn = "sellGood"
                newVendor.isReady = false;
                io.emit("updatePlayerStatus", false, newVendor.playerNum);
                io.emit("setSaleTerms", newVendor.reserve, newVendor.playerNum, saleCount);
            }
            else{
                saleCount = 0
                endOfRound();
            }
        }

        // peppers in final sale
        else{
            let runningBid1 = 0;
            let runningBid2 = 0;
            for (let i = 0; i < players.length; i++){
                runningBid1 += players[i].choice[0];
                runningBid2 += players[i].choice[1]
            }
            let avg1 = Math.floor(runningBid1 / players.length);
            let avg2 = Math.floor(runningBid2 / players.length);

            for (let i = 0; i < players.length; i++){
                players[i].waitingOn = "seenFinalAvgs"
            }
            resetPlayerStates();

            io.emit("displayFinalSaleAvg", avg1, avg2);
        }
    }
}

function newRound()
{
    resetPlayerStates();
    gameRound += 1;
    io.emit("newRound", gameRound, totalRounds);
    for (let i = 0; i < players.length; i++){
        players[i].reserve.length = 0;
        players[i].waitingOn = "draft";
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
    while (!validateDeck(deck)){}
    return deck;
}

function validateDeck(deck){
    for (let i = 0; i < deck.length; i++){
        if(eval(deck[i].deckRestriction)){
            const restrictedGood = deck.splice(i, 1)[0];
            if (restrictedGood.type == "Fruit"){
                deck.push(fruitsRemaining.splice(Math.floor(Math.random()*(fruitsRemaining.length)), 1)[0]);
                fruitsRemaining.push(restrictedGood);
            }
            else if (restrictedGood.type == "Crop"){
                deck.push(cropsRemaining.splice(Math.floor(Math.random()*(cropsRemaining.length)), 1)[0]); 
                cropsRemaining.push(restrictedGood);
            }
            else if (restrictedGood.type == "Trinket"){
                deck.push(trinketsRemaining.splice(Math.floor(Math.random()*(trinketsRemaining.length)), 1)[0]);
                trinketsRemaining.push(restrictedGood);
            }
            return false
        }
    }
    return true
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
    player.tableau.push(JSON.parse(JSON.stringify(goodForSale)));
    if (goodForSale.name != "Pineapples"){
        io.emit("goodPurchased", goodForSale, player.playerNum);
    }
    if (goodForSale.onPlay != "none" && goodForSale.onPlay != "loseGood"){
        eval(goodForSale.onPlay);
    }
}

function scoreTableau(player, modifier, evaluatedMasks, evaluatedGuavas, isLastRound, isMidGameScoring){
    if (player.tableau.some(trinket => trinket.name == "Masks" && evaluatedMasks == false)){
        player.waitingOn = "maskResolve("+modifier+","+player.numCoins+","+player.getNumTrinkets()+","+isLastRound+","+isMidGameScoring+")";
        player.isReady = false;
        io.emit("updatePlayerStatus", false, player.playerNum);
        io.emit("resolveMasks", modifier, player.playerNum, player.numCoins, player.getNumTrinkets(), isLastRound, isMidGameScoring)
        return 0;
    }

    if (player.tableau.some(fruit => fruit.name == "Guavas" && evaluatedGuavas == false)){
        player.waitingOn = "guavaResolve("+modifier+","+player.numCoins+","+isLastRound+","+isMidGameScoring+")";
        player.isReady = false;
        io.emit("updatePlayerStatus", false, player.playerNum);
        io.emit("setGuavaValue", modifier, player.playerNum, player.numCoins, isLastRound, isMidGameScoring)
        return 0;
    }

    // set VP of variable goods
    const mint = player.tableau.find(crop => crop.name == "Mint");
    const mintyPineapples = player.tableau.find(fruit => fruit.name == "Pineapples" && fruit.VP == "HIGHEST SCORING FRUIT");
    if (mint != undefined || mintyPineapples != undefined){
        let highestFruit = 0;
        for (let i = 0; i < player.tableau.length; i++){
            if (player.tableau[i].type == "Fruit" && player.tableau[i] != mintyPineapples){
                const fruitVP = eval(player.tableau[i].VP);
                if (fruitVP > highestFruit){
                    highestFruit = fruitVP;
                }
            }
        }
        
        if (mint != undefined){
            mint.VP = highestFruit;
        }
        if (mintyPineapples != undefined){
            mintyPineapples.VP = highestFruit;
        }
    }

    const mangoes = player.tableau.find(fruit => fruit.name == "Mangoes")
    if (mangoes != undefined){
        let lowestCrop = 999;
        for (let i = 0; i < player.tableau.length; i++){
            if (player.tableau[i].type == "Crop"){
                const cropVP = eval(player.tableau[i].VP);
                if (cropVP < lowestCrop){
                    lowestCrop = cropVP;
                }
            }
        }
        if (lowestCrop < 999){
            mangoes.VP = lowestCrop*2;
        }
    }

    let addedScore = 0;
    for (let i = 0; i < player.tableau.length; i++){
        addedScore += eval(player.tableau[i].VP);
    }
    let adjustedScore = addedScore * modifier;
    player.numVP += adjustedScore;
    if (mint != undefined){
        mint.VP = "HIGHEST SCORING FRUIT";
    }
    if (mintyPineapples != undefined){
        mintyPineapples.VP = "HIGHEST SCORING FRUIT";
    }
    if (mangoes != undefined){
        mangoes.VP = 0;

    }

    player.isReady = true;
    io.emit("updatePlayerStatus", true, player.playerNum);

    const keepWaiting = players.find(player => player.isReady == false);
    if (keepWaiting == undefined){
        setTimeout(() => {io.emit("removeMasks");}, 30000);
        if (!isLastRound && !isMidGameScoring){
            newRound();
            io.emit("turnUpdate", players);
        }

        else if (isLastRound){    
            io.emit("endOfGame", players.length);
            let sortedPlayers = players.toSorted((a, b) => a.numVP - b.numVP);
            for (let i = 0; i < players.length; i++){
                setTimeout(() => {io.emit("displayFinalScore", sortedPlayers[i], i, players.length)}, 2000*(i+1));
                players[i].waitingOn = "finalScores";
            }
            resetPlayerStates();
            setTimeout(() => {io.emit("turnUpdate", players)}, 2000*players.length);
            setTimeout(() => {resetGameState()}, 60000);
        }
    }
}

function endOfRound(){
    if (gameRound == totalRounds){
        let firstCrop = cropsRemaining.splice(Math.floor(Math.random()*(cropsRemaining.length)), 1)[0];
        finalCrops.push(firstCrop);
        let secondCrop = cropsRemaining.splice(Math.floor(Math.random()*(cropsRemaining.length)), 1)[0];
        finalCrops.push(secondCrop);
        for (let i = 0; i < players.length; i++){
            players[i].waitingOn = "finalSale";
        }
        resetPlayerStates();
        io.emit("finalCropSale", firstCrop, secondCrop, players);
    }

    else{
        console.log("newRound")
        resetPlayerStates();
        for (let i = 0; i < players.length; i++){
            players[i].waitingOn = "scoring";
            scoreTableau(players[i], 0.5, false, false, false, false);
        }
    }
}

function resetGameState(){
    players.length = 0;
    numBuys = 0;
    numInvests = 0;
    finalCrops.length = 0;
    gameRound = 0;
    totalRounds = 0;
    saleCount = 0;

    fruitsRemaining = JSON.parse(JSON.stringify(savedFruits));
    cropsRemaining = JSON.parse(JSON.stringify(savedCrops));
    trinketsRemaining = JSON.parse(JSON.stringify(savedTrinkets));
}

function makePlayer(userID, name, color){
    let playerNum = undefined;
    let neighborNums = [];
    let tableau = [];
    let draftingHand = [];
    let reserve = [];
    let saleOffer = [];
    let choice = [];
    let numCoins = 10;
    let numWorkers = 1;
    let numVP = 0;
    let masked = [0, 0];
    let finalSaleCoins = 0
    let isReady = false;
    let waitingOn = undefined;
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
        let numFruits = masked[0];
        for (let i = 0; i < tableau.length; i++){
            if (tableau[i].type == "Fruit"){
                numFruits += 1;
            }
        }
        return numFruits;
    }

    const getNumCrops = () => {
        let numCrops = masked[1];
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

    return {userID, name, color, playerNum, neighborNums, tableau, draftingHand, reserve, saleOffer, choice, numCoins, numWorkers, numVP, masked, finalSaleCoins, isReady, waitingOn, isInGame, isVendor, getNumGoods, getNumFruits, getNumCrops, getNumTrinkets}
}