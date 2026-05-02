const socket = io('/game');

const params = new URLSearchParams(window.location.search);
const matchId = params.get('matchId');
const username = params.get('username');

if (!matchId || !username) {
  window.location.href = '/';
}

const matchIdDisplay = document.getElementById('match-id');
const playersCount = document.getElementById('players-count');
const currentRound = document.getElementById('current-round');
const waitingSection = document.getElementById('waiting-section');
const gameSection = document.getElementById('game-section');
const resultsSection = document.getElementById('results-section');
const gameMessage = document.getElementById('game-message');
const choiceButtons = document.querySelectorAll('.choice-btn');
const resultsContent = document.getElementById('results-content');
const playAgainBtn = document.getElementById('play-again-btn');

matchIdDisplay.textContent = matchId;

let choices = ['Rock', 'Paper', 'Scissors'];
let roundResults = [];

socket.on('connect', () => {
  socket.emit('game:join-match-room', { 
    gameMatchId: matchId, 
    playerUsername: username 
  });
});

socket.on('game:user-joined-to-match', (data) => {
  if (data.status === 'ok') {
    playersCount.textContent = '2';
    waitingSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
  }
});

choiceButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const choice = parseInt(btn.dataset.choice);
    socket.emit('game:make-choice', {
      matchId: matchId,
      username: username,
      choice: choice,
    });
    
    choiceButtons.forEach((b) => (b.disabled = true));
    gameMessage.textContent = 'Choice submitted! Waiting for opponent...';
  });
});

socket.on('game:round-result', (data) => {
  roundResults.push(data);
  currentRound.textContent = roundResults.length;
  
  gameMessage.textContent = `Round ${roundResults.length}: ${data.message}`;
  
  if (data.isMatchOver) {
    setTimeout(() => {
      showResults(data.finalResults);
    }, 1000);
  } else {
    setTimeout(() => {
      choiceButtons.forEach((b) => (b.disabled = false));
      gameMessage.textContent = 'Choose your move!';
    }, 1500);
  }
});

socket.on('game:match-error', (data) => {
  gameMessage.textContent = data.message;
  gameMessage.className = 'message error';
  choiceButtons.forEach((b) => (b.disabled = false));
});

function showResults(finalResults) {
  gameSection.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  
  let html = '<table><thead><tr><th>Round</th><th>Player 1</th><th>Player 2</th><th>Winner</th></tr></thead><tbody>';
  
  finalResults.forEach((result, index) => {
    html += `<tr>
      <td>${index + 1}</td>
      <td>${result.player1Choice}</td>
      <td>${result.player2Choice}</td>
      <td>${result.winner || 'Tie'}</td>
    </tr>`;
  });
  
  html += '</tbody></table>';
  resultsContent.innerHTML = html;
}

playAgainBtn.addEventListener('click', () => {
  window.location.href = '/';
});
