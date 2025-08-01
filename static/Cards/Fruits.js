export const allFruits = [
/*    {
        "name": "Apples",
        "type": "Fruit",
        "image": "static/Images/Apples.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "7"
    },
    {
        "name": "Bananas",
        "type": "Fruit",
        "image": "static/Images/Bananas.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "4*Math.floor(player.getNumFruits()/2)"
    },
    {
        "name": "Blackberries",
        "type": "Fruit",
        "image": "static/Images/Blackberries.png",
        "onPlay": `scoreTableau(player, 0.25, false, false, true)`,
        "active": "none",
        "ongoing": "none",
        "VP": "0"
    },
    {
        "name": "Cherries",
        "type": "Fruit",
        "image": "static/Images/Cherries.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "3*Math.min(player.numCoins/4, player.getNumFruits())"
    },
    {
        "name": "Coconuts",
        "type": "Fruit",
        "image": "static/Images/Coconuts.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "11-player.getNumFruits()"
    },
    {
        "name": "Grapes",
        "type": "Fruit",
        "image": "static/Images/Grapes.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": `players[player.neighborNums[0]].getNumFruits()+players[player.neighborNums[1]].getNumFruits()`
    },
 */   {
        "name": "Guavas",
        "type": "Fruit",
        "image": "static/Images/Guavas.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "TEMP SET WORTH BASED ON DISCARDED COINS",
        "VP": "0"
    },
    {
        "name": "Kiwis",
        "type": "Fruit",
        "image": "static/Images/Kiwis.png",
        "onPlay": "if(player.numCoins > 0){const vendor = players.find(player => (player.isVendor == true)); vendor.numCoins += 1; player.numCoins -= 1;}",
        "active": "none",
        "ongoing": "none",
        "VP": "let kiwis = 0; for(let i = 0; i < players.length; i++){if(players[i].tableau.some(fruit => fruit.name == \"Kiwis\")){kiwis += 1;}}; 3*kiwis;"
    },
    {
        "name": "Mangoes",
        "type": "Fruit",
        "image": "static/Images/Mangoes.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "TRIPLE LOWEST SCORING CROP",
        "VP": "0"
    },
 /*   {
        "name": "Oranges",
        "type": "Fruit",
        "image": "static/Images/Oranges.png",
        "onPlay": "player.numCoins += 4",
        "active": "none",
        "ongoing": "none",
        "VP": "player.getNumTrinkets()"
    },
    {
        "name": "Papayas",
        "type": "Fruit",
        "image": "static/Images/Papayas.png",
        "onPlay": "player.numCoins += 10; player.numWorkers += 2",
        "active": "none",
        "ongoing": "none",
        "VP": "0"
    },
*/    {
        "name": "Passion_Fruit",
        "type": "Fruit",
        "image": "static/Images/Passion_Fruit.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "IMMEDIATELY PLACE FINAL DRAFTED CARD INTO YOUR TABLEAU",
        "VP": "0"
    },
    {
        "name": "Pears",
        "type": "Fruit",
        "image": "static/Images/Pears.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*(player.tableau.filter(good => (players[player.neighborNums[0]].tableau.filter(good => !players[player.neighborNums[1]].tableau.includes(good)))).length)"
    },
    {
        "name": "Pineapples",
        "type": "Fruit",
        "image": "static/Images/Pineapples.png",
        "onPlay": `player.waitingOn = \"pineappleTarget\"; player.isReady = false; io.emit('pineappleTarget', player.playerNum, players);`,
        "active": "none",
        "ongoing": "none",
        "VP": "overwritten"
    },
 /*   {
        "name": "Strawberries",
        "type": "Fruit",
        "image": "static/Images/Strawberries.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "Math.floor(player.numCoins/3)"
    }*/
]