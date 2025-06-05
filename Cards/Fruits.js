export const allFruits = [
    {
        "name": "Apples",
        "type": "Fruit",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "7"
    },
    {
        "name": "Bananas",
        "type": "Fruit",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "Math.ceil(3/2*numFruits)"
    },
    {
        "name": "Blackberries",
        "type": "Fruit",
        "image": "",
        "onPlay": "score(self, 0.25)",
        "ongoing": "none",
        "VP": "0"
    },
    {
        "name": "Cherries",
        "type": "Fruit",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "3*Math.min(numCoins/4, numFruits)"
    },
    {
        "name": "Coconuts",
        "type": "Fruit",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "11-numFruits"
    },
    {
        "name": "Grapes",
        "type": "Fruit",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "neighbors[0].numFruits+neighbors[1].numFruits"
    },
    {
        "name": "Guavas",
        "type": "Fruit",
        "image": "",
        "onPlay": "none",
        "ongoing": "TEMP SET WORTH BASED ON DISCARDED COINS",
        "VP": "0"
    },
    {
        "name": "Kiwis",
        "type": "Fruit",
        "image": "",
        "onPlay": "vendor.numCoins++",
        "ongoing": "none",
        "VP": "3*KIWIS IN PLAY"
    },
    {
        "name": "Mangoes",
        "type": "Fruit",
        "image": "",
        "onPlay": "none",
        "ongoing": "TRIPLE LOWEST SCORING CROP",
        "VP": "0"
    },
    {
        "name": "Oranges",
        "type": "Fruit",
        "image": "",
        "onPlay": "numCoins += 4",
        "ongoing": "none",
        "VP": "numTrinkets"
    },
    {
        "name": "Papayas",
        "type": "Fruit",
        "image": "",
        "onPlay": "numCoins += 10; numWorkers += 2",
        "ongoing": "none",
        "VP": "0"
    },
    {
        "name": "Passion Fruit",
        "type": "Fruit",
        "image": "",
        "onPlay": "none",
        "ongoing": "KEEP FINAL DRAFT",
        "VP": "0"
    },
    {
        "name": "Pears",
        "type": "Fruit",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "2*NUM GOOD IN exactly one neighboring tableau"
    },
    {
        "name": "Pineapples",
        "type": "Fruit",
        "image": "",
        "onPlay": "pineappleTarget()",
        "ongoing": "none",
        "VP": "pineappleTarget.VP"
    },
    {
        "name": "Strawberries",
        "type": "Fruit",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "numCoins/3"
    }
]