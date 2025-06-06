const socket = io("http://localhost:3000")

let playerName = prompt("what is your name?")
socket.emit('joinGame', playerName);