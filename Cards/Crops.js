export const allCrops = [
    {
        "name": "Beans",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "2*numPlayers"
    },
    {
        "name": "Cacao",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "numGoods"
    },
    {
        "name": "Coffee",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "(2-hasCoffee)*numCrops"
    },
    {
        "name": "Corn",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "2*numFruits"
    },
    {
        "name": "Cotton",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "TRINKET COST -1",
        "VP": "2*numTrinkets"
    },
    {
        "name": "Mint",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "HIGHEST SCORING FRUIT"
    },
    {
        "name": "Oats",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "(Math.abs(numCrops - (numFruits+numTrinkets)))*2"
    },
    {
        "name": "Peanuts",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "5*Math.min(numFruits, numCrops, numTrinkets)"
    },
    {
        "name": "Peppers",
        "type": "Crop",
        "image": "",
        "onPlay": "OTHERS DISCARD",
        "ongoing": "none",
        "VP": "Math.ceil((numFruits + numTrinkets)/2)"
    },
    {
        "name": "Potatoes",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "3*GOOD HERE NOT NEIGHBORING"
    },
    {
        "name": "Rice",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "3*Math.min(numFruits, numCrops)"
    },
    {
        "name": "Sugarcane",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "NEIGHBORING TABLEAUS"
    },
    {
        "name": "Tobacco",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "3*numTrinkets-numCrops"
    },
    {
        "name": "Tomatoes",
        "type": "Crop",
        "image": "",
        "onPlay": "none",
        "ongoing": "CHANGE TYPE",
        "VP": "Math.ceil(3/2*numCrops)"
    },
    {
        "name": "Wheats",
        "type": "Crop",
        "image": "",
        "onPlay": "numWorkers+=3",
        "ongoing": "none",
        "VP": "4"
    }
]