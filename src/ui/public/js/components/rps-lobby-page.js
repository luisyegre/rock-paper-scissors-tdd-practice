const lobbyTemplate = document.createElement('template');
lobbyTemplate.innerHTML = `
  <style>
    .panel {
      margin-bottom: 1.5rem;
      background: rgba(10, 10, 15, 0.9);
      border: 2px solid var(--border-color);
      padding: 2.5rem;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 0 20px rgba(0, 240, 255, 0.2), inset 0 0 20px rgba(0, 240, 255, 0.05);
      position: relative;
      clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px);
    }
    .panel::before {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 100%; height: 4px;
      background: var(--accent);
      box-shadow: 0 0 10px var(--accent-glow);
    }
    h2 {
      font-size: 1.5rem;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-shadow: 0 0 10px var(--accent-glow);
      font-family: 'Orbitron', sans-serif;
    }
    h3 {
      font-size: 1rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--text-muted);
      margin: 1.5rem 0 0.75rem;
      font-family: 'Orbitron', sans-serif;
    }
    .hidden { display: none !important; }
    #display-username { 
      color: var(--accent); 
      font-weight: 900; 
      text-shadow: 0 0 10px var(--accent-glow);
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    input {
      padding: 1rem;
      background: rgba(0, 0, 0, 0.6);
      border: 2px solid rgba(0, 240, 255, 0.3);
      color: var(--accent);
      font-size: 1rem;
      font-weight: 600;
      outline: none;
      transition: all 0.2s;
      clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    }
    input:focus { 
      border-color: var(--accent); 
      box-shadow: inset 0 0 10px var(--accent-glow);
      background: rgba(0, 240, 255, 0.05);
    }
    input::placeholder { color: rgba(0, 240, 255, 0.4); }
    button {
      padding: 1rem 1.5rem;
      border: 2px solid var(--accent);
      background: rgba(0, 240, 255, 0.1);
      color: var(--accent);
      font-size: 1rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      cursor: pointer;
      transition: all 0.2s;
      clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    }
    button:hover {
      background: var(--accent);
      color: #000;
      box-shadow: 0 0 20px var(--accent-glow);
    }
    button:active { transform: scale(0.96); }
    .btn-green {
      border-color: var(--green);
      color: var(--green);
      background: rgba(57, 255, 20, 0.1);
      width: 100%;
    }
    .btn-green:hover {
      background: var(--green);
      color: #000;
      box-shadow: 0 0 25px var(--green-glow);
    }
    .lobby-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 1.5rem 0;
    }
    #join-section {
      border-top: 2px solid rgba(0, 240, 255, 0.2);
      padding-top: 1.5rem;
      margin-top: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .message {
      margin-top: 1rem;
      padding: 0.8rem;
      border: 2px solid;
      text-align: center;
      font-size: 0.85rem;
      font-weight: 600;
      animation: msgPop 0.3s forwards;
      clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    }
    @keyframes msgPop {
      0% { opacity: 0; transform: scale(0.95); }
      100% { opacity: 1; transform: scale(1); }
    }
    .message.error {
      background: rgba(255, 7, 58, 0.2);
      border-color: var(--red);
      color: #fff;
    }
    .message.success {
      background: rgba(57, 255, 20, 0.2);
      border-color: var(--green);
      color: #fff;
    }
  </style>
  <div class="panel">
    <div id="register-section">
      <h2>REGISTER</h2>
      <form id="register-form">
        <input type="text" id="username-input" placeholder="Enter your username" required>
        <button type="submit">ENTER</button>
      </form>
      <p id="register-message" class="message hidden"></p>
    </div>

    <div id="lobby-section" class="hidden">
      <h2>PLAYER: <span id="display-username"></span></h2>
      <div class="lobby-actions">
        <button id="create-match-btn" class="btn-green">CREATE MATCH</button>
      </div>
      <div id="join-section">
        <h3>JOIN MATCH</h3>
        <input type="text" id="match-id-input" placeholder="Enter match ID">
        <button id="join-match-btn">ENTER</button>
      </div>
      <p id="lobby-message" class="message hidden"></p>
    </div>
  </div>
`;

class RpsLobbyPage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(lobbyTemplate.content.cloneNode(true));
    this._username = null;
    this._gameSocket = null;
  }

  connectedCallback() {
    this._gameSocket = this.closest('rps-app')?.sockets?.game;

    this._username = Session.get();
    if (this._username) this._showLobby();

    this.shadowRoot.getElementById('register-form').addEventListener('submit', (e) => this._register(e));
    this.shadowRoot.getElementById('create-match-btn').addEventListener('click', () => this._createMatch());
    this.shadowRoot.getElementById('join-match-btn').addEventListener('click', () => this._joinMatch());

    if (this._gameSocket) {
      this._gameSocket.on('game:room-match-notifications', (data) => {
        if (data.status === 'error') this._showMessage('lobby-message', data.data.message, 'error');
      });
      this._gameSocket.on('game:room-info-updated', (data) => {
        const matchId = new URLSearchParams(window.location.search).get('matchId');
        if (matchId && data.data) {
          MatchStorage.syncFromServer(matchId, data.data);
          const players = MatchStorage.getPlayers(matchId);
          if (players.length >= 2 && this._username) {
            window.location.href = '/game?matchId=' + matchId + '&username=' + this._username;
          }
        }
      });
    }

    this._setupLogout();
  }

  _showLobby() {
    const registerSection = this.shadowRoot.getElementById('register-section');
    const lobbySection = this.shadowRoot.getElementById('lobby-section');
    registerSection.classList.add('hidden');
    lobbySection.classList.remove('hidden');
    this.shadowRoot.getElementById('display-username').textContent = this._username;

    const hdr = document.getElementById('header-info');
    if (hdr) hdr.classList.remove('hidden');
    const un = document.getElementById('header-username');
    if (un) un.textContent = this._username;
    const lo = document.getElementById('logout-btn');
    if (lo) lo.classList.remove('hidden');

    const sidebar = document.getElementById('global-chat');
    if (sidebar) sidebar.setAttribute('username', this._username);
  }

  async _register(e) {
    e.preventDefault();
    const input = this.shadowRoot.getElementById('username-input');
    const username = input.value.trim();
    if (!username) {
      this._showMessage('register-message', 'Username is required', 'error');
      return;
    }
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }
      this._username = username;
      Session.save(username);
      this._showLobby();
      this._showMessage('register-message', 'Registration successful!', 'success');
    } catch (err) {
      this._showMessage('register-message', err.message, 'error');
    }
  }

  _createMatch() {
    if (!this._username || !this._gameSocket) return;
    this._gameSocket.emit('game:create-match-room', { playerUsername: this._username }, (response) => {
      if (response.status === 'error') {
        this._showMessage('lobby-message', response.data.message, 'error');
      } else {
        const matchId = response.data.gameMatch.id;
        MatchStorage.createMatch(matchId, this._username);
        window.location.href = '/game?matchId=' + matchId + '&username=' + this._username;
      }
    });
  }

  _joinMatch() {
    const input = this.shadowRoot.getElementById('match-id-input');
    const matchId = input.value.trim();
    if (!matchId || !this._username || !this._gameSocket) return;
    MatchStorage.createMatch(matchId, null);
    this._gameSocket.emit('game:join-match-room', { gameMatchId: matchId, playerUsername: this._username }, (response) => {
      if (response.status === 'ok') {
        window.location.href = '/game?matchId=' + matchId + '&username=' + this._username;
      }
    });
  }

  _setupLogout() {
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      if (this._username) {
        try { await fetch('/exit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: this._username }) }); }
        catch (e) { console.error(e); }
      }
      Session.clear();
      window.location.reload();
    });
  }

  _showMessage(id, text, type) {
    const el = this.shadowRoot.getElementById(id);
    if (!el) return;
    el.textContent = text;
    el.className = 'message ' + type;
    setTimeout(() => { el.className = 'message hidden'; }, 3000);
  }
}

customElements.define('rps-lobby-page', RpsLobbyPage);
