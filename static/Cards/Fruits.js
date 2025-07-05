export const allFruits = [
    {
        "name": "Apples",
        "type": "Fruit",
        "image": "static/Images/Apples.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "7"
    },
 /*   {
        "name": "Bananas",
        "type": "Fruit",
        "image": "static/Images/Bananas.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "Math.ceil(3/2*players[i].getNumFruits)"
    },
    {
        "name": "Blackberries",
        "type": "Fruit",
        "image": "static/Images/Blackberries.png",
        "onPlay": "scoreTableau(players[i], 0.25)",
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
        "VP": "3*Math.min(players[i].numCoins/4, players[i].getNumFruits)"
    },
    {
        "name": "Coconuts",
        "type": "Fruit",
        "image": "static/Images/Coconuts.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "11-players[i].getNumFruits"
    },
    {
        "name": "Grapes",
        "type": "Fruit",
        "image": "static/Images/Grapes.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "players[players[i].neighborNums[0]].getNumFruits+players[players[i].neighborNums[1].getNumFruits]"
    },
    {
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
        "onPlay": "vendor.numCoins++",
        "active": "none",
        "ongoing": "none",
        "VP": "3*KIWIS IN PLAY"
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
    {
        "name": "Oranges",
        "type": "Fruit",
        "image": "static/Images/Oranges.png",
        "onPlay": "players[i].numCoins += 4",
        "active": "none",
        "ongoing": "none",
        "VP": "players[i].getNumTrinkets"
    },
    {
        "name": "Papayas",
        "type": "Fruit",
        "image": "static/Images/Papayas.png",
        "onPlay": "players[i].numCoins += 10; players[i].numWorkers += 2",
        "active": "none",
        "ongoing": "none",
        "VP": "0"
    },
    {
        "name": "Passion_Fruit",
        "type": "Fruit",
        "image": "static/Images/Passion_Fruit.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "!!! KEEP FINAL DRAFT",
        "VP": "0"
    },
 */   {
        "name": "Pears",
        "type": "Fruit",
        "image": "static/Images/Pears.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*(players[players[i].neighborNums[0]].tableau.filter(good => !players[players[i].neighborNums[1]].tableau.includes(good)).length)"
    },
    {
        "name": "Pineapples",
        "type": "Fruit",
        "image": "static/Images/Pineapples.png",
        "onPlay": "io.emit('pineappleTarget', players[i].playerNum, players)",
        "active": "none",
        "ongoing": "none",
        "VP": "overwritten"
    },
    {
        "name": "Strawberries",
        "type": "Fruit",
        "image": "static/Images/Strawberries.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "players[i].numCoins/3"
    }
]