const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);
    
    socket.on('join', (username) => {
        players[socket.id] = {
            username: username,
            choice: null,
            score: 0
        };
        io.emit('updatePlayers', players);
    });

    socket.on('choice', (choice) => {
        if (players[socket.id]) {
            players[socket.id].choice = choice;
            io.emit('updatePlayers', players);

            // Check if all players have made their choice
            const allMadeChoice = Object.values(players).every(player => player.choice !== null);
            if (allMadeChoice) {
                const results = determineWinners(players);
                io.emit('results', results);
                // Update scores
                Object.entries(results).forEach(([id, result]) => {
                    if (result === 'win') {
                        players[id].score++;
                    }
                });
                io.emit('updatePlayers', players);
                // Reset choices
                Object.values(players).forEach(player => player.choice = null);
            }
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updatePlayers', players);
        console.log(`Disconnected: ${socket.id}`);
    });
});

function determineWinners(players) {
    const playerArray = Object.entries(players);
    const results = {};

    playerArray.forEach(([id, player]) => {
        results[id] = 'draw';
    });

    for (let i = 0; i < playerArray.length; i++) {
        for (let j = i + 1; j < playerArray.length; j++) {
            const [id1, player1] = playerArray[i];
            const [id2, player2] = playerArray[j];
            const winner = getWinner(player1.choice, player2.choice);

            if (winner === 'player1') {
                results[id1] = 'win';
                results[id2] = 'lose';
            } else if (winner === 'player2') {
                results[id1] = 'lose';
                results[id2] = 'win';
            }
        }
    }

    return results;
}

function getWinner(choice1, choice2) {
    if (choice1 === choice2) return 'draw';
    if ((choice1 === 'stone' && choice2 === 'scissors') ||
        (choice1 === 'paper' && choice2 === 'stone') ||
        (choice1 === 'scissors' && choice2 === 'paper')) {
        return 'player1';
    } else {
        return 'player2';
    }
}

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
