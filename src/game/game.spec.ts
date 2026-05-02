import { GameMatch } from './entities/gamematch.entity';
import { GameRound } from './entities/gameround.entity';
import { Player } from './entities/player.entity';
import { Choice } from './enums/choice.enum';

describe('Game', () => {
  let player1: Player;
  let player2: Player;
  let match: GameMatch;
  let rounds: number;
  beforeAll(() => {
    player1 = new Player('luis');
    player2 = new Player('hector');
  });
  beforeEach(() => {
    rounds = 3;
    player1.setChoice(Choice.ROCK);
    player2.setChoice(Choice.ROCK);
    match = new GameMatch('uuid', rounds, player1, player2);
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
    it('Should not fail if the round number is increments', () => {
      match.playRound();
      match.playRound();
      match.playRound();
      match.oneMoreRound();
      match.playRound();
    });
    it('Should get a winner', () => {
      player1.setChoice(Choice.PAPER);
      player2.setChoice(Choice.ROCK);

      match.playRound();

      player1.setChoice(Choice.ROCK);
      player2.setChoice(Choice.PAPER);

      match.playRound();

      player1.setChoice(Choice.SCISSORS);
      player2.setChoice(Choice.PAPER);

      match.playRound();

      expect(match.winner?.username).toBe('luis');
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
      expect(winner?.username).toBe('luis');
    });
    test('Scissors should win paper', () => {
      player1.setChoice(Choice.SCISSORS);
      player2.setChoice(Choice.PAPER);
      const winner = new GameRound(player1, player2).defineWinner();
      expect(winner?.username).toBe('luis');
    });

    test('Paper should win rock', () => {
      player1.setChoice(Choice.PAPER);
      player2.setChoice(Choice.ROCK);
      const winner = new GameRound(player1, player2).defineWinner();
      expect(winner?.username).toBe('luis');
    });
    test('Player 2 should win', () => {
      player1.setChoice(Choice.ROCK);
      player2.setChoice(Choice.PAPER);
      const winner = new GameRound(player1, player2).defineWinner();
      expect(winner?.username).toBe('hector');
    });
  });
});
