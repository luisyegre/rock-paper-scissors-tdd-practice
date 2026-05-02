import { Injectable } from '@nestjs/common';
import { Player } from '../entities/player.entity';
import { GameMatch } from '../entities/gamematch.entity';
import { v4 as uuidv4 } from 'uuid';
import { rejects } from 'node:assert/strict';

@Injectable()
export class GameMatchRepository {
  gameMatches: Map<string, GameMatch> = new Map();
  create(creator: Player, rounds = 3): Promise<GameMatch> {
    return new Promise((resolve) => {
      const id = uuidv4();
      const gameMatch = new GameMatch(id, rounds);
      this.gameMatches.set(gameMatch.id, gameMatch);
      gameMatch.addPlayerOne(creator);
      resolve(gameMatch);
    });
  }
  async updatePlayerOne(id: string, player: Player) {
    const gameMatch = await this.findOrFail(id);
    gameMatch?.addPlayerOne(player);
  }
  async updatePlayerTwo(id: string, player: Player) {
    const gameMatch = await this.findOrFail(id);
    gameMatch?.addPlayerTwo(player);
  }
  find(id: string): Promise<GameMatch | null> {
    return new Promise((resolve) => {
      const gameMatch = this.gameMatches.get(id);
      resolve(gameMatch || null);
    });
  }
  findOrFail(id: string): Promise<GameMatch> {
    return new Promise((resolve, reject) => {
      const gameMatch = this.gameMatches.get(id);
      if (!gameMatch) return reject(new Error('game match does not exist'));
      return resolve(gameMatch);
    });
  }
}
