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
        "VP": "Math.ceil(3/2*player.getNumFruits())"
    },
    {
        "name": "Blackberries",
        "type": "Fruit",
        "image": "static/Images/Blackberries.png",
        "onPlay": `scoreTableau(player, 0.25)`,
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
        "ongoing": "!!! TEMP SET WORTH BASED ON DISCARDED COINS",
        "VP": "0"
    },
    {
        "name": "Kiwis",
        "type": "Fruit",
        "image": "static/Images/Kiwis.png",
        "onPlay": "vendor.numCoins++",
        "active": "none",
        "ongoing": "none",
        "VP": "!!! 3*KIWIS IN PLAY"
    },
    {
        "name": "Mangoes",
        "type": "Fruit",
        "image": "static/Images/Mangoes.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "!!! TRIPLE LOWEST SCORING CROP",
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
        "onPlay": `player.isReady = false; player.choice[0] = \"pineappleTarget\"; io.emit('pineappleTarget', player.playerNum, players);`,
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
        "VP": "player.numCoins/3"
    }*/
]