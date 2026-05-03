import { Choice } from '../enums/choice.enum';

export class Player {
  constructor(
    readonly username: string,
    private _choice?: Choice,
  ) {}
  setChoice(choice: Choice) {
    this._choice = choice;
  }
  cleanChoice() {
    this._choice = undefined;
  }
  get choice() {
    return this._choice;
  }
}
