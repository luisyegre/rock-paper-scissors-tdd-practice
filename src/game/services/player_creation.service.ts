import { BadRequestException, Injectable } from '@nestjs/common';
import { PlayerRepository } from '../repositories/player.repository';
import { Player } from '../entities/player.entity';

@Injectable()
export class PlayerCreationService {
  constructor(private playerRepository: PlayerRepository) {}
  async create(username: string): Promise<Player> {
    if (!username)
      throw new BadRequestException('player username not provided');

    const existingUser = await this.playerRepository.findByUsername(username);
    if (existingUser)
      throw new BadRequestException(
        'player with username ' + username + ' already registered',
      );
    const player = await this.playerRepository.create(username);
    return player;
  }
  remove(username: string) {
    return this.playerRepository.findUserAndRemove(username);
  }
}
