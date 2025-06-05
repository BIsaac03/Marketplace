export const allCrops = [
    {
        "name": "Beans",
        "type": "Crop",
        "image": "./Images/Beans.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "2*numPlayers"
    },
    {
        "name": "Cacao",
        "type": "Crop",
        "image": "./Images/Cacao.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "numGoods"
    },
    {
        "name": "Coffee",
        "type": "Crop",
        "image": "./Images/Coffee.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "(2-hasCoffee)*numCrops"
    },
    {
        "name": "Corn",
        "type": "Crop",
        "image": "./Images/Corn.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "2*numFruits"
    },
    {
        "name": "Cotton",
        "type": "Crop",
        "image": "./Images/Cotton.png",
        "onPlay": "none",
        "ongoing": "TRINKET COST -1",
        "VP": "2*numTrinkets"
    },
    {
        "name": "Mint",
        "type": "Crop",
        "image": "./Images/Mint.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "HIGHEST SCORING FRUIT"
    },
    {
        "name": "Oats",
        "type": "Crop",
        "image": "./Images/Oats.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "2*(Math.abs(numCrops - (numFruits+numTrinkets)))"
    },
    {
        "name": "Peanuts",
        "type": "Crop",
        "image": "./Images/Peanuts.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "5*Math.min(numFruits, numCrops, numTrinkets)"
    },
    {
        "name": "Peppers",
        "type": "Crop",
        "image": "./Images/Peppers.png",
        "onPlay": "loseGood()",
        "ongoing": "none",
        "VP": "Math.ceil((numFruits + numTrinkets)/2)"
    },
    {
        "name": "Potatoes",
        "type": "Crop",
        "image": "./Images/Potatoes.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "3*GOOD HERE NOT NEIGHBORING"
    },
    {
        "name": "Rice",
        "type": "Crop",
        "image": "./Images/Rice.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "3*Math.min(numFruits, numCrops)"
    },
    {
        "name": "Sugarcane",
        "type": "Crop",
        "image": "./Images/Sugarcane.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "neighbors[0].numFruits+neighbors[0].numTrinkets+neighbors[1].numGoods+neighbors[1].numTrinkets"
    },
    {
        "name": "Tobacco",
        "type": "Crop",
        "image": "./Images/Tobacco.png",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "3*numTrinkets-numCrops"
    },
    {
        "name": "Tomatoes",
        "type": "Crop",
        "image": "./Images/Tomatoes.png",
        "onPlay": "none",
        "ongoing": "CHANGE TYPE",
        "VP": "Math.ceil(3/2*numCrops)"
    },
    {
        "name": "Wheat",
        "type": "Crop",
        "image": "./Images/Wheat.png",
        "onPlay": "numWorkers+=3",
        "ongoing": "none",
        "VP": "4"
    }
]