export const allCrops = [
    {
        "name": "Beans",
        "type": "Crop",
        "image": "static/Images/Beans.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*players.length"
    },
/*    {
        "name": "Cacao",
        "type": "Crop",
        "image": "static/Images/Cacao.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "players[i].numGoods"
    },
    {
        "name": "Coffee",
        "type": "Crop",
        "image": "static/Images/Coffee.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*(players[i].numCrops - players[i].tableau.some(good -> good.name == "Coffee"))
    },
    {
        "name": "Corn",
        "type": "Crop",
        "image": "static/Images/Corn.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*players[i].numFruits"
    },
    {
        "name": "Cotton",
        "type": "Crop",
        "image": "static/Images/Cotton.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "DISCOUNT: if(goodtype == \"Trinket\"){discount+=1}",
        "VP": "2*players[i].numTrinkets"
    },
    {
        "name": "Mint",
        "type": "Crop",
        "image": "static/Images/Mint.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "!!! HIGHEST SCORING FRUIT"
    },
 */   {
        "name": "Oats",
        "type": "Crop",
        "image": "static/Images/Oats.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*(Math.abs(players[i].numCrops - (players[i].numFruits+players[i].numTrinkets)))"
    },
    {
        "name": "Peanuts",
        "type": "Crop",
        "image": "static/Images/Peanuts.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "5*Math.min(players[i].numFruits, players[i].numCrops, players[i].numTrinkets)"
    },
    {
        "name": "Peppers",
        "type": "Crop",
        "image": "static/Images/Peppers.png",
        "onPlay": "loseGood",
        "active": "none",
        "ongoing": "none",
        "VP": "Math.ceil((players[i].numFruits + players[i].numTrinkets)/2)"
    },
/*   {
        "name": "Potatoes",
        "type": "Crop",
        "image": "static/Images/Potatoes.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "!!! 3*GOOD HERE NOT NEIGHBORING"
    },
    {
        "name": "Rice",
        "type": "Crop",
        "image": "static/Images/Rice.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "3*Math.min(players[i].numFruits, players[i].numCrops)"
    },
    {
        "name": "Sugarcane",
        "type": "Crop",
        "image": "static/Images/Sugarcane.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "players[players[i].neighborNums[0]].numFruits+players[players[i].neighborNums[0]].numTrinkets+players[players[i].neighborNums[1]].numGoods+players[players[i].neighborNums[1]].numTrinkets"
    },
    {
        "name": "Tobacco",
        "type": "Crop",
        "image": "static/Images/Tobacco.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "3*players[i].numTrinkets-players[i].numCrops"
    },
    {
        "name": "Tomatoes",
        "type": "Crop",
        "image": "static/Images/Tomatoes.png",
        "onPlay": "none",
        "active": "socket.emit("activeAbility", "tomatoAction", playerNum);",
        "ongoing": "none",
        "VP": "Math.ceil(3/2*players[i].numCrops)"
    },
    {
        "name": "Wheat",
        "type": "Crop",
        "image": "static/Images/Wheat.png",
        "onPlay": "players[i].numWorkers+=3",
        "active": "none",
        "ongoing": "none",
        "VP": "4"
    }*/
] 