const socket = io('/game');

const params = new URLSearchParams(window.location.search);
const matchId = params.get('matchId');
const username = params.get('username');

if (!matchId || !username) {
  window.location.href = '/';
}

MatchStorage.createMatch(matchId, username);

const CHOICE_NAMES = ['ROCK', 'PAPER', 'SCISSORS'];
const MATCH_ROUNDS = 3;

const matchIdDisplay = document.getElementById('match-id');
const playersCount = document.getElementById('players-count');
const playersList = document.getElementById('players-list');
const currentRoundDisplay = document.getElementById('current-round');
const waitingSection = document.getElementById('waiting-section');
const gameSection = document.getElementById('game-section');
const resultsSection = document.getElementById('results-section');
const gameMessage = document.getElementById('game-message');
const choiceButtons = document.querySelectorAll('.choice-btn');
const resultsContent = document.getElementById('results-content');
const playAgainBtn = document.getElementById('play-again-btn');
const waitingText = document.getElementById('waiting-text');
const roundNotification = document.getElementById('round-notification');
const roundNotificationText = document.getElementById('round-notification-text');
const leaveMatchBtn = document.getElementById('leave-match-btn');
const leaveMatchBtnTop = document.getElementById('leave-match-btn-top');

matchIdDisplay.textContent = matchId;

let localRound = 0;
let hasChosen = false;
let opponentChosen = false;
let prevRoundsPlayed = 0;

function renderPlayers() {
  const playersInfo = MatchStorage.getPlayersInfo(matchId);
  playersList.innerHTML = '';

  playersInfo.forEach((player) => {
    const span = document.createElement('span');
    span.className = 'player-tag' + (player.isMaster ? ' player-master' : '');
    span.textContent = player.username + (player.isMaster ? ' [M]' : '');
    playersList.appendChild(span);
  });

  playersCount.textContent = MatchStorage.getPlayerCount(matchId);
}

function updateWaitingState() {
  const isPlaying = MatchStorage.isPlaying(matchId);
  const playerCount = MatchStorage.getPlayerCount(matchId);

  if (isPlaying && playerCount >= 2) {
    waitingSection.classList.add('hidden');
    gameSection.classList.remove('hidden');
    choiceButtons.forEach((b) => (b.disabled = false));
  } else {
    waitingText.textContent = 'WAITING FOR OPPONENT...';
    gameSection.classList.add('hidden');
    waitingSection.classList.remove('hidden');
    choiceButtons.forEach((b) => (b.disabled = true));
  }
}

function showRoundNotification(text, type) {
  roundNotificationText.textContent = text;
  roundNotification.className = 'round-notification ' + type;
  setTimeout(() => {
    roundNotification.classList.add('hidden');
  }, 2000);
}

function handleRoundUpdate(newRoundsPlayed, serverResults) {
  for (let i = prevRoundsPlayed; i < newRoundsPlayed; i++) {
    const roundWinner = serverResults[i] || null;
    const roundNum = i + 1;

    if (roundWinner === null) {
      showRoundNotification('ROUND ' + roundNum + ': TIE!', 'tie');
    } else if (roundWinner === username) {
      showRoundNotification('ROUND ' + roundNum + ': YOU WIN!', 'win');
    } else {
      showRoundNotification('ROUND ' + roundNum + ': ' + roundWinner + ' WINS!', 'lose');
    }
  }

  prevRoundsPlayed = newRoundsPlayed;
}

socket.on('connect', () => {
  socket.emit('game:join-match-room', {
    gameMatchId: matchId,
    playerUsername: username,
  });

  renderPlayers();
  updateWaitingState();
});

socket.on('game:room-info-updated', (data) => {
  if (data.data) {
    const matchBefore = MatchStorage.getMatch(matchId);
    const prevPlayed = matchBefore ? matchBefore.roundsPlayed : 0;

    MatchStorage.syncFromServer(matchId, data.data);
    renderPlayers();
    updateWaitingState();

    const match = MatchStorage.getMatch(matchId);
    if (!match) return;

    const serverResults = data.data.rounds?.results || [];

    if (match.roundsPlayed > prevPlayed) {
      handleRoundUpdate(match.roundsPlayed, serverResults);
      hasChosen = false;
      opponentChosen = false;
      localRound = match.roundsPlayed;
      currentRoundDisplay.textContent = localRound;
    }

    if (match.roundsPlayed < prevPlayed) {
      localRound = 0;
      hasChosen = false;
      opponentChosen = false;
      prevRoundsPlayed = 0;
      currentRoundDisplay.textContent = '0';
      resultsSection.classList.add('hidden');
      gameSection.classList.remove('hidden');
      choiceButtons.forEach((b) => (b.disabled = false));
      gameMessage.textContent = 'Choose your move!';
      return;
    }

    if (match.roundsPlayed >= MATCH_ROUNDS) {
      setTimeout(() => showResults(), 2500);
    } else {
      setTimeout(() => {
        if (!hasChosen) {
          choiceButtons.forEach((b) => (b.disabled = false));
          gameMessage.textContent = 'Choose your move!';
        }
      }, 2000);
    }
  }
});

socket.on('game:room-match-notifications', (data) => {
  if (data.status === 'player-choose') {
    const choosingUser = data.data.user;
    if (choosingUser === username) {
      hasChosen = true;
      choiceButtons.forEach((b) => (b.disabled = true));
      gameMessage.textContent = 'Waiting for opponent...';
    } else {
      opponentChosen = true;
      if (hasChosen) {
        gameMessage.textContent = 'Both chose!';
      } else {
        gameMessage.textContent = 'Opponent has chosen. Your turn!';
      }
    }
  } else if (data.status === 'round-ended') {
    gameMessage.textContent = 'Round ended!';
  }
});

choiceButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    if (hasChosen) return;
    const moveChoice = parseInt(btn.dataset.choice);
    socket.emit('game:choose-move', {
      matchId: matchId,
      username: username,
      moveChoise: moveChoice,
    });
    hasChosen = true;
    choiceButtons.forEach((b) => (b.disabled = true));
    gameMessage.textContent = 'Waiting for opponent...';
  });
});

function showResults() {
  const match = MatchStorage.getMatch(matchId);

  if (!match || match.roundsPlayed < MATCH_ROUNDS) {
    setTimeout(() => {
      if (MatchStorage.getMatch(matchId)?.roundsPlayed >= MATCH_ROUNDS) {
        showResults();
      }
    }, 300);
    return;
  }

  gameSection.classList.add('hidden');
  resultsSection.classList.remove('hidden');
  roundNotification.classList.add('hidden');

  const playersInfo = MatchStorage.getPlayersInfo(matchId);
  const p1Name = playersInfo[0]?.username || 'Player 1';
  const p2Name = playersInfo[1]?.username || 'Player 2';

  const infoData = match.roundResults || [];
  let p1Score = 0;
  let p2Score = 0;

  for (const winner of infoData) {
    if (winner === p1Name) p1Score++;
    if (winner === p2Name) p2Score++;
  }

  let rows = '';
  for (let i = 0; i < MATCH_ROUNDS; i++) {
    const winner = infoData[i] || null;
    const winnerText = !winner ? 'TIE' : winner;
    rows += '<tr><td>' + (i + 1) + '</td><td>' + winnerText + '</td></tr>';
  }

  const finalWinner = p1Score > p2Score ? p1Name : (p2Score > p1Score ? p2Name : 'DRAW');

  resultsContent.innerHTML =
    '<div class="score-display">' +
    '<div class="player-score"><span class="score-name">' + p1Name + '</span><span class="score-num">' + p1Score + '</span></div>' +
    '<div class="score-divider">VS</div>' +
    '<div class="player-score"><span class="score-name">' + p2Name + '</span><span class="score-num">' + p2Score + '</span></div>' +
    '</div>' +
    '<div class="winner-announcement">' + (finalWinner === 'DRAW' ? 'DRAW!' : 'WINNER: ' + finalWinner + '!') + '</div>' +
    '<table><thead><tr><th>Round</th><th>Winner</th></tr></thead><tbody>' + rows + '</tbody></table>';
}

playAgainBtn.addEventListener('click', () => {
  socket.emit('game:replay', {
    gameMatchId: matchId,
    playerUsername: username,
  });
});

function leaveMatch() {
  socket.emit('game:leave', {
    gameMatchId: matchId,
    playerUsername: username,
  });
  window.location.href = '/';
}

leaveMatchBtn.addEventListener('click', leaveMatch);
leaveMatchBtnTop.addEventListener('click', leaveMatch);

renderPlayers();
updateWaitingState();
