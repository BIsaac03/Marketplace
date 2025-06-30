export const allFruits = [
    {
        "name": "Apples",
        "type": "Fruit",
        "image": "./Images/Apples.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "7"
    },
    {
        "name": "Bananas",
        "type": "Fruit",
        "image": "./Images/Bananas.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "Math.ceil(3/2*players[i].numFruits)"
    },
    {
        "name": "Blackberries",
        "type": "Fruit",
        "image": "./Images/Blackberries.png",
        "onPlay": "scoreTableau(players[i], 0.25)",
        "ongoing": "none",
        "VP": "0"
    },
    {
        "name": "Cherries",
        "type": "Fruit",
        "image": "./Images/Cherries.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "3*Math.min(players[i].numCoins/4, players[i].numFruits)"
    },
    {
        "name": "Coconuts",
        "type": "Fruit",
        "image": "./Images/Coconuts.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "11-players[i].numFruits"
    },
    {
        "name": "Grapes",
        "type": "Fruit",
        "image": "./Images/Grapes.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "players[players[i].neighborNums[0]].numFruits+players[players[i].neighborNums[1].numFruits]"
    },
    {
        "name": "Guavas",
        "type": "Fruit",
        "image": "./Images/Guavas.png",
        "onPlay": "none",
        "ongoing": "TEMP SET WORTH BASED ON DISCARDED COINS",
        "VP": "0"
    },
 /*   {
        "name": "Kiwis",
        "type": "Fruit",
        "image": "./Images/Kiwis.png",
        "onPlay": "vendor.numCoins++",
        "ongoing": "none",
        "VP": "3*KIWIS IN PLAY"
    },
 */   {
        "name": "Mangoes",
        "type": "Fruit",
        "image": "./Images/Mangoes.png",
        "onPlay": "none",
        "ongoing": "!!! TRIPLE LOWEST SCORING CROP",
        "VP": "0"
    },
    {
        "name": "Oranges",
        "type": "Fruit",
        "image": "./Images/Oranges.png",
        "onPlay": "players[i].numCoins += 4",
        "ongoing": "none",
        "VP": "players[i].numTrinkets"
    },
    {
        "name": "Papayas",
        "type": "Fruit",
        "image": "./Images/Papayas.png",
        "onPlay": "players[i].numCoins += 10; players[i].numWorkers += 2",
        "ongoing": "none",
        "VP": "0"
    },
    {
        "name": "Passion Fruit",
        "type": "Fruit",
        "image": "./Images/Passion_Fruit.png",
        "onPlay": "none",
        "ongoing": "!!! KEEP FINAL DRAFT",
        "VP": "0"
    },
 /*   {
        "name": "Pears",
        "type": "Fruit",
        "image": "./Images/Pears.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "2*(players[players[i].neighborNums[0]].tableau.filter(good => !players[players[i].neighborNums[1]].tableau.includes(good)).lenght)"
    },
    {
        "name": "Pineapples",
        "type": "Fruit",
        "image": "./Images/Pineapples.png",
        "onPlay": "io.emit("pineappleTarget", players[i].playerNum, players)",
        "ongoing": "none",
        "VP": "!!! pineappleTarget.VP"
    },
*/    {
        "name": "Strawberries",
        "type": "Fruit",
        "image": "./Images/Strawberries.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "players[i].numCoins/3"
    }
]