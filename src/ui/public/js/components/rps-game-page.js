const gameTemplate = document.createElement('template');
gameTemplate.innerHTML = `
  <style>
    * { box-sizing: border-box; }
    :host { display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 0; font-family: 'Rajdhani', sans-serif; overflow-y: auto; }
    .hidden { display: none !important; }
    .game-info { display: flex; flex-wrap: wrap; gap: 0.4rem 1rem; padding: 0.7rem 1rem; background: rgba(0,0,0,0.5); border-bottom: 1px solid var(--border-color); font-size: 0.75rem; font-weight: 700; font-family: 'Orbitron', sans-serif; flex-shrink: 0; }
    .game-info .label { color: var(--text-muted); letter-spacing: 1px; }
    .game-info .value { color: var(--accent); text-shadow: 0 0 8px var(--accent-glow); }
    .game-info .id-val { font-size: 0.6rem; opacity: 0.75; word-break: break-all; }
    .players-list { display: inline-flex; gap: 0.4rem; flex-wrap: wrap; }
    .player-tag { padding: 0.1rem 0.4rem; border: 1px solid var(--accent); background: rgba(0,240,255,0.08); color: var(--accent); font-size: 0.65rem; font-weight: 900; letter-spacing: 1px; }
    .player-tag.master { border-color: var(--yellow); color: var(--yellow); background: rgba(255,234,0,0.08); }
    .round-notif { padding: 0.5rem 1rem; text-align: center; font-size: 0.9rem; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; font-family: 'Orbitron', sans-serif; animation: fadeIn 0.3s ease forwards; flex-shrink: 0; }
    .round-notif.win  { background: rgba(57,255,20,0.15); color: var(--green); border-bottom: 2px solid var(--green); }
    .round-notif.lose { background: rgba(255,7,58,0.15); color: var(--red); border-bottom: 2px solid var(--red); }
    .round-notif.tie  { background: rgba(255,234,0,0.15); color: var(--yellow); border-bottom: 2px solid var(--yellow); }
    @keyframes fadeIn { from{opacity:0;transform:translateY(-4px);}to{opacity:1;transform:none;} }
    .game-content { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 1.5rem 1rem; gap: 1rem; min-height: 0; }
    #waiting-section { text-align: center; }
    #waiting-text { font-size: 1rem; font-weight: 900; font-family: 'Orbitron', sans-serif; color: var(--accent); text-transform: uppercase; letter-spacing: 3px; animation: pulse 1.5s ease-in-out infinite; text-shadow: 0 0 15px var(--accent-glow); }
    @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }
    .spinner { width: 40px; height: 40px; margin: 1rem auto 0; border: 3px solid rgba(0,240,255,0.2); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.9s linear infinite; }
    @keyframes spin { to{transform:rotate(360deg);} }
    .choices { display: flex; flex-wrap: wrap; gap: 1.2rem; justify-content: center; align-items: center; }
    .hex-btn { position: relative; width: 110px; height: 126px; background: none; border: none; padding: 0; cursor: pointer; transition: transform 0.18s cubic-bezier(0.16,1,0.3,1), filter 0.18s; }
    .hex-btn:disabled { opacity: 0.3; cursor: not-allowed; transform: none !important; filter: none !important; }
    .hex-btn:not(:disabled):hover { transform: translateY(-5px) scale(1.07); }
    .hex-btn:not(:disabled):active { transform: scale(0.93); }
    .hex-bg { width: 100%; height: 100%; position: absolute; top: 0; left: 0; }
    .hex-inner { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem; }
    .hex-icon { width: 38px; height: 38px; }
    .hex-label { font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; }
    .hex-btn[data-choice="0"] .hex-label { color: var(--red); }
    .hex-btn[data-choice="0"]:not(:disabled):hover { filter: drop-shadow(0 0 14px rgba(255,7,58,0.8)); }
    .hex-btn[data-choice="1"] .hex-label { color: var(--yellow); }
    .hex-btn[data-choice="1"]:not(:disabled):hover { filter: drop-shadow(0 0 14px rgba(255,234,0,0.8)); }
    .hex-btn[data-choice="2"] .hex-label { color: var(--green); }
    .hex-btn[data-choice="2"]:not(:disabled):hover { filter: drop-shadow(0 0 14px rgba(57,255,20,0.8)); }
    #game-message { font-size: 0.8rem; font-weight: 700; font-family: 'Orbitron', sans-serif; color: var(--text-muted); text-transform: uppercase; letter-spacing: 2px; text-align: center; }
    #results-section { width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 0.8rem; }
    #results-section h2 { font-size: 1.1rem; font-weight: 900; color: var(--accent); font-family: 'Orbitron', sans-serif; text-align: center; }
    #results-content { background: rgba(0,0,0,0.55); padding: 0.9rem 1rem; border: 1px solid var(--border-color); border-left: 3px solid var(--accent); }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 0.4rem 0.6rem; border-bottom: 1px solid rgba(0,240,255,0.12); text-align: center; font-size: 0.85rem; font-weight: 700; font-family: 'Rajdhani', sans-serif; }
    th { background: rgba(0,240,255,0.08); color: var(--accent); text-transform: uppercase; font-family: 'Orbitron', sans-serif; font-size: 0.7rem; }
    tr:last-child td { border-bottom: none; }
    .score-display { display: flex; justify-content: center; align-items: center; gap: 2rem; margin-bottom: 0.8rem; }
    .player-score { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; }
    .score-name { font-size: 0.75rem; font-family: 'Orbitron', sans-serif; color: var(--text-muted); font-weight: 900; text-transform: uppercase; }
    .score-num { font-size: 2.2rem; font-family: 'Orbitron', sans-serif; font-weight: 900; color: var(--accent); }
    .score-divider { font-size: 1rem; color: var(--text-muted); font-family: 'Orbitron', sans-serif; font-weight: 900; }
    .winner-ann { text-align: center; font-size: 0.85rem; font-weight: 900; color: #000; padding: 0.6rem; border: 2px solid var(--green); background: var(--green); text-transform: uppercase; letter-spacing: 3px; font-family: 'Orbitron', sans-serif; }
    button.action-btn { padding: 0.7rem 1rem; border: 1px solid; background: rgba(0,0,0,0.5); font-family: 'Orbitron', sans-serif; font-size: 0.75rem; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; cursor: pointer; transition: all 0.2s; width: 100%; clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px); }
    button.action-btn:active { transform: scale(0.96); }
    #play-again-btn { border-color: var(--green); color: var(--green); }
    #play-again-btn:hover { background: var(--green); color: #000; }
    #leave-btn-inline { border-color: var(--red); color: var(--red); }
    #leave-btn-inline:hover { background: var(--red); color: #000; }
  </style>
  <div class="game-info">
    <span><span class="label">ID: </span><span class="value id-val" id="match-id-display"></span></span>
    <span><span class="label">PLAYERS: </span><span class="value"><span id="players-list-display" class="players-list"></span></span></span>
    <span><span class="label">RONDAS: </span><span class="value"><span id="local-round">0</span>/3</span></span>
  </div>
  <div id="round-notif" class="round-notif hidden"><span id="round-text"></span></div>
  <div class="game-content">
    <div id="waiting-section">
      <div id="waiting-text">ESPERANDO OPONENTE...</div>
      <div class="spinner"></div>
    </div>
    <div id="game-section" class="hidden">
      <div class="choices" id="choices">
        <button class="hex-btn" data-choice="0" aria-label="Rock">
          <svg class="hex-bg" viewBox="0 0 110 126" xmlns="http://www.w3.org/2000/svg">
            <polygon points="55,4 106,31 106,95 55,122 4,95 4,31" fill="rgba(255,7,58,0.08)" stroke="#ff073a" stroke-width="2"/>
          </svg>
          <div class="hex-inner">
            <svg class="hex-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 44 C20 44 16 40 16 32 C16 28 18 24 22 22 L22 16 C22 14 24 12 26 12 C28 12 30 14 30 16 L30 28 C32 27 36 28 36 32 L36 28 C36 26 38 24 40 24 C42 24 44 26 44 28 L44 32 C44 30 46 28 48 28 C50 28 52 30 52 32 L52 40 C52 48 46 54 38 54 L30 54 C26 54 22 51 20 44Z" fill="none" stroke="#ff073a" stroke-width="2.5" stroke-linejoin="round"/>
            </svg>
            <span class="hex-label">ROCK</span>
          </div>
        </button>
        <button class="hex-btn" data-choice="1" aria-label="Paper">
          <svg class="hex-bg" viewBox="0 0 110 126" xmlns="http://www.w3.org/2000/svg">
            <polygon points="55,4 106,31 106,95 55,122 4,95 4,31" fill="rgba(255,234,0,0.06)" stroke="#ffea00" stroke-width="2"/>
          </svg>
          <div class="hex-inner">
            <svg class="hex-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="14" y="12" width="34" height="42" rx="3" stroke="#ffea00" stroke-width="2.5"/>
              <line x1="21" y1="22" x2="43" y2="22" stroke="#ffea00" stroke-width="2"/>
              <line x1="21" y1="30" x2="43" y2="30" stroke="#ffea00" stroke-width="2"/>
              <line x1="21" y1="38" x2="33" y2="38" stroke="#ffea00" stroke-width="2"/>
            </svg>
            <span class="hex-label">PAPER</span>
          </div>
        </button>
        <button class="hex-btn" data-choice="2" aria-label="Scissors">
          <svg class="hex-bg" viewBox="0 0 110 126" xmlns="http://www.w3.org/2000/svg">
            <polygon points="55,4 106,31 106,95 55,122 4,95 4,31" fill="rgba(57,255,20,0.06)" stroke="#39ff14" stroke-width="2"/>
          </svg>
          <div class="hex-inner">
            <svg class="hex-icon" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="48" r="9" stroke="#39ff14" stroke-width="2.5"/>
              <circle cx="44" cy="48" r="9" stroke="#39ff14" stroke-width="2.5"/>
              <line x1="20" y1="39" x2="32" y2="18" stroke="#39ff14" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="44" y1="39" x2="32" y2="18" stroke="#39ff14" stroke-width="2.5" stroke-linecap="round"/>
              <line x1="32" y1="18" x2="32" y2="10" stroke="#39ff14" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
            <span class="hex-label">SCISSORS</span>
          </div>
        </button>
      </div>
      <p id="game-message"></p>
    </div>
    <div id="results-section" class="hidden">
      <h2>RESULTADO FINAL</h2>
      <div id="results-content"></div>
      <button id="play-again-btn" class="action-btn">JUGAR DE NUEVO</button>
      <button id="leave-btn-inline" class="action-btn" style="margin-top:0.5rem;">SALIR</button>
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
    if (!this._matchId || !this._username) { window.location.href = '/'; return; }
    MatchStorage.createMatch(this._matchId, this._username);
    this.shadowRoot.getElementById('match-id-display').textContent = this._matchId;
    const app = this.closest('rps-app');
    this._gameSocket = app?.sockets?.game;
    const hdrId = document.getElementById('match-id');
    if (hdrId) hdrId.textContent = this._matchId;
    const sidebar = document.getElementById('match-chat');
    if (sidebar) { sidebar.setAttribute('match-id', this._matchId); sidebar.setAttribute('username', this._username); sidebar.classList.remove('hidden'); }
    this._setupSocket();
    this._setupChoices();
    this._setupButtons();
    this._renderPlayers();
    this._updateWaiting();
  }

  _setupSocket() {
    if (!this._gameSocket) return;
    const onConnect = () => {
      this._gameSocket.emit('game:join-match-room', { gameMatchId: this._matchId, playerUsername: this._username });
      this._renderPlayers();
      this._updateWaiting();
    };
    if (this._gameSocket.connected) onConnect();
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
      const roundEl = this.shadowRoot.getElementById('local-round');
      if (roundEl) roundEl.textContent = String(this._localRound);
    }
    if (match.roundsPlayed < prevPlayed) {
      this._localRound = 0;
      this._hasChosen = false;
      this._opponentChosen = false;
      this._prevRoundsPlayed = 0;
      const roundEl = this.shadowRoot.getElementById('local-round');
      if (roundEl) roundEl.textContent = '0';
      this.shadowRoot.getElementById('results-section').classList.add('hidden');
      this.shadowRoot.getElementById('game-section').classList.remove('hidden');
      this._enableChoices(true);
      this._setMsg('Elige tu movimiento!');
      return;
    }
    if (match.roundsPlayed >= this._MATCH_ROUNDS) {
      setTimeout(() => this._showResults(), 2500);
    } else {
      setTimeout(() => { if (!this._hasChosen) { this._enableChoices(true); this._setMsg('Elige tu movimiento!'); } }, 2000);
    }
  }

  _onNotification(data) {
    if (data.status === 'player-choose') {
      if (data.data.user === this._username) { this._hasChosen = true; this._enableChoices(false); this._setMsg('Esperando al oponente...'); }
      else { this._opponentChosen = true; this._setMsg(this._hasChosen ? 'Ambos eligieron!' : 'Oponente ya eligio. Tu turno!'); }
    } else if (data.status === 'round-ended') { this._setMsg('Ronda terminada!'); }
  }

  _handleRoundUpdate(newPlayed, results) {
    for (let i = this._prevRoundsPlayed; i < newPlayed; i++) {
      const winner = results[i] || null;
      const n = i + 1;
      if (winner === null) this._showNotif('RONDA ' + n + ': EMPATE!', 'tie');
      else if (winner === this._username) this._showNotif('RONDA ' + n + ': GANASTE!', 'win');
      else this._showNotif('RONDA ' + n + ': ' + winner + ' GANA!', 'lose');
    }
    this._prevRoundsPlayed = newPlayed;
  }

  _showNotif(text, type) {
    const el = this.shadowRoot.getElementById('round-notif');
    this.shadowRoot.getElementById('round-text').textContent = text;
    el.className = 'round-notif ' + type;
    setTimeout(() => { el.className = 'round-notif hidden'; }, 2000);
  }

  _setMsg(text) { this.shadowRoot.getElementById('game-message').textContent = text; }

  _enableChoices(enabled) {
    this.shadowRoot.querySelectorAll('.hex-btn').forEach((b) => { b.disabled = !enabled; });
  }

  _setupChoices() {
    this.shadowRoot.querySelectorAll('.hex-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this._hasChosen || !this._gameSocket) return;
        const choice = parseInt(btn.dataset.choice);
        this._gameSocket.emit('game:choose-move', { matchId: this._matchId, username: this._username, moveChoise: choice });
        this._hasChosen = true;
        this._enableChoices(false);
        this._setMsg('Esperando al oponente...');
      });
    });
  }

  _setupButtons() {
    this.shadowRoot.getElementById('play-again-btn').addEventListener('click', () => {
      this._gameSocket?.emit('game:replay', { gameMatchId: this._matchId, playerUsername: this._username });
    });
    const leave = () => {
      this._gameSocket?.emit('game:leave', { gameMatchId: this._matchId, playerUsername: this._username });
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
    if (playing && count >= 2) { waiting.classList.add('hidden'); game.classList.remove('hidden'); this._enableChoices(true); }
    else { game.classList.add('hidden'); waiting.classList.remove('hidden'); this._enableChoices(false); }
  }

  _showResults() {
    const match = MatchStorage.getMatch(this._matchId);
    if (!match || match.roundsPlayed < this._MATCH_ROUNDS) {
      setTimeout(() => { if (MatchStorage.getMatch(this._matchId)?.roundsPlayed >= this._MATCH_ROUNDS) this._showResults(); }, 300);
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
      rows += '<tr><td>' + (i + 1) + '</td><td>' + (!w ? 'EMPATE' : w) + '</td></tr>';
    }
    const champ = s1 > s2 ? p1 : (s2 > s1 ? p2 : 'DRAW');
    this.shadowRoot.getElementById('results-content').innerHTML =
      '<div class="score-display"><div class="player-score"><span class="score-name">' + p1 + '</span><span class="score-num">' + s1 + '</span></div>'
      + '<div class="score-divider">VS</div>'
      + '<div class="player-score"><span class="score-name">' + p2 + '</span><span class="score-num">' + s2 + '</span></div></div>'
      + '<div class="winner-ann">' + (champ === 'DRAW' ? 'EMPATE!' : 'GANADOR: ' + champ + '!') + '</div>'
      + '<table><thead><tr><th>Ronda</th><th>Ganador</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }
}

customElements.define('rps-game-page', RpsGamePage);
