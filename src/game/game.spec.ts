import { match } from 'node:assert/strict';

enum Choice {
  ROCK = 0,
  PAPER = 1,
  SCISSORS = 2,
}

class Player {
  constructor(private _choice?: Choice) {}
  setChoice(choice: Choice) {
    this._choice = choice;
  }
  get choice() {
    return this._choice;
  }
}
class GameRound {
  private _winner: Player | null;
  constructor(
    private player1: Player,
    private player2: Player,
  ) {}
  defineWinner() {
    const winCases = {
      [Choice.ROCK]: Choice.SCISSORS,
      [Choice.PAPER]: Choice.ROCK,
      [Choice.SCISSORS]: Choice.PAPER,
    };
    if (this.player1.choice == undefined || this.player2.choice == undefined)
      throw new Error('Player should have a coise');

    if (this.player1.choice == this.player2.choice) this._winner = null;
    else if (this.player2.choice == winCases[this.player1.choice])
      this._winner = this.player1;
    else this._winner = this.player2;

    return this._winner;
  }
  get winner() {
    return this._winner;
  }
}

class GameMatch {
  rounds: GameRound[] = [];
  constructor(
    readonly player1: Player,
    readonly player2: Player,
    private matchRounds: number,
  ) {}
  oneMoreRound() {
    this.matchRounds += 1;
  }
  playRound() {
    if (this.rounds.length >= this.matchRounds)
      throw new Error(`Cannot play more than ${this.matchRounds} rounds`);

    const round = new GameRound(this.player1, this.player2);
    round.defineWinner();
    this.rounds.push(round);
  }
  get winner() {
    const state = new Map();
    this.rounds.forEach((round) => {
      if (state.get(round.winner) == undefined) state.set(round.winner, 0);
      else state.set(round.winner, state.get(round.winner) + 1);
    });
    if (state.get(this.player1) == state.get(this.player2)) return null;
    if (state.get(this.player1) > state.get(this.player2)) return this.player1;
    else return this.player2;
  }
}

describe('Game', () => {
  let player1: Player;
  let player2: Player;
  let match: GameMatch;
  let rounds: number;
  beforeAll(() => {
    player1 = new Player();
    player2 = new Player();
  });
  beforeEach(() => {
    rounds = 3;
    player1.setChoice(Choice.ROCK);
    player2.setChoice(Choice.ROCK);
    match = new GameMatch(player1, player2, rounds);
  });
  describe('Match', () => {
    it('Should fail if try to play a round whithout inccrement it', () => {
      expect.assertions(1);
      try {
        match.playRound();
        match.playRound();
        match.playRound();
        match.playRound();
      } catch (error) {
        expect(error.message).toMatch(/rounds/);
      }
    });
  });
  describe('Round', () => {
    test('Winner should be null when p1 and p2 choice the same', () => {
      player1.setChoice(Choice.ROCK);
      player2.setChoice(Choice.ROCK);
      const winner = new GameRound(player1, player2).defineWinner();
      expect(winner).toBe(null);
    });
    test('Rock should win scissors', () => {
      player2.setChoice(Choice.SCISSORS);
      const winner = new GameRound(player1, player2).defineWinner();
      expect(winner).toBe(player1);
    });
    test('Scissors should win paper', () => {
      player1.setChoice(Choice.SCISSORS);
      player2.setChoice(Choice.PAPER);
      const winner = new GameRound(player1, player2).defineWinner();
      expect(winner).toBe(player1);
    });

    test('Paper should win rock', () => {
      player1.setChoice(Choice.PAPER);
      player2.setChoice(Choice.ROCK);
      const winner = new GameRound(player1, player2).defineWinner();
      expect(winner).toBe(player1);
    });
    test('Player 2 should win', () => {
      player1.setChoice(Choice.ROCK);
      player2.setChoice(Choice.PAPER);
      const winner = new GameRound(player1, player2).defineWinner();
      expect(winner).toBe(player2);
    });
  });
});
