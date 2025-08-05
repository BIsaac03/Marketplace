export const allFruits = [
 /*   {
        "name": "Apples",
        "type": "Fruit",
        "image": "static/Images/Apples.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "7",
        "deckRestriction": "false"
    },
    {
        "name": "Bananas",
        "type": "Fruit",
        "image": "static/Images/Bananas.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "4*Math.floor(player.getNumFruits()/2)",
        "deckRestriction": "false"
    },
    {
        "name": "Blackberries",
        "type": "Fruit",
        "image": "static/Images/Blackberries.png",
        "onPlay": `scoreTableau(player, 0.25, false, false, true)`,
        "active": "none",
        "ongoing": "none",
        "VP": "0",
        "deckRestriction": "gameRound == 1"
    },
    {
        "name": "Cherries",
        "type": "Fruit",
        "image": "static/Images/Cherries.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "3*Math.min(player.numCoins/4, player.getNumFruits())",
        "deckRestriction": "false"
    },
    {
        "name": "Coconuts",
        "type": "Fruit",
        "image": "static/Images/Coconuts.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "13-(2*player.getNumFruits())",
        "deckRestriction": "false"
    },
    {
        "name": "Grapes",
        "type": "Fruit",
        "image": "static/Images/Grapes.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": `players[player.neighborNums[0]].getNumFruits()+players[player.neighborNums[1]].getNumFruits()`,
        "deckRestriction": "false"
    },
    {
        "name": "Guavas",
        "type": "Fruit",
        "image": "static/Images/Guavas.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "TEMP SET WORTH BASED ON DISCARDED COINS",
        "VP": "0",
        "deckRestriction": "false"
    },
    {
        "name": "Kiwis",
        "type": "Fruit",
        "image": "static/Images/Kiwis.png",
        "onPlay": "if(player.numCoins > 0){const vendor = players.find(player => (player.isVendor == true)); vendor.numCoins += 1; player.numCoins -= 1;}",
        "active": "none",
        "ongoing": "none",
        "VP": "let kiwis = 0; for(let i = 0; i < players.length; i++){if(players[i].tableau.some(fruit => fruit.name == \"Kiwis\")){kiwis += 1;}}; 3*kiwis;",
        "deckRestriction": "players.length == 6"
    },
    {
        "name": "Mangoes",
        "type": "Fruit",
        "image": "static/Images/Mangoes.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "TRIPLE LOWEST SCORING CROP",
        "VP": "0",
        "deckRestriction": "false"
    },
    {
        "name": "Oranges",
        "type": "Fruit",
        "image": "static/Images/Oranges.png",
        "onPlay": "player.numCoins += 6",
        "active": "none",
        "ongoing": "none",
        "VP": "player.getNumTrinkets()",
        "deckRestriction": "false"
    },
 */   {
        "name": "Papayas",
        "type": "Fruit",
        "image": "static/Images/Papayas.png",
        "onPlay": "player.numCoins += 10; player.numWorkers += 2",
        "active": "none",
        "ongoing": "none",
        "VP": "0",
        "deckRestriction": "false"
    },
    {
        "name": "Passion_Fruit",
        "type": "Fruit",
        "image": "static/Images/Passion_Fruit.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "IMMEDIATELY PLACE FINAL DRAFTED CARD INTO YOUR TABLEAU",
        "VP": "0",
        "deckRestriction": "gameRound == totalRounds"
    },
    {
        "name": "Pears",
        "type": "Fruit",
        "image": "static/Images/Pears.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*(player.tableau.filter(good => ((players[player.neighborNums[0]].tableau.includes(good) + players[player.neighborNums[1]].tableau.includes(good)) == 1)).length)",
        "deckRestriction": "false"
    },
    {
        "name": "Pineapples",
        "type": "Fruit",
        "image": "static/Images/Pineapples.png",
        "onPlay": `player.waitingOn = \"pineappleTarget\"; player.isReady = false; io.emit('updatePlayerStatus', false, player.playerNum) ; io.emit('pineappleTarget', player.playerNum, players);`,
        "active": "none",
        "ongoing": "none",
        "VP": "overwritten",
        "deckRestriction": "gameRound == 1"
    },
    {
        "name": "Strawberries",
        "type": "Fruit",
        "image": "static/Images/Strawberries.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "Math.floor((player.numCoins + player.choice[0] + player.choice[1])/5)",
        "deckRestriction": "false"
    }
]