export const allTrinkets = [
    {
        "name": "Artwork",
        "type": "Trinket",
        "image": "static/Images/Artwork.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "(player.getNumTrinkets() >= 2)*1 + (player.getNumTrinkets() >= 3)*4 + (player.getNumTrinkets() >= 4)*5 + (player.getNumTrinkets() >= 5)*10",
        "deckRestriction": "false"
    },
    {
        "name": "Bracelets",
        "type": "Trinket",
        "image": "static/Images/Bracelets.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "GET 2 EXTRA COINS ON INVEST",
        "VP": "0",
        "deckRestriction": "false"
    },
    {
        "name": "Carvings",
        "type": "Trinket",
        "image": "static/Images/Carvings.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "let poorer = 0; for(let i = 0; i < players.length; i++){if(player.numCoins > players[i].numCoins){poorer += 1;}}; 4*poorer;",
        "deckRestriction": "players.length == 6"
    },
       {
        "name": "Charms",
        "type": "Trinket",
        "image": "static/Images/Charms.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "MINORITY BONUS",
        "VP": "0",
        "deckRestriction": "false"
    },
    {
        "name": "Earrings",
        "type": "Trinket",
        "image": "static/Images/Earrings.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "DISCOUNT: discount+=1;",
        "VP": "players[player.neighborNums[0]].tableau.filter(good => players[player.neighborNums[1]].tableau.includes(good) && !player.tableau.includes(good)).length",
        "deckRestriction": "false"
    },
    {
        "name": "Fabrics",
        "type": "Trinket",
        "image": "static/Images/Fabrics.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "3*Math.min(player.getNumFruits(), player.getNumTrinkets())",
        "deckRestriction": "false"
    },
    {
        "name": "Figurines",
        "type": "Trinket",
        "image": "static/Images/Figurines.png",
        "onPlay": "player.numWorkers+=5",
        "active": "none",
        "ongoing": "TWO WORKERS PER TURN",
        "VP": "0",
        "deckRestriction": "players.length == 3"
    },
    {
        "name": "Lanterns",
        "type": "Trinket",
        "image": "static/Images/Lanterns.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "POINTS FOR SIMILAR GOODS ON SALE",
        "VP": "0",
        "deckRestriction": "false"
    },
    {
        "name": "Masks",
        "type": "Trinket",
        "image": "static/Images/Masks.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "!!! ADAPT TYPE BASED ON DISCARDED COINS",
        "VP": "0",
        "deckRestriction": "false"
    },
    {
        "name": "Necklaces",
        "type": "Trinket",
        "image": "static/Images/Necklaces.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "9",
        "deckRestriction": "false"
    },
    {
        "name": "Perfume",
        "type": "Trinket",
        "image": "static/Images/Perfume.png",
        "onPlay": "none",
        "active": "socket.emit('activeAbility', 'perfumeAction', myPlayerNum);",
        "ongoing": "none",
        "VP": "0",
        "deckRestriction": "false"
    },
    {
        "name": "Pins",
        "type": "Trinket",
        "image": "static/Images/Pins.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*player.getNumFruits()-player.getNumTrinkets()",
        "deckRestriction": "false"
    },
    {
        "name": "Postcards",
        "type": "Trinket",
        "image": "static/Images/Postcards.png",
        "onPlay": "scoreTableau(player, 0.5, false, false, true);player.numVP -= 4",
        "active": "none",
        "ongoing": "none",
        "VP": "0",
        "deckRestriction": "gameRound == 1"
    },
    {
        "name": "Pouches",
        "type": "Trinket",
        "image": "static/Images/Pouches.png",
        "onPlay": "none",
        "active": "socket.emit('activeAbility', 'pouchesAction', myPlayerNum);",
        "ongoing": "none",
        "VP": "2",
        "deckRestriction": "false"
    },
    {
        "name": "Shells",
        "type": "Trinket",
        "image": "static/Images/Shells.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "BREAKOUT + 2VP WHEN YOU BUY A CARD YOU CANNOT AFFORD",
        "VP": "0",
        "deckRestriction": "false"
    }
]