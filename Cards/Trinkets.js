export const allTrinkets = [
    {
        "name": "Artwork",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "(numTrinkets >= 2)*1 + (numTrinkets >= 4)*4 + (numTrinkets >= 6)*5 + (numTrinkets >= 8)*10"
    },
    {
        "name": "Bracelets",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "GET COINS WHEN SKIP SALE",
        "VP": "0"
    },
    {
        "name": "Carvings",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "4*NUM PLAYERS LESS COINS"
    },
    {
        "name": "Charms",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "MINORITY BONUS",
        "VP": "0"
    },
    {
        "name": "Earrings",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "CARDS COST 1 LESS",
        "VP": "NOT HERE, BOTH NEIGHBORING"
    },
    {
        "name": "Fabrics",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "3*Math.min(numFruits, numTrinkets)"
    },
    {
        "name": "Figurines",
        "type": "Trinket",
        "image": "",
        "onPlay": "numWorkers+=5",
        "ongoing": "TWO WORKERS PER TURN",
        "VP": "0"
    },
    {
        "name": "Lanterns",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "POINTS FOR UNIQUENESS",
        "VP": "0"
    },
    {
        "name": "Masks",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "ADAPT TYPE BASED ON DISCARDED COINS",
        "VP": "0"
    },
    {
        "name": "Necklaces",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "none",
        "VP": "9"
    },
    {
        "name": "Perfume",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "DISCARD GOOD FOR VP",
        "VP": "0"
    },
    {
        "name": "Pins",
        "type": "Trinket",
        "image": "",
        "onPlay": "ALONGSIDE ANOTHER",
        "ongoing": "none",
        "VP": "2*numFruits-numTrinkets"
    },
    {
        "name": "Postcards",
        "type": "Trinket",
        "image": "",
        "onPlay": "score(self, 0.5, -4)",
        "ongoing": "none",
        "VP": "0"
    },
    {
        "name": "Pouches",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "CAN BUY WORKERS",
        "VP": "2"
    },
    {
        "name": "Shells",
        "type": "Trinket",
        "image": "",
        "onPlay": "none",
        "ongoing": "RECEIVE COINS IF CANNOT BUY",
        "VP": "numCoins/5"
    }
]