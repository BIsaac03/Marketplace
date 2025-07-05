export const allTrinkets = [
/*    {
        "name": "Artwork",
        "type": "Trinket",
        "image": "static/Images/Artwork.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "(players[i].getNumTrinkets >= 2)*1 + (players[i].getNumTrinkets >= 4)*4 + (players[i].getNumTrinkets >= 6)*5 + (players[i].getNumTrinkets >= 8)*10"
    },
    {
        "name": "Bracelets",
        "type": "Trinket",
        "image": "static/Images/Bracelets.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "!!! GET COINS WHEN SKIP SALE",
        "VP": "0"
    },
    {
        "name": "Carvings",
        "type": "Trinket",
        "image": "static/Images/Carvings.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "!!! 4*NUM PLAYERS LESS COINS"
    },
       {
        "name": "Charms",
        "type": "Trinket",
        "image": "static/Images/Charms.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "!!! MINORITY BONUS",
        "VP": "0"
    },
    {
        "name": "Earrings",
        "type": "Trinket",
        "image": "static/Images/Earrings.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "DISCOUNT: 1",
        "VP": "players[players[i].neighborNums[0]].tableau.filter(good => players[players[i].neighborNums[1]].tableau.includes(good) && !players[i].tableau.includes(good)).length"
    },
       {
        "name": "Fabrics",
        "type": "Trinket",
        "image": "static/Images/Fabrics.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "3*Math.min(players[i].getNumFruits, players[i].getNumTrinkets)"
    },
    {
        "name": "Figurines",
        "type": "Trinket",
        "image": "static/Images/Figurines.png",
        "onPlay": "players[i].numWorkers+=5",
        "active": "none",
        "ongoing": "!!! TWO WORKERS PER TURN",
        "VP": "0"
    },
    {
        "name": "Lanterns",
        "type": "Trinket",
        "image": "static/Images/Lanterns.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "!!! POINTS FOR UNIQUENESS",
        "VP": "0"
    },
    {
        "name": "Masks",
        "type": "Trinket",
        "image": "static/Images/Masks.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "!!! ADAPT TYPE BASED ON DISCARDED COINS",
        "VP": "0"
    },
    {
        "name": "Necklaces",
        "type": "Trinket",
        "image": "static/Images/Necklaces.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "9"
    },
  */  {
        "name": "Perfume",
        "type": "Trinket",
        "image": "static/Images/Perfume.png",
        "onPlay": "none",
        "active": "socket.emit('activeAbility', 'perfumeAction', myPlayerNum);",
        "ongoing": "none",
        "VP": "0"
    },
    {
        "name": "Pins",
        "type": "Trinket",
        "image": "static/Images/Pins.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*players[i].getNumFruits-players[i].getNumTrinkets"
    },
    {
        "name": "Postcards",
        "type": "Trinket",
        "image": "static/Images/Postcards.png",
        "onPlay": "scoreTableau(players[i], 0.5);players[i].numVP -= 4",
        "active": "none",
        "ongoing": "none",
        "VP": "0"
    },
    {
        "name": "Pouches",
        "type": "Trinket",
        "image": "static/Images/Pouches.png",
        "onPlay": "none",
        "active": "socket.emit('activeAbility', 'pouchesAction', myPlayerNum);",
        "ongoing": "none",
        "VP": "2"
    },
/*    {
        "name": "Shells",
        "type": "Trinket",
        "image": "static/Images/Shells.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "!!! RECEIVE COINS IF CANNOT BUY",
        "VP": "players[i].numCoins/5"
    }*/
]