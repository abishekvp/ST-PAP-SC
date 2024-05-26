document.addEventListener('DOMContentLoaded', () => {
    const socket = io();
    const loginSection = document.getElementById('login');
    const gameSection = document.getElementById('game');
    const joinButton = document.getElementById('join-btn');
    const usernameInput = document.getElementById('username');
    const choices = document.querySelectorAll('.choice');
    const resultText = document.getElementById('result-text');
    const playersDiv = document.getElementById('players');

    joinButton.addEventListener('click', () => {
        const username = usernameInput.value;
        if (username) {
            socket.emit('join', username);
            loginSection.style.display = 'none';
            gameSection.style.display = 'block';
        }
    });

    choices.forEach(choice => {
        choice.addEventListener('click', () => {
            const playerChoice = choice.getAttribute('data-choice');
            socket.emit('choice', playerChoice);
        });
    });

    socket.on('updatePlayers', (players) => {
        playersDiv.innerHTML = '';
        for (const [id, player] of Object.entries(players)) {
            const playerElement = document.createElement('div');
            playerElement.textContent = `${player.username}: ${player.choice ? 'Chosen' : 'Waiting...'} | Score: ${player.score}`;
            playersDiv.appendChild(playerElement);
        }
    });

    socket.on('results', (results) => {
        resultText.textContent = 'Results:';
        for (const [username, result] of Object.entries(results)) {
            const resultElement = document.createElement('div');
            resultElement.textContent = `${username}: ${result}`;
            resultText.appendChild(resultElement);
        }
        setTimeout(() => {
            resultText.textContent = '';
            socket.emit('updatePlayers');
        }, 3000);
    });
});
