import { GameRound } from './gameround.entity';
import { Player } from './player.entity';

export class GameMatch {
  rounds: GameRound[] = [];
  constructor(
    readonly id: string,
    private matchRounds: number,
    private player1?: Player,
    private player2?: Player,
  ) {}
  addPlayerOne(player: Player): GameMatch {
    this.player1 = player;
    return this;
  }
  addPlayerTwo(player: Player): GameMatch {
    this.player2 = player;
    return this;
  }
  addMatchRounds(rounds: number): GameMatch {
    this.matchRounds = rounds;
    return this;
  }
  oneMoreRound() {
    this.matchRounds += 1;
  }
  playRound() {
    if (this.rounds.length >= this.matchRounds)
      throw new Error(`Cannot play more than ${this.matchRounds} rounds`);
    if (this.player1 == undefined || this.player2 == undefined)
      throw new Error(`Cannot play whitout players`);

    const round = new GameRound(
      new Player(this.player1.username, this.player1.choice),
      new Player(this.player2.username, this.player2.choice),
    );
    this.player1.cleanChoice();
    this.player2.cleanChoice();
    round.defineWinner();
    this.rounds.push(round);
  }
  canPlayRound(): boolean {
    return (
      this.player1?.choice != undefined && this.player2?.choice != undefined
    );
  }
  get winner() {
    let p1Score = 0;
    let p2Score = 0;
    this.rounds.forEach((round) => {
      if (this.player1 == undefined || this.player2 == undefined)
        throw new Error(`Cannot play whitout players`);
      if (
        round.winner != null &&
        round.winner.username == this.player1.username
      )
        p1Score++;
      if (
        round.winner != null &&
        round.winner.username == this.player2.username
      )
        p2Score++;
    });
    if (p1Score == p2Score) return null;
    if (p1Score > p2Score) return this.player1;
    else return this.player2;
  }
  get info() {
    return {
      id: this.id,
      master: this.player1?.username,
      players: [this.player2?.username],
      rounds: {
        played: this.rounds.length,
        results: this.rounds.map((round) => round.winner?.username),
      },
    };
  }
}
