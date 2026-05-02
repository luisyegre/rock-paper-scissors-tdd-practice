import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { Player } from './game/entities/player.entity';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('/register')
  registerPlayer(@Body() { username }: { username: string }) {
    const player = new Player(username);
    this.appService.createPlayer(player);
  }
}
