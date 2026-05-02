const Session = {
  KEY: 'rps_session',

  save(username) {
    localStorage.setItem(this.KEY, JSON.stringify({ username, createdAt: Date.now() }));
  },

  get() {
    try {
      const data = JSON.parse(localStorage.getItem(this.KEY));
      return data && data.username ? data.username : null;
    } catch {
      return null;
    }
  },

  clear() {
    localStorage.removeItem(this.KEY);
  },
};

if (typeof window !== 'undefined') {
  window.Session = Session;
}
