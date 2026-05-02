import { Choice } from '../enums/choice.enum';
import { Player } from './player.entity';

export class GameRound {
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
      throw new Error('Player should have a choice');

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
