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
        "VP": "players[i].getNumGoods"
    },
    {
        "name": "Coffee",
        "type": "Crop",
        "image": "static/Images/Coffee.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*(players[i].getNumCrops - players[i].tableau.some(good -> good.name == "Coffee"))
    },
    {
        "name": "Corn",
        "type": "Crop",
        "image": "static/Images/Corn.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*players[i].getNumFruits"
    },
    {
        "name": "Cotton",
        "type": "Crop",
        "image": "static/Images/Cotton.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "DISCOUNT: if(goodtype == \"Trinket\"){discount+=1}",
        "VP": "2*players[i].getNumTrinkets"
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
    {
        "name": "Oats",
        "type": "Crop",
        "image": "static/Images/Oats.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "2*(Math.abs(players[i].getNumCrops - (players[i].getNumFruits+players[i].getNumTrinkets)))"
    },
    {
        "name": "Peanuts",
        "type": "Crop",
        "image": "static/Images/Peanuts.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "5*Math.min(players[i].getNumFruits, players[i].getNumCrops, players[i].getNumTrinkets)"
    },
 */   {
        "name": "Peppers",
        "type": "Crop",
        "image": "static/Images/Peppers.png",
        "onPlay": "loseGood",
        "active": "none",
        "ongoing": "none",
        "VP": "Math.ceil((players[i].getNumFruits + players[i].getNumTrinkets)/2)"
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
        "VP": "3*Math.min(players[i].getNumFruits, players[i].getNumCrops)"
    },
    {
        "name": "Sugarcane",
        "type": "Crop",
        "image": "static/Images/Sugarcane.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "Math.floor((players[players[i].neighborNums[0]].getNumFruits+players[players[i].neighborNums[0]].getNumTrinkets+players[players[i].neighborNums[1]].getNumFruits+players[players[i].neighborNums[1]].getNumTrinkets) / 2)"
    },
    {
        "name": "Tobacco",
        "type": "Crop",
        "image": "static/Images/Tobacco.png",
        "onPlay": "none",
        "active": "none",
        "ongoing": "none",
        "VP": "3*players[i].getNumTrinkets-players[i].getNumCrops"
    },
*/    {
        "name": "Tomatoes",
        "type": "Crop",
        "image": "static/Images/Tomatoes.png",
        "onPlay": "none",
        "active": "socket.emit('activeAbility', 'tomatoAction', myPlayerNum);",
        "ongoing": "none",
        "VP": "Math.ceil(3/2*players[i].getNumCrops)"
    },
    {
        "name": "Wheat",
        "type": "Crop",
        "image": "static/Images/Wheat.png",
        "onPlay": "players[i].numWorkers+=3",
        "active": "none",
        "ongoing": "none",
        "VP": "4"
    }
] 