import {allFruits} from "./Cards/Fruits.js";
import {allCrops} from "./Cards/Crops.js";
import {allTrinkets} from "./Cards/Trinkets.js";

import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

/////// SOCKETIO SETUP
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://127.0.0.1:5500",
    }
});

/////////// SERVER EVENTS
io.on("connection", (socket) => {
    socket.on("currentID", (currentID) => {
        const existingID = players.find(player => player.userID == currentID);
        if (existingID != undefined) {
            socket.emit("returningPlayer", existingID, players);
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

    socket.on("startGame", () => {
        for (let i = 0; i < players.length; i++){
            players[i].isInGame = true;
            players[i].setNeighborNums;
        }
        io.emit("gameStartSetup", players);
        if (players.length < 5){
            totalRounds = 3;
        }
        else if (players.length >= 5){
            totalRounds = 2;
        }
        newRound();
    })

    socket.on("draftedCard", (myPlayerNum, cardChoice) => {
        const activePlayer = players.find(player => player.playerNum == myPlayerNum)
        activePlayer.reserve.push(activePlayer.draftingHand[cardChoice]);
        activePlayer.draftingHand.splice(cardChoice, 1);
        activePlayer.isReady = true;

        let keepWaiting = players.find(player => player.isReady == false)
        if (keepWaiting == undefined){
            io.emit("roundUpdate", players);
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
                let thisHand = undefined
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
                if (players[i].choice[0] == "buy"){   
                    if (players[i].numCoins >= price){
                        players[i].numCoins -= eval(price);
                        players[i].tableau.push(goodForSale);

                        if (goodForSale.type === "Fruit"){
                            players[i].numFruits++;
                        }
                        if (goodForSale.type === "Crop"){
                            players[i].numCrops++;
                        }
                        if (goodForSale.type === "Trinket"){
                            players[i].numTrinkets++;
                        }
                        io.emit("goodPurchased", goodForSale, i)
                    }
        
                    else{
                        players[i].numCoins += Math.ceil(eval(price)/2);
                    }
                }
                
                else if (players[i].choice[0] == "invest"){
                    players[i].numCoins += eval(price);
                }
            }
            for (let i = 0; i < players.length; i++){
                players[i].isReady = false;
            }
            // round-end updates
            const indexOfSoldGood = players[vendorNum].reserve.findIndex(good => good.name == goodForSale.name);
            players[vendorNum].reserve.splice(indexOfSoldGood, 1);
            io.emit("roundUpdate", players);
            resetPlayerStates();

            // proceed to next sale
            players[vendorNum].isVendor = false;
            if (vendorNum == players.length-1){
                players[0].isVendor = true;
            }
            else{
                players[vendorNum+1].isVendor = true;
            }
            const vendor = players.find(player => player.isVendor == true);
            if (vendor.reserve.length > 1){
                io.emit("setSaleTerms", vendor.reserve, vendor.playerNum);
            }

            else{
                endOfRound();
            }
        }
    })    

    socket.on("disconnect", (reason) => {
        //console.log(reason);
    });
});

httpServer.listen(3000);

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

function newRound()
{
    gameRound += 1;
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

function endOfRound(){
    if (gameRound == totalRounds){
        // !!!!!!!!!! final crop sale
        
        for (let i = 0; i < players.length; i++){
            players[i].scoreTableau(1);
        }
        console.log("End of Game");
    }

    else{
        console.log("newRound")
        for (let i = 0; i < players.length; i++){
            players[i].scoreTableau(0.5);
        }
        newRound();
        io.emit("roundUpdate", players);

    }
}

function makePlayer(userID, name, color){
    let playerNum = players.length;
    let neighborNums = [];
    let tableau = [];
    let draftingHand = [];
    let reserve = [];
    let choice = [];
    let numCoins = 20;
    let numWorkers = 1;
    let VP = 0;
    let numFruits = 0;
    let numCrops = 0;
    let numTrinkets = 0;
    let isReady = false;
    let isInGame = false;
    let isVendor= false;

    const setNeighborNums = () => {
        neighborNums.push((playerNum+1)%players.length);
        if (playerNum != 0){
            neighborNums.push(playerNum-1);
        }
        else {neighborNums.push(players.length-1)};
    }
    const buyCard = (card, cost) => {
        if (card.type === "Fruit"){
            numFruits++;
        }
        if (card.type === "Crop"){
            numCrops++;
        }
        if (card.type === "Trinket"){
            numTrinkets++;
        }
        // !!! SHOULD CHECK FOR DISCOUNTS !!!
        numCoins -= cost;
        tableau.push(card);
    }
    const scoreTableau = (modifier) => {
        let totalScore = 0;
        for (let i = 0; i < tableau.length; i++){
            totalScore += eval(tableau[i].VP);
        }
        let adjustedScore = totalScore * modifier;
        VP += adjustedScore;
    }

    return {userID, name, color, playerNum, neighborNums, tableau, draftingHand, reserve, choice, numCoins, numWorkers, VP, numFruits, numCrops, numTrinkets, isReady, isInGame, isVendor, setNeighborNums, buyCard, scoreTableau}
}