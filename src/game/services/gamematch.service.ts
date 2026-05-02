import { Injectable } from '@nestjs/common';
import { GameMatch } from '../entities/gamematch.entity';
// import { Player } from '../entities/player.entity';
import { GameMatchRepository } from '../repositories/gamematch.repository';
import { PlayerRepository } from '../repositories/player.repository';

@Injectable()
export class GameMatchService {
  constructor(
    private playerRepository: PlayerRepository,
    private gameMatchRepository: GameMatchRepository,
  ) {}
  async create(creatorUsername: string): Promise<GameMatch> {
    const playerCreator =
      await this.playerRepository.findByUsername(creatorUsername);
    if (!playerCreator) throw new Error('player not registered');

    const gameMatch = await this.gameMatchRepository.create(playerCreator);
    return gameMatch;
  }
}
