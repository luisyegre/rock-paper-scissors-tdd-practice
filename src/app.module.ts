import { Module } from '@nestjs/common';
import { GameModule } from './game/game.module';
import { UiModule } from './ui/ui.module';

@Module({
  imports: [GameModule, UiModule],
  controllers: [],
})
export class AppModule {}
