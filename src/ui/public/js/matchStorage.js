const MatchStorage = {
  matches: new Map(),

  createMatch(matchId, creatorUsername) {
    const existing = this.matches.get(matchId);
    if (existing) return existing;

    const matchState = {
      id: matchId,
      master: creatorUsername || null,
      player1: null,
      player2: null,
      roundsPlayed: 0,
      roundResults: [],
      isPlaying: false,
    };
    this.matches.set(matchId, matchState);
    return matchState;
  },

  getMatch(matchId) {
    return this.matches.get(matchId);
  },

  syncFromServer(matchId, serverInfo) {
    const match = this.matches.get(matchId);
    if (!match) return null;

    match.master = serverInfo.master;
    match.player1 = serverInfo.master;
    match.player2 = serverInfo.players && serverInfo.players[0] ? serverInfo.players[0] : null;

    if (serverInfo.rounds) {
      match.roundsPlayed = serverInfo.rounds.played || 0;
    }

    match.isPlaying = match.player1 !== null && match.player2 !== null;

    return match;
  },

  addPlayer(matchId, username) {
    const match = this.matches.get(matchId);
    if (!match) return null;

    if (match.player1 && match.player1 === username) return match;
    if (match.player2 && match.player2 === username) return match;

    if (!match.player1) {
      match.player1 = username;
    } else if (!match.player2) {
      match.player2 = username;
    }

    if (match.player1 && match.player2) {
      match.isPlaying = true;
    }

    return match;
  },

  setMaster(matchId, username) {
    const match = this.matches.get(matchId);
    if (!match) return;
    match.master = username;
  },

  getPlayers(matchId) {
    const match = this.matches.get(matchId);
    if (!match) return [];

    const players = [];
    if (match.player1) players.push(match.player1);
    if (match.player2) players.push(match.player2);
    return players;
  },

  getPlayerCount(matchId) {
    const match = this.matches.get(matchId);
    if (!match) return 0;
    let count = 0;
    if (match.player1) count++;
    if (match.player2) count++;
    return count;
  },

  getPlayersInfo(matchId) {
    const match = this.matches.get(matchId);
    if (!match) return [];

    const players = [];
    if (match.player1) {
      players.push({
        username: match.player1,
        isMaster: match.player1 === match.master,
      });
    }
    if (match.player2) {
      players.push({
        username: match.player2,
        isMaster: match.player2 === match.master,
      });
    }
    return players;
  },

  hasPlayer(matchId, username) {
    const match = this.matches.get(matchId);
    if (!match) return false;
    return match.player1 === username || match.player2 === username;
  },

  isPlaying(matchId) {
    const match = this.matches.get(matchId);
    return match && match.isPlaying;
  },
};

if (typeof window !== 'undefined') {
  window.MatchStorage = MatchStorage;
}
