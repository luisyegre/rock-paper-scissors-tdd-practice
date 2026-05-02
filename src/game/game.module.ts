import { Module } from '@nestjs/common';
import { PlayerCreationService } from './services/PlayerCreation.service';
import { PlayerRepository } from './repositories/player.repository';
import { GameController } from './game.controller';

@Module({
  providers: [PlayerCreationService, PlayerRepository],
  controllers: [GameController],
})
export class GameModule {}
