import {allFruits} from "./Cards/Fruits.js";
import {allCrops} from "./Cards/Crops.js";
import {allTrinkets} from "./Cards/Trinkets.js";

let players = [];

function makePlayer(name, color){
    let playerNum = players.length;
    let neighbors = [];
    let tableau = [];
    let hand = [];
    let reserve = [];
    let choice = "";
    let numCoins = 20;
    let numWorkers = 1;
    let VP = 0;
    let numFruits = 0;
    let numCrops = 0;
    let numTrinkets = 0;

    const setNeighbors = () => {
        neighbors.push(players[(playerNum+1)%players.length]);
        if (playerNum != 0){
            neighbors.push(players[playerNum-1]);
        }
        else {neighbors.push(players[players.length-1])};
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

    return {name, color, playerNum, neighbors, tableau, hand, reserve, choice, numCoins, numWorkers, VP, numFruits, numCrops, numTrinkets, setNeighbors, buyCard, scoreTableau}
}

function draftCards(deck){
    // deals 3 cards to each player
    let remainingCards = deck;
    for (let i = 0; i < players.length; i++){
        for(let _ = 0; _ < 3; _++){
            let addedCard = remainingCards.splice(Math.floor(Math.random()*(remainingCards.length)), 1)[0];
            players[i].hand.push(addedCard);
        }
    }

    //!!! CURRENTLY DRAFTS RANDOMLY !!!
    for (let _ = 0; _ < 3; _++){
        let previousHand = [];
        let nextHand = [];
        for (let i = 0; i < players.length; i++){
            let cardToReserve = players[i].hand.splice(Math.floor(Math.random()*(players[i].hand.length)), 1)[0];
            players[i].reserve.push(cardToReserve);
            nextHand = players[i].hand;
            players[i].hand = previousHand;
            previousHand = nextHand;
        }
        players[0].hand = previousHand;
    }
}

function performSale(vendor){
    console.log(vendor.name + " is performing a sale");

    // !!! CURRENTLY SELLS RANDOMLY !!!
    let cardToSell = vendor.reserve.splice(Math.floor(Math.random()*(vendor.reserve.length)), 1)[0];
    let sellingPrice = Math.floor(Math.random()*(10))
    let vendorAction = 0;

    // resolve choices
    for (let i = 0; i < players.length; i++){
        if (players[i] != vendor){
            players[i].choice = prompt("Choose: Gain " + sellingPrice + " coins, or buy " + cardToSell.name + " for " + sellingPrice + " coins.");
            if(players[i].choice === "coins"){
                players[i].numCoins += sellingPrice;
                vendorAction++;
            }
            else if (players[i].choice === "card"){
                players[i].buyCard(cardToSell, sellingPrice);
                vendorAction--;
            }
            players[i].choice = "";
        }
    }

    // resolve vendor action
    if (vendorAction > 0){
        vendor.numCoins += sellingPrice;
    }
    else if (vendorAction < 0){
        vendor.buyCard(cardToSell, sellingPrice);
    }
    else{
        vendor.choice = prompt("Choose: Gain " + sellingPrice + " coins, or buy " + cardToSell.name + " for " + sellingPrice + " coins.");
        if(vendor.choice === "coins"){
            vendor.numCoins += sellingPrice;
        }
        else if (vendor.choice === "card"){
            vendor.buyCard(cardToSell, sellingPrice);
        }
        vendor.choice = "";
    }
}

function gameSetUp(){
    let playerCount = 3//prompt("How many players will there be?")
    for (let i = 0; i < playerCount; i++){
        let name = "player"//prompt("What is Player" + (i+1) + "'s name?");
        let color = "rgb(i*60, i*60, i*60)";
        let player = makePlayer(name, color);
        players.push(player);
    }

    for (let i = 0; i < players.length; i++){
        players[i].setNeighbors();
    }
}

function playRound(fruitsRemaining, cropsRemaining, trinketsRemaining, scoreModifier, isFinalRound){
    let deck = [];
    for (let i = 0; i < players.length; i++){
        let randomFruit = fruitsRemaining.splice(Math.floor(Math.random()*(fruitsRemaining.length)), 1)[0];
        let randomCrop = cropsRemaining.splice(Math.floor(Math.random()*(cropsRemaining.length)), 1)[0];
        let randomTrinket = trinketsRemaining.splice(Math.floor(Math.random()*(trinketsRemaining.length)), 1)[0];
        deck.push(randomFruit, randomCrop, randomTrinket);
    }
    draftCards(deck);
    for (let i = 0; i < players.length*2; i++){
        performSale(players[i%players.length]);
    }

    if (isFinalRound){
        // FINAL CROP SALE
    }

    for (let i = 0; i < players.length; i++){
        players[i].scoreTableau(scoreModifier)
    }
}

function playGame(){
    let fruitsRemaining = allFruits;
    let cropsRemaining = allCrops;
    let trinketsRemaining = allTrinkets;

    if (players.length < 5){
        playRound(fruitsRemaining, cropsRemaining, trinketsRemaining, 0.5, false)
    }
    playRound(fruitsRemaining, cropsRemaining, trinketsRemaining, 0.5, false)
    playRound(fruitsRemaining, cropsRemaining, trinketsRemaining, 1, true)
}

gameSetUp();
playGame();