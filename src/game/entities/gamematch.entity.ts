import { GameRound } from './gameround.entity';
import { Player } from './player.entity';

export class GameMatch {
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

    const round = new GameRound(
      new Player(this.player1.username, this.player1.choice),
      new Player(this.player2.username, this.player2.choice),
    );
    round.defineWinner();
    this.rounds.push(round);
  }
  get winner() {
    let p1Score = 0;
    let p2Score = 0;
    this.rounds.forEach((round) => {
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
}
