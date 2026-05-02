import { Choice } from '../enums/choice.enum';

export class Player {
  private _id: string;
  constructor(
    readonly username: string,
    private _choice?: Choice,
  ) {}
  setChoice(choice: Choice) {
    this._choice = choice;
  }
  get choice() {
    return this._choice;
  }
}
