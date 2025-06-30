export const allTrinkets = [
/*    {
        "name": "Artwork",
        "type": "Trinket",
        "image": "./Images/Artwork.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "(players[i].numTrinkets >= 2)*1 + (players[i].numTrinkets >= 4)*4 + (players[i].numTrinkets >= 6)*5 + (players[i].numTrinkets >= 8)*10"
    },
    {
        "name": "Bracelets",
        "type": "Trinket",
        "image": "./Images/Bracelets.png",
        "onPlay": "none",
        "ongoing": "!!! GET COINS WHEN SKIP SALE",
        "VP": "0"
    },
    {
        "name": "Carvings",
        "type": "Trinket",
        "image": "./Images/Carvings.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "!!! 4*NUM PLAYERS LESS COINS"
    },
       {
        "name": "Charms",
        "type": "Trinket",
        "image": "./Images/Charms.png",
        "onPlay": "none",
        "ongoing": "!!! MINORITY BONUS",
        "VP": "0"
    },
    {
        "name": "Earrings",
        "type": "Trinket",
        "image": "./Images/Earrings.png",
        "onPlay": "none",
        "ongoing": "DISCOUNT: 1",
        "VP": "players[players[i].neighborNums[0]].tableau.filter(good => players[players[i].neighborNums[1]].tableau.includes(good) && !players[i].tableau.includes(good)).lenght"
    },
       {
        "name": "Fabrics",
        "type": "Trinket",
        "image": "./Images/Fabrics.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "3*Math.min(players[i].numFruits, players[i].numTrinkets)"
    },
    {
        "name": "Figurines",
        "type": "Trinket",
        "image": "./Images/Figurines.png",
        "onPlay": "players[i].numWorkers+=5",
        "ongoing": "!!! TWO WORKERS PER TURN",
        "VP": "0"
    },
    {
        "name": "Lanterns",
        "type": "Trinket",
        "image": "./Images/Lanterns.png",
        "onPlay": "none",
        "ongoing": "!!! POINTS FOR UNIQUENESS",
        "VP": "0"
    },
    {
        "name": "Masks",
        "type": "Trinket",
        "image": "./Images/Masks.png",
        "onPlay": "none",
        "ongoing": "!!! ADAPT TYPE BASED ON DISCARDED COINS",
        "VP": "0"
    },
    {
        "name": "Necklaces",
        "type": "Trinket",
        "image": "./Images/Necklaces.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "9"
    },
    {
        "name": "Perfume",
        "type": "Trinket",
        "image": "./Images/Perfume.png",
        "onPlay": "none",
        "ongoing": "!!! DISCARD GOOD FOR VP",
        "VP": "0"
    },
*/    {
        "name": "Pins",
        "type": "Trinket",
        "image": "./Images/Pins.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "2*players[i].numFruits-players[i].numTrinkets"
    },
    {
        "name": "Postcards",
        "type": "Trinket",
        "image": "./Images/Postcards.png",
        "onPlay": "scoreTableau(players[i], 0.5);players[i].numVP -= 5",
        "ongoing": "none",
        "VP": "0"
    },
/*    {
        "name": "Pouches",
        "type": "Trinket",
        "image": "./Images/Pouches.png",
        "onPlay": "none",
        "ongoing": "!!! CAN BUY WORKERS",
        "VP": "2"
    },
    {
        "name": "Shells",
        "type": "Trinket",
        "image": "./Images/Shells.png",
        "onPlay": "none",
        "ongoing": "!!! RECEIVE COINS IF CANNOT BUY",
        "VP": "players[i].numCoins/5"
    }*/
]