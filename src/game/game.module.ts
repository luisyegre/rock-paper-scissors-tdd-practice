import { Module } from '@nestjs/common';
import { PlayerCreationService } from './services/player_creation.service';
import { PlayerRepository } from './repositories/player.repository';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameMatchService } from './services/gamematch.service';
import { GameMatchRepository } from './repositories/gamematch.repository';
import { GameRoomNotifier } from './game_room_notifier.gateway';
import { ChatModule } from 'src/chat/chat.module';

@Module({
  providers: [
    GameGateway,
    PlayerCreationService,
    PlayerRepository,
    PlayerCreationService,
    GameMatchService,
    GameMatchRepository,
    GameRoomNotifier,
  ],
  controllers: [GameController],
  imports: [ChatModule],
})
export class GameModule {}
