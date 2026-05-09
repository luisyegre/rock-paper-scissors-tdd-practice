const appTemplate = document.createElement('template');
appTemplate.innerHTML = `
  <style>
    :host {
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
      background: var(--bg-primary, #050508);
      position: relative;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.4) 100%);
      border-bottom: 2px solid var(--border-color);
      box-shadow: 0 4px 20px rgba(0, 240, 255, 0.1);
      z-index: 10;
    }
    .brand {
      font-size: 1.5rem;
      font-weight: 900;
      color: var(--accent, #00f0ff);
      text-transform: uppercase;
      letter-spacing: 4px;
      text-shadow: 0 0 15px var(--accent-glow);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .brand::before {
      content: '▶';
      font-size: 1rem;
      color: var(--pink, #ff007f);
      text-shadow: 0 0 10px rgba(255, 0, 127, 0.8);
    }
    .container {
      display: grid;
      grid-template-columns: 350px 1fr;
      flex: 1;
      overflow: hidden;
    }
    .sidebar {
      background: rgba(5, 5, 10, 0.8);
      border-right: 2px solid var(--border-color);
      display: flex;
      flex-direction: column;
      box-shadow: 5px 0 25px rgba(0, 0, 0, 0.8);
      z-index: 5;
    }
    .main-content {
      position: relative;
      overflow-y: auto;
      padding: 2rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    @media (max-width: 900px) {
      .container {
        grid-template-columns: 1fr;
        grid-template-rows: 1fr 300px;
      }
      .sidebar {
        border-right: none;
        border-top: 2px solid var(--border-color);
        order: 2; /* chat goes to bottom on mobile */
      }
      .main-content {
        padding: 1rem;
        order: 1;
      }
    }
  </style>
  <header>
    <div class="brand">
      <slot name="header-logo">RPS ARENA</slot>
    </div>
    <div style="flex: 1;"></div>
    <slot name="header-info"></slot>
    <div style="display:flex; gap:1rem; align-items:center; margin-left: 1rem;">
      <slot name="header-actions"></slot>
    </div>
  </header>
  <div class="container">
    <div class="sidebar">
      <slot name="sidebar"></slot>
    </div>
    <div class="main-content">
      <slot name="main"></slot>
    </div>
  </div>
`;

class RpsApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(appTemplate.content.cloneNode(true));
    this.gameSocket = io('/game');
    this.chatSocket = io('/chat');
  }

  get sockets() {
    return { game: this.gameSocket, chat: this.chatSocket };
  }
}

customElements.define('rps-app', RpsApp);
