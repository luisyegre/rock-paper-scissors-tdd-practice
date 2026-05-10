const lobbyTemplate = document.createElement('template');
lobbyTemplate.innerHTML = `
  <style>
    * { box-sizing: border-box; }
    :host {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 0;
      font-family: 'Rajdhani', sans-serif;
    }
    .hidden { display: none !important; }

    /* ── LOGIN SCREEN ── */
    #register-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: fixed;
      inset: 0;
      z-index: 99999;
      background: var(--bg-primary, #050508);
      background-image: repeating-linear-gradient(45deg, #050508, #050508 10px, #0a0a10 10px, #0a0a10 20px);
    }
    .login-box {
      border: 2px solid var(--border-color);
      background: rgba(10, 10, 20, 0.85);
      box-shadow: 0 0 40px rgba(0,240,255,0.15), inset 0 0 30px rgba(0,240,255,0.04);
      padding: 3rem 2.5rem 2.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1.5rem;
      width: min(380px, 90vw);
      clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px);
      position: relative;
    }
    .login-box::before {
      content: '';
      position: absolute;
      top: 0; left: 0; width: 100%; height: 3px;
      background: var(--accent);
      box-shadow: 0 0 12px var(--accent-glow);
    }
    .login-title {
      font-family: 'Orbitron', sans-serif;
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-muted);
      letter-spacing: 3px;
      text-align: center;
    }
    .login-input {
      width: 100%;
      padding: 0.9rem 1rem;
      background: rgba(0,0,0,0.6);
      border: 1px solid rgba(0,240,255,0.3);
      border-left: 3px solid var(--accent);
      color: var(--accent);
      font-family: 'Rajdhani', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      outline: none;
      transition: all 0.2s;
    }
    .login-input:focus {
      border-color: var(--accent);
      background: rgba(0,240,255,0.05);
      box-shadow: inset 0 0 10px rgba(0,240,255,0.1);
    }
    .login-input::placeholder { color: rgba(0,240,255,0.35); }
    .login-btn {
      width: 100%;
      padding: 0.9rem;
      background: rgba(0,240,255,0.08);
      border: 2px solid var(--accent);
      color: var(--accent);
      font-family: 'Orbitron', sans-serif;
      font-size: 0.9rem;
      font-weight: 900;
      letter-spacing: 3px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
      clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    }
    .login-btn:hover {
      background: var(--accent);
      color: #000;
      box-shadow: 0 0 25px var(--accent-glow);
    }
    .login-btn:active { transform: scale(0.97); }
    .login-dots {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .login-dots span {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: var(--accent);
      opacity: 0.3;
      animation: dotPulse 1.5s ease-in-out infinite;
    }
    .login-dots span:nth-child(2) { animation-delay: 0.3s; }
    .login-dots span:nth-child(3) { animation-delay: 0.6s; }
    @keyframes dotPulse { 0%,100%{opacity:0.2;} 50%{opacity:1;} }

    /* ── LOBBY SECTION ── */
    #lobby-section {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      min-height: 0;
      overflow-y: auto;
      padding: 1.5rem;
      gap: 1rem;
      align-items: flex-start;
    }

    .field-label {
      font-family: 'Orbitron', sans-serif;
      font-size: 0.7rem;
      color: var(--text-muted);
      letter-spacing: 2px;
      margin-bottom: 0.35rem;
    }
    .field-row {
      display: flex;
      gap: 0.5rem;
      width: 100%;
    }
    .text-input {
      flex: 1;
      padding: 0.7rem 0.9rem;
      background: rgba(0,0,0,0.6);
      border: 1px solid rgba(0,240,255,0.25);
      border-left: 3px solid var(--accent);
      color: var(--accent);
      font-family: 'Rajdhani', sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      outline: none;
      transition: all 0.2s;
      min-width: 0;
    }
    .text-input:focus {
      border-color: var(--accent);
      background: rgba(0,240,255,0.05);
    }
    .text-input::placeholder { color: rgba(0,240,255,0.3); }

    .action-btn {
      padding: 0.7rem 1.2rem;
      background: rgba(0,240,255,0.08);
      border: 1px solid var(--accent);
      color: var(--accent);
      font-family: 'Orbitron', sans-serif;
      font-size: 0.75rem;
      font-weight: 900;
      letter-spacing: 2px;
      text-transform: uppercase;
      cursor: pointer;
      transition: all 0.2s;
      clip-path: polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px);
      white-space: nowrap;
      flex-shrink: 0;
    }
    .action-btn:hover { background: var(--accent); color: #000; box-shadow: 0 0 15px var(--accent-glow); }
    .action-btn:active { transform: scale(0.96); }
    .action-btn.green { border-color: var(--green); color: var(--green); background: rgba(57,255,20,0.08); }
    .action-btn.green:hover { background: var(--green); color: #000; box-shadow: 0 0 15px var(--green-glow); }
    .action-btn.full { width: 100%; justify-content: center; display: flex; }

    .divider {
      width: 100%;
      border: none;
      border-top: 1px solid rgba(0,240,255,0.15);
      margin: 0.25rem 0;
    }

    .message {
      padding: 0.6rem 0.9rem;
      border: 1px solid;
      font-size: 0.85rem;
      font-weight: 700;
      font-family: 'Orbitron', sans-serif;
      letter-spacing: 1px;
      animation: msgPop 0.3s forwards;
      width: 100%;
    }
    @keyframes msgPop { from{opacity:0;transform:translateY(-5px);}to{opacity:1;transform:none;} }
    .message.error { background: rgba(255,7,58,0.15); border-color: var(--red); color: var(--red); }
    .message.success { background: rgba(57,255,20,0.15); border-color: var(--green); color: var(--green); }
  </style>

  <!-- LOGIN -->
  <div id="register-section">
    <div class="login-dots">
      <span></span><span></span><span></span>
    </div>
    <div class="login-box">
      <div class="login-title">INGRESA TU NOMBRE</div>
      <input class="login-input" type="text" id="username-input" placeholder="nombre de usuario" maxlength="24" required autocomplete="off">
      <button class="login-btn" id="register-btn">JUGAR AHORA</button>
      <p id="register-message" class="message hidden"></p>
    </div>
  </div>

  <!-- LOBBY -->
  <div id="lobby-section" class="hidden">

    <div class="field-label">ENTER MATCH ID</div>
    <div class="field-row">
      <input class="text-input" type="text" id="match-id-input" placeholder="xxxxxxxx-xxxx-xxxx-xxxx">
      <button class="action-btn" id="join-match-btn">ENTER</button>
    </div>

    <hr class="divider">

    <button class="action-btn green full" id="create-match-btn">CREAR MATCH</button>

    <hr class="divider">

    <div class="field-label">NOMBRE DE SALA</div>
    <div class="field-row">
      <input class="text-input" type="text" id="room-name-input" placeholder="nombre de sala">
    </div>

    <div class="field-label" style="margin-top:0.5rem;">SALAS DISPONIBLES</div>
    <div id="rooms-list" style="width:100%;display:flex;flex-direction:column;gap:0.4rem;flex:1;overflow-y:auto;">
      <div style="color:var(--text-muted);font-size:0.85rem;font-family:'Orbitron',sans-serif;letter-spacing:1px;padding:0.5rem 0;">SIN SALAS ACTIVAS</div>
    </div>

    <p id="lobby-message" class="message hidden"></p>
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

    this.shadowRoot.getElementById('register-btn').addEventListener('click', () => this._register());
    this.shadowRoot.getElementById('username-input').addEventListener('keydown', (e) => { if (e.key === 'Enter') this._register(); });
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
    this.shadowRoot.getElementById('register-section').classList.add('hidden');
    this.shadowRoot.getElementById('lobby-section').classList.remove('hidden');

    const hdr = document.getElementById('header-info');
    if (hdr) { hdr.classList.remove('hidden'); document.getElementById('header-username').textContent = this._username; }
    const lo = document.getElementById('logout-btn');
    if (lo) lo.classList.remove('hidden');

    const sidebar = document.getElementById('global-chat');
    if (sidebar) sidebar.setAttribute('username', this._username);
  }

  async _register() {
    const input = this.shadowRoot.getElementById('username-input');
    const username = input.value.trim();
    if (!username) { this._showMessage('register-message', 'Nombre requerido', 'error'); return; }
    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.message); }
      this._username = username;
      Session.save(username);
      this._showLobby();
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
    setTimeout(() => { el.className = 'message hidden'; }, 3500);
  }
}

customElements.define('rps-lobby-page', RpsLobbyPage);
