import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { UiModule } from './ui/ui.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [GameModule, UiModule, ChatModule],
  controllers: [],
})
export class AppModule {}
