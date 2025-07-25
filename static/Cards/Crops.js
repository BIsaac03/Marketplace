export const allCrops = [
 /*   {
        "name": "Beans",
        "type": "Crop",
        "image": "static/Images/Beans.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*players.length"
    },
    {
        "name": "Cacao",
        "type": "Crop",
        "image": "static/Images/Cacao.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "player.getNumGoods()"
    },
 */   {
        "name": "Coffee",
        "type": "Crop",
        "image": "static/Images/Coffee.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": `2*(player.getNumCrops() - player.tableau.some(good => good.name == "Coffee"))`
    },
 /*   {
        "name": "Corn",
        "type": "Crop",
        "image": "static/Images/Corn.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*player.getNumFruits()"
    },
    {
        "name": "Cotton",
        "type": "Crop",
        "image": "static/Images/Cotton.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "DISCOUNT: if(goodType == \"Trinket\"){discount+=1}",
        "VP": "2*player.getNumTrinkets()"
    },
 */   {
        "name": "Mint",
        "type": "Crop",
        "image": "static/Images/Mint.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "HIGHEST SCORING FRUIT"
    },
    {
        "name": "Oats",
        "type": "Crop",
        "image": "static/Images/Oats.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*(Math.abs(player.getNumCrops() - (player.getNumFruits()+player.getNumTrinkets())))"
    },
    {
        "name": "Peanuts",
        "type": "Crop",
        "image": "static/Images/Peanuts.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "5*Math.min(player.getNumFruits(), player.getNumCrops(), player.getNumTrinkets())"
    },
    {
        "name": "Peppers",
        "type": "Crop",
        "image": "static/Images/Peppers.png",
        "onPlay": "loseGood",
        "active": "none",
        "ongoing": "none",
        "VP": "Math.ceil((player.getNumFruits() + player.getNumTrinkets())/2)"
    },
   {
        "name": "Potatoes",
        "type": "Crop",
        "image": "static/Images/Potatoes.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "3*(player.tableau.filter(good1 => (!players[player.neighborNums[0]].tableau.some(good2 => good1.name == good2.name) && !players[player.neighborNums[1]].tableau.some(good3 => good1.name == good3.name))).length);"
    },
 /*   {
        "name": "Rice",
        "type": "Crop",
        "image": "static/Images/Rice.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "3*Math.min(player.getNumFruits(), player.getNumCrops())"
    },
    {
        "name": "Sugarcane",
        "type": "Crop",
        "image": "static/Images/Sugarcane.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "Math.floor((players[player.neighborNums[0]].getNumFruits()+players[player.neighborNums[0]].getNumTrinkets()+players[player.neighborNums[1]].getNumFruits()+players[player.neighborNums[1]].getNumTrinkets()) / 2)"
    },
    {
        "name": "Tobacco",
        "type": "Crop",
        "image": "static/Images/Tobacco.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "(3*player.getNumTrinkets()) - (player.getNumCrops())"
    },
    {
        "name": "Tomatoes",
        "type": "Crop",
        "image": "static/Images/Tomatoes.png",
        "onPlay": "none",
        "active": "socket.emit('activeAbility', 'tomatoAction', myPlayerNum);",
        "ongoing": "none",
        "VP": "Math.ceil(3/2*player.getNumCrops())"
    },
    {
        "name": "Wheat",
        "type": "Crop",
        "image": "static/Images/Wheat.png",
        "onPlay": "player.numWorkers+=3",
        "active": "none",
        "ongoing": "none",
        "VP": "4"
    }*/
] 