import { Injectable } from '@nestjs/common';
import { Player } from '../entities/player.entity';

@Injectable()
export class PlayerRepository {
  players: Map<string, Player>;
  create(username: string): Promise<Player> {
    return new Promise((resolve) => {
      const player = new Player(username);
      this.players.set(username, player);
      resolve(player);
    });
  }
  findByUsername(username: string): Promise<Player> {
    return new Promise((resolve, reject) => {
      const player = this.players.get(username);
      if (player === undefined) reject(new Error('player not found'));
      else resolve(player);
    });
  }
}
