const socket = io('/game');
let currentUsername = Session.get();

const registerForm = document.getElementById('register-form');
const registerMessage = document.getElementById('register-message');
const lobbySection = document.getElementById('lobby-section');
const registerSection = document.getElementById('register-section');
const displayUsername = document.getElementById('display-username');
const createMatchBtn = document.getElementById('create-match-btn');
const logoutBtn = document.getElementById('logout-btn');
const joinMatchBtn = document.getElementById('join-match-btn');
const matchIdInput = document.getElementById('match-id-input');
const lobbyMessage = document.getElementById('lobby-message');

if (currentUsername) {
  displayUsername.textContent = currentUsername;
  registerSection.classList.add('hidden');
  lobbySection.classList.remove('hidden');
}

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username-input').value.trim();

  if (!username) {
    showRegisterMessage('Username is required', 'error');
    return;
  }

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message);
    }

    currentUsername = username;
    Session.save(username);
    displayUsername.textContent = username;
    registerSection.classList.add('hidden');
    lobbySection.classList.remove('hidden');
    showRegisterMessage('Registration successful!', 'success');
  } catch (error) {
    showRegisterMessage(error.message, 'error');
  }
});

function showRegisterMessage(message, type) {
  registerMessage.textContent = message;
  registerMessage.className = 'message ' + type;
  setTimeout(() => {
    registerMessage.textContent = '';
    registerMessage.className = 'message';
  }, 3000);
}

function showLobbyMessage(message, type) {
  lobbyMessage.textContent = message;
  lobbyMessage.className = 'message ' + type;
  setTimeout(() => {
    lobbyMessage.textContent = '';
    lobbyMessage.className = 'message';
  }, 3000);
}

createMatchBtn.addEventListener('click', () => {
  if (!currentUsername) {
    showLobbyMessage('You must register first', 'error');
    return;
  }

  socket.emit(
    'game:create-match-room',
    { playerUsername: currentUsername },
    (response) => {
      if (response.status === 'error') {
        showLobbyMessage(response.data.message, 'error');
      } else {
        const matchId = response.data.gameMatch.id;
        MatchStorage.createMatch(matchId, currentUsername);
        window.location.href =
          '/game?matchId=' + matchId + '&username=' + currentUsername;
      }
    },
  );
});

joinMatchBtn.addEventListener('click', () => {
  const matchId = matchIdInput.value.trim();

  if (!matchId) {
    showLobbyMessage('Match ID is required', 'error');
    return;
  }

  if (!currentUsername) {
    showLobbyMessage('You must register first', 'error');
    return;
  }

  MatchStorage.createMatch(matchId, null);
  socket.emit(
    'game:join-match-room',
    {
      gameMatchId: matchId,
      playerUsername: currentUsername,
    },
    (response) => {
      if (response.status == 'ok') {
        window.location.href =
          '/game?matchId=' + matchId + '&username=' + currentUsername;
      }
    },
  );
});

socket.on('game:room-match-notifications', (data) => {
  if (data.status === 'error') {
    showLobbyMessage(data.data.message, 'error');
  }
});

socket.on('game:room-info-updated', (data) => {
  const params = new URLSearchParams(window.location.search);
  const matchId = params.get('matchId');

  if (matchId && data.data) {
    MatchStorage.syncFromServer(matchId, data.data);
    const players = MatchStorage.getPlayers(matchId);
    if (players.length >= 2 && currentUsername) {
      window.location.href = '/game?matchId=' + matchId + '&username=' + currentUsername;
    }
  }
});

logoutBtn.addEventListener('click', () => {
  Session.clear();
  window.location.reload();
});
