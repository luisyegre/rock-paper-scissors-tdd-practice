import { Injectable } from '@nestjs/common';
import { GameMatch } from '../entities/gamematch.entity';
// import { Player } from '../entities/player.entity';
import { GameMatchRepository } from '../repositories/gamematch.repository';
import { PlayerRepository } from '../repositories/player.repository';
import { Choice } from '../enums/choice.enum';

@Injectable()
export class GameMatchService {
  constructor(
    private playerRepository: PlayerRepository,
    private gameMatchRepository: GameMatchRepository,
  ) {}
  getGameMatch(id: string) {
    return this.gameMatchRepository.find(id);
  }
  async createMatch(creatorUsername: string): Promise<GameMatch> {
    const playerCreator =
      await this.playerRepository.findByUsername(creatorUsername);
    if (!playerCreator) throw new Error('player is not registered');
    const gameMatch = await this.gameMatchRepository.create(playerCreator);
    return gameMatch;
  }
  async addUserToMatchRoom(username: string, gameMatchId: string) {
    const player = await this.playerRepository.findByUsername(username);
    if (!player) throw new Error('player is not registered');

    const gameMatch = await this.gameMatchRepository.updatePlayerTwo(
      gameMatchId,
      player,
    );
    return gameMatch;
  }
  async setPlayerMove(username: string, choice: Choice) {
    const player = await this.playerRepository.findByUsername(username);
    if (player == null) throw new Error('user not exist');
    player.setChoice(choice);
  }
}
