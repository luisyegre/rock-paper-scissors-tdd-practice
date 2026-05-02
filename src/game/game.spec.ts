enum Choise {
  ROCK = 0,
  PAPER = 1,
  SCISSOR = 2,
}

class Player {
  constructor(private _choise?: Choise) {}
  setChoice(choise: Choise) {
    this._choise = choise;
  }
  get choise() {
    return this._choise;
  }
}
// interface GameRoundResult {

// }
class GameRound {
  constructor(private gameMatch: GameMatch) {}
  defineWinner() {
    const winCases = {
      [Choise.ROCK]: Choise.SCISSOR,
      [Choise.PAPER]: Choise.ROCK,
      [Choise.SCISSOR]: Choise.PAPER,
    };
    if (
      this.gameMatch.player1.choise == undefined ||
      this.gameMatch.player2.choise == undefined
    ) {
      throw new Error('Players shuld have a choise');
    }
    if (this.gameMatch.player1.choise == this.gameMatch.player2.choise)
      return null;
    if (
      this.gameMatch.player2.choise === winCases[this.gameMatch.player1.choise]
    )
      return this.gameMatch.player1;
    else return this.gameMatch.player2;
  }
}

class GameMatch {
  constructor(
    readonly player1: Player,
    readonly player2: Player,
  ) {}
  // playRound() {
  //   const round = new GameRound(this);
  //   const winner = round.defineWinner();
  // }
}

describe('Game', () => {
  let player1: Player;
  let player2: Player;

  beforeAll(() => {
    player1 = new Player(Choise.ROCK);
    player2 = new Player(Choise.SCISSOR);
  });
  it('Should have two players', () => {
    expect(player1).toBeDefined();
    expect(player2).toBeDefined();
  });
  test('Players should have a choice', () => {
    expect(player1.choise).toBeDefined();
    expect(player2.choise).toBeDefined();
  });
  test('Rock should win scissors', () => {
    const round = new GameRound(new GameMatch(player1, player2));
    const winner = round.defineWinner();
    expect(winner).toBe(player1);
  });
});
