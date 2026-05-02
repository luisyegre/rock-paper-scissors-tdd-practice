import { Injectable } from '@nestjs/common';
import { Player } from '../entities/player.entity';

@Injectable()
export class PlayerRepository {
  players: Map<string, Player> = new Map();
  create(username: string): Promise<Player> {
    return new Promise((resolve) => {
      const player = new Player(username);
      this.players.set(username, player);
      resolve(player);
    });
  }
  findByUsername(username: string): Promise<Player | null> {
    return new Promise((resolve) => {
      const player = this.players.get(username);
      resolve(player || null);
    });
  }
}
