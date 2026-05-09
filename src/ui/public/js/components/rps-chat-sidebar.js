const chatTemplate = document.createElement('template');
chatTemplate.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: transparent;
      font-family: 'Rajdhani', sans-serif;
    }
    .chat-header {
      padding: 1.2rem 1rem;
      font-size: 1.2rem;
      font-weight: 900;
      color: var(--accent);
      text-transform: uppercase;
      letter-spacing: 3px;
      border-bottom: 2px solid var(--border-color);
      flex-shrink: 0;
      background: rgba(0, 0, 0, 0.4);
      font-family: 'Orbitron', sans-serif;
      text-shadow: 0 0 10px var(--accent-glow);
    }
    .chat-messages {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
      min-height: 0;
    }
    .chat-messages::-webkit-scrollbar { width: 4px; }
    .chat-messages::-webkit-scrollbar-thumb { background: rgba(0, 240, 255, 0.5); border-radius: 0; }
    .chat-messages:empty::after {
      content: 'NO COMMS DATA';
      display: block;
      text-align: center;
      color: var(--text-muted);
      font-size: 1rem;
      font-weight: 600;
      padding: 3rem 0;
      text-transform: uppercase;
      letter-spacing: 2px;
      font-family: 'Orbitron', sans-serif;
    }
    .chat-input-row {
      display: flex;
      gap: 0.6rem;
      padding: 1rem;
      border-top: 2px solid var(--border-color);
      flex-shrink: 0;
      background: rgba(0, 0, 0, 0.4);
    }
    .chat-input-row input {
      flex: 1;
      padding: 0.7rem 0.9rem;
      font-size: 1rem;
      border: 2px solid rgba(0, 240, 255, 0.3);
      background: rgba(0, 0, 0, 0.6);
      color: var(--accent);
      font-family: 'Rajdhani', sans-serif;
      font-weight: 600;
      outline: none;
      transition: all 0.2s;
      clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    }
    .chat-input-row input:focus { 
      border-color: var(--accent);
      box-shadow: inset 0 0 10px var(--accent-glow);
      background: rgba(0, 240, 255, 0.1);
    }
    .chat-input-row input::placeholder { color: rgba(0, 240, 255, 0.3); }
    .chat-send-btn {
      padding: 0.7rem 1.2rem;
      font-size: 0.9rem;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
      border: 2px solid var(--accent);
      background: rgba(0, 240, 255, 0.1);
      color: var(--accent);
      cursor: pointer;
      font-family: 'Orbitron', sans-serif;
      transition: all 0.2s;
      clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
    }
    .chat-send-btn:hover {
      background: var(--accent);
      color: #000;
      box-shadow: 0 0 20px var(--accent-glow);
    }
    .chat-send-btn:active { transform: scale(0.95); }
    .chat-msg {
      font-size: 1rem;
      line-height: 1.5;
      padding: 0.6rem 0.8rem;
      border: 1px solid rgba(0, 240, 255, 0.2);
      background: rgba(0, 0, 0, 0.5);
      animation: msgIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
      font-weight: 600;
    }
    @keyframes msgIn {
      0% { opacity: 0; transform: translateY(10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    .chat-msg.self { 
      border-color: var(--accent); 
      background: rgba(0, 240, 255, 0.1); 
    }
    .chat-msg-user { 
      color: var(--accent); 
      font-weight: 900; 
      margin-right: 0.5rem; 
      text-transform: uppercase; 
      font-size: 0.8rem; 
      letter-spacing: 1px;
      font-family: 'Orbitron', sans-serif;
    }
    .chat-msg.self .chat-msg-user { color: var(--green); }
    .chat-msg-text { color: var(--text-primary); }
    .chat-msg-time { float: right; color: var(--text-muted); font-size: 0.75rem; margin-left: 0.4rem; font-weight: 700; font-family: 'Orbitron', sans-serif; }
  </style>
  <div class="chat-header" id="chat-header">CHAT</div>
  <div class="chat-messages" id="chat-messages"></div>
  <div class="chat-input-row">
    <input type="text" id="chat-input" placeholder="Type a message..." maxlength="200">
    <button class="chat-send-btn" id="chat-send">SEND</button>
  </div>
`;

class RpsChatSidebar extends HTMLElement {
  static get observedAttributes() {
    return ['match-id', 'username'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(chatTemplate.content.cloneNode(true));
    this._chatSocket = null;
    this._matchId = null;
    this._username = null;
    this._messages = [];
    this._ready = false;
  }

  connectedCallback() {
    this._matchId = this.getAttribute('match-id') || null;
    this._username = this.getAttribute('username');

    const header = this.shadowRoot.getElementById('chat-header');
    header.textContent = this._matchId ? 'MATCH CHAT' : 'GLOBAL CHAT';

    const input = this.shadowRoot.getElementById('chat-input');
    const sendBtn = this.shadowRoot.getElementById('chat-send');

    sendBtn.addEventListener('click', () => this._send());
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') this._send(); });

    this._ready = true;
    if (this._username) this._connect();
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return;
    if (name === 'match-id') {
      this._matchId = newVal || null;
    } else if (name === 'username') {
      this._username = newVal;
    }
    if (this._ready) {
      this._disconnect();
      this._connect();
    }
  }

  _disconnect() {
    if (this._chatSocket) {
      this._chatSocket.off('sync-package');
      this._chatSocket.off('general:new-message');
      this._chatSocket.off('match:new-message');
    }
    this._chatSocket = null;
  }

  _connect() {
    const app = this.closest('rps-app');
    if (!app) return;
    this._chatSocket = app.sockets.chat;
    if (!this._chatSocket) return;

    const header = this.shadowRoot.getElementById('chat-header');
    header.textContent = this._matchId ? 'MATCH CHAT' : 'GLOBAL CHAT';

    const room = this._matchId ? 'match-' + this._matchId : 'general';
    if (this._matchId) {
      this._chatSocket.emit('match:join', { payload: { matchId: this._matchId } });
    }
    this._chatSocket.emit('sync', { payload: { room } });

    this._chatSocket.on('sync-package', (msgs) => this._onHistory(msgs));
    this._chatSocket.on('general:new-message', (data) => {
      if (!this._matchId) this._onMessage(data);
    });
    this._chatSocket.on('match:new-message', (data) => {
      if (this._matchId) this._onMessage(data);
    });
  }

  _onHistory(messages) {
    if (!Array.isArray(messages)) return;
    this._messages = messages.map((m) => ({
      username: m.sender,
      message: m.message,
      timestamp: null,
    }));
    this._render();
  }

  _onMessage(data) {
    this._messages.push({
      username: data.username,
      message: data.message,
      timestamp: Date.now(),
    });
    this._render();
  }

  _send() {
    const input = this.shadowRoot.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !this._chatSocket) return;

    if (this._matchId) {
      this._chatSocket.emit('match:message-send', {
        payload: { username: this._username, message: text, matchId: this._matchId },
      });
    } else {
      this._chatSocket.emit('general:send-message', {
        payload: { username: this._username, message: text },
      });
    }
    input.value = '';
  }

  _render() {
    const container = this.shadowRoot.getElementById('chat-messages');
    container.innerHTML = '';
    (this._messages || []).forEach((msg) => {
      const div = document.createElement('div');
      div.className = 'chat-msg' + (msg.username === this._username ? ' self' : '');
      div.innerHTML = '<span class="chat-msg-user">' + esc(msg.username) + '</span>'
        + '<span class="chat-msg-text">' + esc(msg.message) + '</span>'
        + '<span class="chat-msg-time">' + fmt(msg.timestamp) + '</span>';
      container.appendChild(div);
    });
    container.scrollTop = container.scrollHeight;
  }
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function fmt(ts) { if (!ts) return ''; const d = new Date(ts); return String(d.getHours()).padStart(2,'0') + ':' + String(d.getMinutes()).padStart(2,'0'); }

customElements.define('rps-chat-sidebar', RpsChatSidebar);
