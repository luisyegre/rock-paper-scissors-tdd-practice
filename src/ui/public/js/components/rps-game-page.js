const gameTemplate = document.createElement('template');
gameTemplate.innerHTML = `
  <style>
    .panel {
      background: rgba(10, 10, 15, 0.9);
      border: 2px solid var(--border-color);
      padding: 2.5rem;
      width: 100%;
      max-width: 620px;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.2), inset 0 0 20px rgba(0, 240, 255, 0.05);
      position: relative;
      clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
      animation: floatIn 0.8s forwards;
      opacity: 0;
      transform: translateY(20px);
    }
    .panel::before {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 100%; height: 4px;
      background: var(--accent);
      box-shadow: 0 0 10px var(--accent-glow);
    }
    @keyframes floatIn { to { opacity: 1; transform: translateY(0); } }
    .game-info {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 1.5rem;
      padding: 1rem 1.2rem;
      background: rgba(0, 0, 0, 0.6);
      border: 2px solid var(--border-color);
      align-items: center;
      font-size: 0.85rem;
      font-weight: 700;
      clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    }
    .game-info .label { color: var(--text-muted); font-family: 'Orbitron', sans-serif; letter-spacing: 1px; }
    .game-info .value { color: var(--accent); font-weight: 900; font-family: 'Orbitron', sans-serif; text-shadow: 0 0 8px var(--accent-glow); }
    .players-list { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .player-tag {
      display: inline-block;
      padding: 0.3rem 0.6rem;
      border: 2px solid var(--accent);
      background: rgba(0, 240, 255, 0.1);
      color: var(--accent);
      font-size: 0.8rem;
      font-weight: 900;
      font-family: 'Orbitron', sans-serif;
      text-transform: uppercase;
      letter-spacing: 1px;
      clip-path: polygon(5px 0, 100% 0, 100% calc(100% - 5px), calc(100% - 5px) 100%, 0 100%, 0 5px);
    }
    .player-tag.master { 
      border-color: var(--yellow); 
      color: var(--yellow); 
      background: rgba(255, 234, 0, 0.1); 
    }

    .round-notif {
      padding: 0.8rem;
      border: 2px solid;
      text-align: center;
      font-size: 1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 1.5rem;
      animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: 'Orbitron', sans-serif;
      clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    }
    .round-notif.win { background: var(--green-glow); border-color: var(--green); color: #fff; text-shadow: 0 0 10px var(--green); }
    .round-notif.lose { background: var(--red-glow); border-color: var(--red); color: #fff; text-shadow: 0 0 10px var(--red); }
    .round-notif.tie { background: var(--yellow-glow); border-color: var(--yellow); color: #fff; text-shadow: 0 0 10px var(--yellow); }
    .round-notif.hidden { display: none; }
    @keyframes fadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

    .game-content { text-align: center; }
    .game-content h2 { font-size: 1.5rem; color: var(--text-primary); margin-bottom: 1.5rem; text-transform: uppercase; letter-spacing: 2px; font-weight: 900; font-family: 'Orbitron', sans-serif; text-shadow: 0 0 10px var(--accent-glow); }
    .hidden { display: none !important; }

    #waiting-section { text-align: center; padding: 3rem 0; }
    #waiting-text {
      font-size: 1.5rem;
      font-weight: 900;
      font-family: 'Orbitron', sans-serif;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 3px;
      animation: pulse 1.5s ease-in-out infinite;
      text-shadow: 0 0 15px var(--accent-glow);
    }
    @keyframes pulse { 0%,100% { opacity: 1; text-shadow: 0 0 20px var(--accent-glow); } 50% { opacity: 0.5; text-shadow: 0 0 5px var(--accent-glow); } }
    .spinner {
      width: 48px; height: 48px;
      margin: 1.5rem auto 0;
      border: 4px solid var(--border-color);
      border-top-color: var(--accent);
      animation: spin 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
      clip-path: polygon(25% 0, 75% 0, 100% 25%, 100% 75%, 75% 100%, 25% 100%, 0 75%, 0 25%);
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .choices { display: flex; gap: 1.5rem; justify-content: center; margin: 2rem 0; flex-wrap: wrap; }
    .choice-btn {
      padding: 1.5rem 1rem;
      font-size: 1.2rem;
      font-weight: 900;
      min-width: 140px;
      flex: 1;
      text-transform: uppercase;
      letter-spacing: 3px;
      background: rgba(0, 0, 0, 0.5);
      font-family: 'Orbitron', sans-serif;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      border: 3px solid;
      clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);
      position: relative;
    }
    .choice-btn:active { transform: scale(0.94); }
    .choice-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; box-shadow: none !important; }
    
    .choice-btn:nth-child(1) { border-color: var(--red); color: var(--red); }
    .choice-btn:nth-child(1):hover:not(:disabled) { background: var(--red); color: #000; box-shadow: 0 0 30px var(--red-glow); }
    
    .choice-btn:nth-child(2) { border-color: var(--yellow); color: var(--yellow); }
    .choice-btn:nth-child(2):hover:not(:disabled) { background: var(--yellow); color: #000; box-shadow: 0 0 30px var(--yellow-glow); }

    .choice-btn:nth-child(3) { border-color: var(--green); color: var(--green); }
    .choice-btn:nth-child(3):hover:not(:disabled) { background: var(--green); color: #000; box-shadow: 0 0 30px var(--green-glow); }

    #game-message { font-size: 1rem; font-weight: 700; font-family: 'Orbitron', sans-serif; color: var(--text-secondary); margin-top: 1.5rem; text-transform: uppercase; letter-spacing: 2px; }

    #results-section h2 { font-size: 1.5rem; font-weight: 900; color: var(--accent); margin-bottom: 1.5rem; text-shadow: 0 0 15px var(--accent-glow); font-family: 'Orbitron', sans-serif; }
    #results-content { background: rgba(0, 0, 0, 0.6); padding: 1.5rem; border: 2px solid var(--border-color); margin: 1.5rem 0; clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px); }
    table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 1rem; }
    th, td { padding: 0.7rem 0.8rem; border-bottom: 2px solid rgba(0, 240, 255, 0.2); text-align: center; font-size: 1rem; font-weight: 700; font-family: 'Rajdhani', sans-serif; }
    th { background: rgba(0, 240, 255, 0.1); color: var(--accent); text-transform: uppercase; letter-spacing: 1.5px; font-family: 'Orbitron', sans-serif; }
    tr:last-child td { border-bottom: none; }
    .score-display { display: flex; justify-content: center; align-items: center; gap: 3rem; margin: 1rem 0; }
    .player-score { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .score-name { font-size: 1rem; font-family: 'Orbitron', sans-serif; color: var(--text-secondary); font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
    .score-num { font-size: 3rem; font-family: 'Orbitron', sans-serif; font-weight: 900; color: var(--accent); text-shadow: 0 0 20px var(--accent-glow); }
    .score-divider { font-size: 1.5rem; color: var(--text-muted); font-family: 'Orbitron', sans-serif; font-weight: 900; }
    .winner-ann {
      text-align: center;
      font-size: 1.5rem;
      font-weight: 900;
      color: #000;
      padding: 1rem;
      margin: 1.5rem 0;
      border: 2px solid var(--green);
      background: var(--green);
      text-transform: uppercase;
      letter-spacing: 3px;
      animation: pulseWin 1.5s ease-in-out infinite;
      box-shadow: 0 0 20px var(--green-glow);
      font-family: 'Orbitron', sans-serif;
      clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);
    }
    @keyframes pulseWin { 0%,100% { box-shadow: 0 0 20px var(--green-glow); transform: scale(1); } 50% { box-shadow: 0 0 40px var(--green-glow); transform: scale(1.02); } }
    
    button.action-btn {
      padding: 1rem 1.5rem;
      border: 2px solid;
      background: rgba(0, 0, 0, 0.5);
      font-family: 'Orbitron', sans-serif;
      font-size: 1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
      clip-path: polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px);
    }
    button.action-btn:active { transform: scale(0.96); }
    
    #play-again-btn { border-color: var(--green); color: var(--green); margin-top: 1rem; }
    #play-again-btn:hover { background: var(--green); color: #000; box-shadow: 0 0 25px var(--green-glow); }
    
    #leave-btn-inline { border-color: var(--red); color: var(--red); margin-top: 0.75rem; }
    #leave-btn-inline:hover { background: var(--red); color: #000; box-shadow: 0 0 25px var(--red-glow); }
  </style>
  <div class="panel">
    <div class="game-info">
      <span><span class="label">ID:</span> <span class="value" id="match-id-display"></span></span>
      <span><span class="label">PLAYERS:</span> <span class="value"><span id="players-list-display" class="players-list"></span></span></span>
    </div>

    <div id="round-notif" class="round-notif hidden"><span id="round-text"></span></div>

    <div class="game-content">
      <div id="waiting-section">
        <div id="waiting-text">WAITING FOR OPPONENT...</div>
        <div class="spinner"></div>
      </div>

      <div id="game-section" class="hidden">
        <h2>CHOOSE YOUR MOVE!</h2>
        <div class="choices" id="choices">
          <button class="choice-btn" data-choice="0">ROCK</button>
          <button class="choice-btn" data-choice="1">PAPER</button>
          <button class="choice-btn" data-choice="2">SCISSORS</button>
        </div>
        <p id="game-message"></p>
      </div>

      <div id="results-section" class="hidden">
        <h2>MATCH RESULTS</h2>
        <div id="results-content"></div>
        <button id="play-again-btn" class="action-btn">PLAY AGAIN</button>
        <button id="leave-btn-inline" class="action-btn">LEAVE</button>
      </div>
    </div>
  </div>
`;

class RpsGamePage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(gameTemplate.content.cloneNode(true));
    this._localRound = 0;
    this._hasChosen = false;
    this._opponentChosen = false;
    this._prevRoundsPlayed = 0;
    this._matchId = null;
    this._username = null;
    this._gameSocket = null;
    this._MATCH_ROUNDS = 3;
  }

  connectedCallback() {
    const params = new URLSearchParams(window.location.search);
    this._matchId = params.get('matchId');
    this._username = params.get('username');

    if (!this._matchId || !this._username) {
      window.location.href = '/';
      return;
    }

    MatchStorage.createMatch(this._matchId, this._username);
    this.shadowRoot.getElementById('match-id-display').textContent = this._matchId;

    const app = this.closest('rps-app');
    this._gameSocket = app?.sockets?.game;

    const hdrId = document.getElementById('match-id');
    if (hdrId) hdrId.textContent = this._matchId;

    const sidebar = document.getElementById('match-chat');
    if (sidebar) {
      sidebar.setAttribute('match-id', this._matchId);
      sidebar.setAttribute('username', this._username);
      sidebar.classList.remove('hidden');
    }

    this._setupSocket();
    this._setupChoices();
    this._setupButtons();
    this._renderPlayers();
    this._updateWaiting();
  }

  _setupSocket() {
    if (!this._gameSocket) return;

    const onConnect = () => {
      this._gameSocket.emit('game:join-match-room', {
        gameMatchId: this._matchId,
        playerUsername: this._username,
      });
      this._renderPlayers();
      this._updateWaiting();
    };

    if (this._gameSocket.connected) {
      onConnect();
    }
    this._gameSocket.on('connect', onConnect);

    this._gameSocket.on('game:room-info-updated', (data) => this._onInfoUpdated(data));
    this._gameSocket.on('game:room-match-notifications', (data) => this._onNotification(data));
  }

  _onInfoUpdated(data) {
    if (!data.data) return;
    const matchBefore = MatchStorage.getMatch(this._matchId);
    const prevPlayed = matchBefore ? matchBefore.roundsPlayed : 0;

    MatchStorage.syncFromServer(this._matchId, data.data);
    this._renderPlayers();
    this._updateWaiting();

    const match = MatchStorage.getMatch(this._matchId);
    if (!match) return;

    const results = data.data.rounds?.results || [];

    if (match.roundsPlayed > prevPlayed) {
      this._handleRoundUpdate(match.roundsPlayed, results);
      this._hasChosen = false;
      this._opponentChosen = false;
      this._localRound = match.roundsPlayed;
      const roundEl = document.getElementById('current-round');
      if (roundEl) roundEl.textContent = String(this._localRound);
    }

    if (match.roundsPlayed < prevPlayed) {
      this._localRound = 0;
      this._hasChosen = false;
      this._opponentChosen = false;
      this._prevRoundsPlayed = 0;
      const roundEl = document.getElementById('current-round');
      if (roundEl) roundEl.textContent = '0';
      this.shadowRoot.getElementById('results-section').classList.add('hidden');
      this.shadowRoot.getElementById('game-section').classList.remove('hidden');
      this._enableChoices(true);
      this._setMsg('Choose your move!');
      return;
    }

    if (match.roundsPlayed >= this._MATCH_ROUNDS) {
      setTimeout(() => this._showResults(), 2500);
    } else {
      setTimeout(() => {
        if (!this._hasChosen) {
          this._enableChoices(true);
          this._setMsg('Choose your move!');
        }
      }, 2000);
    }
  }

  _onNotification(data) {
    if (data.status === 'player-choose') {
      if (data.data.user === this._username) {
        this._hasChosen = true;
        this._enableChoices(false);
        this._setMsg('Waiting for opponent...');
      } else {
        this._opponentChosen = true;
        this._setMsg(this._hasChosen ? 'Both chose!' : 'Opponent has chosen. Your turn!');
      }
    } else if (data.status === 'round-ended') {
      this._setMsg('Round ended!');
    }
  }

  _handleRoundUpdate(newPlayed, results) {
    for (let i = this._prevRoundsPlayed; i < newPlayed; i++) {
      const winner = results[i] || null;
      const n = i + 1;
      if (winner === null) this._showNotif('ROUND ' + n + ': TIE!', 'tie');
      else if (winner === this._username) this._showNotif('ROUND ' + n + ': YOU WIN!', 'win');
      else this._showNotif('ROUND ' + n + ': ' + winner + ' WINS!', 'lose');
    }
    this._prevRoundsPlayed = newPlayed;
  }

  _showNotif(text, type) {
    const el = this.shadowRoot.getElementById('round-notif');
    this.shadowRoot.getElementById('round-text').textContent = text;
    el.className = 'round-notif ' + type;
    setTimeout(() => { el.className = 'round-notif hidden'; }, 2000);
  }

  _setMsg(text) {
    this.shadowRoot.getElementById('game-message').textContent = text;
  }

  _enableChoices(enabled) {
    this.shadowRoot.querySelectorAll('.choice-btn').forEach((b) => {
      b.disabled = !enabled;
    });
  }

  _setupChoices() {
    this.shadowRoot.querySelectorAll('.choice-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this._hasChosen || !this._gameSocket) return;
        const choice = parseInt(btn.dataset.choice);
        this._gameSocket.emit('game:choose-move', {
          matchId: this._matchId,
          username: this._username,
          moveChoise: choice,
        });
        this._hasChosen = true;
        this._enableChoices(false);
        this._setMsg('Waiting for opponent...');
      });
    });
  }

  _setupButtons() {
    this.shadowRoot.getElementById('play-again-btn').addEventListener('click', () => {
      this._gameSocket?.emit('game:replay', {
        gameMatchId: this._matchId,
        playerUsername: this._username,
      });
    });

    const leave = () => {
      this._gameSocket?.emit('game:leave', {
        gameMatchId: this._matchId,
        playerUsername: this._username,
      });
      window.location.href = '/';
    };

    this.shadowRoot.getElementById('leave-btn-inline').addEventListener('click', leave);
    document.getElementById('leave-match-btn-top')?.addEventListener('click', leave);
  }

  _renderPlayers() {
    const info = MatchStorage.getPlayersInfo(this._matchId);
    const container = this.shadowRoot.getElementById('players-list-display');
    container.innerHTML = '';
    info.forEach((p) => {
      const span = document.createElement('span');
      span.className = 'player-tag' + (p.isMaster ? ' master' : '');
      span.textContent = p.username + (p.isMaster ? ' [M]' : '');
      container.appendChild(span);
    });
  }

  _updateWaiting() {
    const playing = MatchStorage.isPlaying(this._matchId);
    const count = MatchStorage.getPlayerCount(this._matchId);
    const waiting = this.shadowRoot.getElementById('waiting-section');
    const game = this.shadowRoot.getElementById('game-section');

    if (playing && count >= 2) {
      waiting.classList.add('hidden');
      game.classList.remove('hidden');
      this._enableChoices(true);
    } else {
      game.classList.add('hidden');
      waiting.classList.remove('hidden');
      this._enableChoices(false);
    }
  }

  _showResults() {
    const match = MatchStorage.getMatch(this._matchId);
    if (!match || match.roundsPlayed < this._MATCH_ROUNDS) {
      setTimeout(() => {
        if (MatchStorage.getMatch(this._matchId)?.roundsPlayed >= this._MATCH_ROUNDS) this._showResults();
      }, 300);
      return;
    }

    this.shadowRoot.getElementById('game-section').classList.add('hidden');
    this.shadowRoot.getElementById('results-section').classList.remove('hidden');
    this.shadowRoot.getElementById('round-notif').classList.add('hidden');

    const info = MatchStorage.getPlayersInfo(this._matchId);
    const p1 = info[0]?.username || 'Player 1';
    const p2 = info[1]?.username || 'Player 2';
    const data = match.roundResults || [];
    let s1 = 0, s2 = 0;
    data.forEach((w) => { if (w === p1) s1++; if (w === p2) s2++; });

    let rows = '';
    for (let i = 0; i < this._MATCH_ROUNDS; i++) {
      const w = data[i] || null;
      rows += '<tr><td>' + (i + 1) + '</td><td>' + (!w ? 'TIE' : w) + '</td></tr>';
    }
    const champ = s1 > s2 ? p1 : (s2 > s1 ? p2 : 'DRAW');

    this.shadowRoot.getElementById('results-content').innerHTML =
      '<div class="score-display">'
      + '<div class="player-score"><span class="score-name">' + p1 + '</span><span class="score-num">' + s1 + '</span></div>'
      + '<div class="score-divider">VS</div>'
      + '<div class="player-score"><span class="score-name">' + p2 + '</span><span class="score-num">' + s2 + '</span></div></div>'
      + '<div class="winner-ann">' + (champ === 'DRAW' ? 'DRAW!' : 'WINNER: ' + champ + '!') + '</div>'
      + '<table><thead><tr><th>Round</th><th>Winner</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }
}

customElements.define('rps-game-page', RpsGamePage);
