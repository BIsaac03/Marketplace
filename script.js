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
            socket.emit("returningPlayer", existingID, players, totalRounds, gameRound);
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
            }
            for (let i = 0; i < players.length; i++){
                players[i].neighborNums.push((i+1)%players.length);
                if (i != 0){
                    players[i].neighborNums.push(i-1);
                }
                else {players[i].neighborNums.push(players.length-1)};
                console.log(players[i].neighborNums)
            }
            if (players.length < 5){
                totalRounds = 3;
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
            if (activePlayer.draftingHand.length == 0){
                console.log("All cards drafted; ready for sales.");
                players[Math.floor(Math.random()*players.length)].isVendor = true;
                const vendor = players.find(player => player.isVendor == true);
                io.emit("setSaleTerms", vendor.reserve, vendor.playerNum);
            }

            // passes remaining cards
            else{
                let previousHand = players[players.length-1].draftingHand;
                let thisHand = [];
                for (let i = 0; i < players.length; i++){
                    thisHand = players[i].draftingHand;
                    players[i].draftingHand = previousHand;
                    previousHand = thisHand; 
                }
                io.emit("nextDraftRound", players);
            }
            resetPlayerStates();
        }
    })

    socket.on("sellGood", (goodToBuy, salePrice, vendorNum) => {
        for(let i = 0; i < players.length; i++){
            players[i].choice.length = 0;
        }
        players[vendorNum].choice = [goodToBuy, salePrice];

        players[vendorNum].isReady = true;
        socket.broadcast.emit("resolveSale", goodToBuy, salePrice, vendorNum)
    })

    socket.on("saleResult", (choice, myPlayerNum, goodForSale, price, vendorNum) => {
        // preserve users' choices
        players[myPlayerNum].isReady = true;
        if (choice == "buy"){
            players[myPlayerNum].choice.push("buy");
        }
        else if (choice == "invest"){
            players[myPlayerNum].choice.push("invest");
        }

        let keepWaiting = players.find(player => player.isReady == false)
        if (keepWaiting == undefined){
            // apply users' choices
            for (let i = 0; i < players.length; i++){
                const modifiedCost = eval(price) - checkDiscount(players[i].tableau, goodForSale[0].type)
                if (players[i].choice[0] == "buy"){
                    if (players[i].numCoins >= modifiedCost){ 
                        if (goodForSale.length == 2){
                                resolvePurchase(players[i], goodForSale[1]);
                            }
                            resolvePurchase(players[i], goodForSale[0]);
                            players[i].numCoins -= modifiedCost;

                        } 
                    else{
                        players[i].choice[0] = "invest";
                        players[i].numCoins += Math.ceil(eval(price) / 2);
                    }
                }
            
                else if (players[i].choice[0] == "invest"){
                    players[i].numCoins += eval(price);
                }

                if (goodForSale[0].onPlay == "loseGood" && players[i].choice[0] == "invest"){
                    //players[i].isReady = false;
                    io.emit("chooseLostGood", players[i]);
                }
            }

            keepWaiting = players.find(player => player.isReady == false)
            if (keepWaiting == undefined){
                endOfTurn();
            }
        }
    })
    
    socket.on("readyToEndTurn", (playerNum) => {
        players[playerNum].isReady = true;
        let keepWaiting = players.find(player => player.isReady == false)
        if (keepWaiting == undefined){
            endOfTurn();
        }
    })
    
    socket.on("removeGood", (nameOfGoodToRemove, playerNum) => {
        const player = players.find(player => player.playerNum == playerNum);
        const indexOfRemovedGood = player.tableau.findIndex(good => good.name == nameOfGoodToRemove);
        player.tableau.splice(indexOfRemovedGood, 1);
        io.emit("removeGoodDOM", nameOfGoodToRemove, playerNum);
    })

    socket.on("activeAbility", (abilityType, playerNum) => {
        if (abilityType == "perfumeAction"){
            socket.emit("chooseLostGood", players[playerNum]);
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
        const pineapples = players[playerNum].tableau.find(good => good.name == "Pineapples");
        pineapples.VP = copiedGood.VP;
        socket.emit("pineappleToken", copiedGood.image, playerNum);
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
let gameRound = 0;
let totalRounds = 0;
let fruitsRemaining = allFruits;
let cropsRemaining = allCrops;
let trinketsRemaining = allTrinkets;


function resetPlayerStates() {
    for (let i = 0; i < players.length; i++){
        players[i].isReady = false;
        players[i].choice.length = 0;
    } 
}

function endOfTurn(){
    const oldVendor = players.find(player => player.isVendor == true);
    const goodForSale = oldVendor.choice[0];

    // remove good from vendor reserve
    for (let i = 0; i < goodForSale.length; i++){
        const indexOfSoldGood = oldVendor.reserve.findIndex(good => good.name == goodForSale[i].name);
        oldVendor.reserve.splice(indexOfSoldGood, 1);
    }

    io.emit("turnUpdate", players);
    resetPlayerStates();

    // proceed to next vendor
    oldVendor.isVendor = false;
    if (oldVendor.playerNum == players.length-1){
        players[0].isVendor = true;
    }
    else{
        players[oldVendor.playerNum+1].isVendor = true;
    }

    const newVendor = players.find(player => player.isVendor == true);
    if (players.some(player => player.reserve.length > 1)){
        io.emit("setSaleTerms", newVendor.reserve, newVendor.playerNum);
    }
    else{
        endOfRound();
    }
}

function newRound()
{
    gameRound += 1;
    for (let i = 0; i < players.length; i++){
        players[i].reserve.length = 0;
    }
    let draftingDeck = createDraftingDeck(players.length);
    createDraftingHands(draftingDeck);
    console.log("continuing draft");
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
    let discountEffects = tableau.filter(good => good.onPlay.startsWith("DISCOUNT: "));
    discountEffects = discountEffects.map(item => item.replace("DISCOUNT: ", ""));
    for (let i = 0; i < discountEffects.length; i++){
        eval(discountEffects[i]);
    }
    return discount;
}

function resolvePurchase(player, goodForSale){
    io.emit("goodPurchased", goodForSale, player.playerNum)
    player.tableau.push(goodForSale);
    if (goodForSale.onPlay != "none" && goodForSale.onPlay != "loseGood"){
        eval(goodForSale.onPlay);
    }
}

function scoreTableau(player, modifier){
    let addedScore = 0;
    for (let i = 0; i < player.tableau.length; i++){
    //    console.log(player.tableau[i].VP);
    //    console.log(eval(player.tableau[i].VP));
    //    console.log(Number(eval(player.tableau[i].VP)));
        addedScore += eval(player.tableau[i].VP);
    //    console.log(addedScore);
    }
    let adjustedScore = addedScore * modifier;
    //console.log("before vp");
    //console.log(+player.numVP);
    player.numVP += adjustedScore;
   // console.log("After: ");
   // console.log(player.numVP);
}

function endOfRound(){
    if (gameRound == totalRounds){
        // !!!!!!!!!! final crop sale
        for (let i = 0; i < players.length; i++){
            scoreTableau(players[i], 1);
        }
        console.log("End of Game");
    }

    else{
        console.log("newRound")
        for (let i = 0; i < players.length; i++){
            scoreTableau(players[i], 0.5);
            console.log("scored")
        }
        newRound();
        console.log("updating")
        io.emit("turnUpdate", players);
    }
}

function makePlayer(userID, name, color){
    let playerNum = undefined;
    let neighborNums = [];
    let tableau = [];
    let draftingHand = [];
    let reserve = [];
    let choice = [];
    let numCoins = 20;
    let numWorkers = 1;
    let numVP = 0;
    let isReady = false;
    let isInGame = false;
    let isVendor= false;     
    
    const scoreTableau = (modifier) => {
        let totalScore = 0;
        for (let i = 0; i < tableau.length; i++){
            totalScore += eval(tableau[i].VP);
        }
        let adjustedScore = totalScore * modifier;
        VP += adjustedScore;
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

    return {userID, name, color, playerNum, neighborNums, tableau, draftingHand, reserve, choice, numCoins, numWorkers, numVP, isReady, isInGame, isVendor, scoreTableau, getNumFruits, getNumCrops, getNumTrinkets}
}